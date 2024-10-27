import puppeteer, { Browser, Page } from "puppeteer";
// constants
import { moocUrls } from "../constants/urls";
// utils
import { parseCookies } from "../utils/cookieStr2Object";
import { calculateSimilarity } from "../utils/calculateSimilarity";

/**
 * @param url 
 * @description 使用课程码的形式获取课程页面文档
 */
export const getDocumentByCourseId = async (
    courseId: string,
    courseType: "default" | "spoc" = "default"
) => {
    const url = (courseType === "default" ? moocUrls.info : moocUrls.spoc) + courseId;

    const browser = await puppeteer.launch({
        // headless: false,
        // defaultViewport: { width: 1920, height: 1080 },
    });

    try {
        const page = await browser.newPage();
        await page.setCookie()

        console.log("获取课程页面文档");
        await page.goto(url);
        const html = await page.content();

        console.log("获取开课期数和教师介绍");
        const studentCount = await getAllStudentCount(page);
        const teachersIntro = await getTeachersInfoV1(browser, page);

        return {
            html,
            studentCount,
            teachersIntro,
        };
    } catch (err) {
        console.error(`获取页面${url}时出错：${(err as Error).name}`);
        return null;
    } finally {
        await browser.close();
    }
}


/**
 * @param name 课程名称
 * @param university 课程所属学校
 * @param cookie 用于登录的 cookie
 * @description 使用搜索的方式获取课程页面文档
 */
export const getCourseIdBySearch = async (
    name: string,
    university: string,
    cookie: string
) => {
    const url = `${moocUrls.searchPage}${encodeURIComponent(name)}`;

    const browser = await puppeteer.launch({
        // headless: false,
        // defaultViewport: { width: 1920, height: 1080 },
    });

    try {
        const page = await browser.newPage();
        const cookieParams = parseCookies(cookie, ".icourse163.org");
        await page.setCookie(...cookieParams);

        await page.goto(url);

        const allCourses = await page.$$('.m-course-list .u-clist');

        let matchedCourse = null;
        for (const course of allCourses) {
            try {
                await page.waitForSelector('.g-mn1 .g-mn1c .cnt .u-course-name', { timeout: 10000 });
                const courseName = await course.$eval(
                    ".g-mn1 .g-mn1c .cnt .u-course-name",
                    el => el.textContent?.trim() || ""
                );

                await page.waitForSelector('.g-mn1 .g-mn1c .cnt .f-nowrp .t21', { timeout: 10000 });
                const universityName = await course.$eval(
                    ".g-mn1 .g-mn1c .cnt .f-nowrp .t21",
                    el => el.textContent?.trim() || ""
                );

                if (courseName === name && universityName === university) {
                    matchedCourse = course;
                    break;
                }
            } catch (error) {
                console.error(`处理课程时出错：${(error as Error).message}`);
            }
        }

        if (!matchedCourse) {
            console.log(`未找到匹配的课程：${name} - ${university}`);
            return null;
        }

        try {
            const linkOnMatch = await matchedCourse.$eval(
                ".g-mn1 .g-mn1c .cnt .first-row a",
                el => el.href.trim().split("?")[0].split("/")
            );

            if (linkOnMatch.includes("spoc")) {
                return linkOnMatch[5]
            } else {
                return linkOnMatch[4];
            }
        } catch (error) {
            console.error(`获取课程ID时出错：${error}`);
            return null;
        }
    } catch (err) {
        if (err instanceof Error) {
            console.error(`获取课程${name}时出错：${err.name}, ${err.message}`);
        }
        return null;
    } finally {
        await browser.close();
    }
}


/**
 * @param name 课程名称
 * @description 获取一门课程的 3-5 门课的关联课程的课程 ID
 */
interface RelatedCourses {
    [key: string]: string[];
}
export const getRelatedCourseIds = async (name: string): Promise<RelatedCourses | null> => {
    const url = `${moocUrls.searchPage}${encodeURIComponent(name)}`;

    const browser = await puppeteer.launch({
        // headless: false,
        // defaultViewport: { width: 1920, height: 1080 },
    });

    try {
        const page = await browser.newPage();
        await page.goto(url);

        const allCourses = await page.$$('.m-course-list .u-clist');

        const relatedCourses: string[] = [];
        for (const course of allCourses) {
            const courseName = await course.$eval(
                ".g-mn1 .g-mn1c .cnt .u-course-name",
                el => el.textContent?.trim() || ""
            );

            const similarity = calculateSimilarity(courseName, name);
            
            
            if (similarity > 0.6) {
                console.log(`找到相似课程 ${courseName}，与 ${name} 的相似度：${similarity}`);
                const linkOnMatch = await course.$eval(
                    ".g-mn1 .g-mn1c .cnt .first-row a",
                    el => el.href.trim().split("?")[0].split("/")
                );

                const courseId = linkOnMatch.includes("spoc") ? linkOnMatch[5] : linkOnMatch[4];
                relatedCourses.push(courseId);

                if (relatedCourses.length >= 5) {
                    break;
                }
            }
        }

        return { [name]: relatedCourses };

    } catch (err) {
        if (err instanceof Error) {
            console.error(`获取课程${name}时出错：${err.name}, ${err.message}`);
        }
        return null;
    } finally {
        await browser.close();
    }
}


/**
 * @param page 
 * @returns 不同开课期数参与的学生人数
 * @description 获取所有开课期次下的参与学生人数
 */
const getAllStudentCount = async (page: Page) => {
    const studentCount = [];

    // 获取所有li元素
    const liElements = await page.$$('.course-enroll-info_course-info_term-select_dropdown ul.ux-dropdown_listview li');
    // 只有一次开课则直接获取参加人数
    if (liElements.length === 0) {
        // 获取li的文本（开课期数）
        await page.waitForSelector('.course-enroll-info_course-info_term-progress .count', { timeout: 100000 });
        const countText = await page.$eval('.course-enroll-info_course-info_term-progress .count', el => el.textContent?.trim());

        studentCount.push({ term: "第1次开课", countText });

        return studentCount;
    }

    // 有多个元素则循环切换页面获取参加人数
    for (let i = 0; i < liElements.length; i++) {
        // 重新获取li元素
        const liSelector = '.course-enroll-info_course-info_term-select_dropdown ul.ux-dropdown_listview li';
        await page.waitForSelector(liSelector, { timeout: 100000 });
        const li = (await page.$$(liSelector))[i];

        // 获取li的文本（开课期数）
        const term = await page.evaluate(el => el.getAttribute('title'), li);

        // 滚动到元素位置并等待元素可交互
        await page.evaluate(el => {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, li);

        // 使用JavaScript点击元素
        await page.evaluate(el => el.click(), li);

        // 等待新页面加载
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 100000 });

        // 在新页面中获取目标文本
        await page.waitForSelector('.course-enroll-info_course-info_term-progress .count', { timeout: 100000 });
        const countText = await page.$eval('.course-enroll-info_course-info_term-progress .count', el => el.textContent?.trim());

        studentCount.push({ term, countText });
    }

    return studentCount;
}


interface Teacher {
    name: string;
    title?: string | null;
    intro?: string | null;
}
/**
 * @param browser
 * @param page: Page
 * @returns 教授简介
 * @description 获取课程所有教授的个人简介
 */
const getTeachersInfoV1 = async (
    browser: Browser,
    page: Page
): Promise<Teacher[]> => {
    const teachersInfo: Teacher[] = [];

    while (true) {
        await page.waitForSelector('.m-teachers_teacher-list_wrap .um-list-slider_con_item', {
            timeout: 10000
        });

        // 获取当前页面上所有的教师卡片
        const teacherCards = await page.$$('.m-teachers_teacher-list_wrap .um-list-slider_con_item');
        for (const card of teacherCards) {
            const name = await card.$eval('.cnt .f-fc3', el => el.textContent?.trim() || '');

            // 等待新标签页打开的 Promise
            const newPagePromise = new Promise<Page>((resolve, reject) => {
                browser.once('targetcreated', async target => {
                    const newPage = await target.page();
                    if (newPage) {
                        resolve(newPage);
                    } else {
                        reject(new Error('新标签页打开失败'));
                    }
                });
            });

            // 获取新标签页
            await card.click({ delay: 100 });
            const newPage = await newPagePromise;
            console.log(`找到 ${name} 详情页面 ${newPage.url()}`);


            try {
                // 获取教师介绍
                await newPage.waitForNetworkIdle({ timeout: 10000 });
                await newPage.waitForSelector('.j-teacher-desc', { timeout: 10000 });

                // 检查是否有“查看全部”按钮
                const hasViewAllButton = await newPage.$('#j-teacher-desc-all') !== null;
                if (hasViewAllButton) {
                    await newPage.click('#j-teacher-desc-all');
                    await newPage.waitForSelector('.ux-modal_dialog .ux-modal_bd_ct', { timeout: 10000 });
                }

                const { intro, title } = await newPage.evaluate(() => {
                    let intro = null;

                    const descElement = document.querySelector('.j-teacher-desc');
                    if (descElement) {
                        if (document.querySelector('.ux-modal_dialog .ux-modal_bd_ct p')) {
                            const modalDescElement = document.querySelector('.ux-modal_dialog .ux-modal_bd_ct p');
                            intro = modalDescElement ? modalDescElement.textContent?.trim() || null : null;
                        } else {
                            intro = descElement.textContent?.trim() || null;
                        }
                    }

                    const titleElement = document.querySelector('.school-desc .tag');
                    const title = titleElement ? titleElement.textContent?.trim() || null : null;

                    return { intro, title };
                });

                teachersInfo.push({ name, intro, title });
            } catch (err) {
                console.error(`获取教师 ${name} 的介绍时出错: ${err}`);
            } finally {
                await newPage.close();
            }
        }

        // 检查是否有下一页按钮
        const nextButton = await page.$('.um-list-slider_next:not(.f-dn)');
        if (!nextButton) break;

        // 点击下一页按钮
        await nextButton.click({ delay: 100 });
    }

    return teachersInfo;
}
