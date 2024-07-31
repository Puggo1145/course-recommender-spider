import puppeteer, { Browser, Page } from "puppeteer";

interface PuppeteerProps {
    url: string;
    useCookie?: boolean;
}

export const getDocumentByPuppeteer = async ({
    url,
    useCookie = false
}: PuppeteerProps) => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 },
    });

    try {
        const page = await browser.newPage();

        console.log("获取课程页面文档");
        await page.goto(url);
        const html = await page.content();
        const cookie = useCookie ? await page.cookies() : null;

        console.log("获取开课期数和教师介绍");
        const studentCount = await getAllStudentCount(page);
        const teachersIntro = await getTeachersInfoV1(browser, page);

        return {
            html,
            studentCount,
            teachersIntro,
            cookie
        };
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

    for (let i = 0; i < liElements.length; i++) {
        // 重新获取li元素
        const liSelector = '.course-enroll-info_course-info_term-select_dropdown ul.ux-dropdown_listview li';
        await page.waitForSelector(liSelector);
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
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        // 在新页面中获取目标文本
        await page.waitForSelector('.course-enroll-info_course-info_term-progress .count');
        const countText = await page.$eval('.course-enroll-info_course-info_term-progress .count', el => el.textContent?.trim());

        console.log(`${term}-${countText}`);

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
            console.log(`正在获取教师：${name}`);


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

            // 获取教师介绍
            await newPage.waitForNetworkIdle();
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

            await newPage.close();
        }

        // 检查是否有下一页按钮
        const nextButton = await page.$('.um-list-slider_next:not(.f-dn)');
        if (!nextButton) break;

        // 点击下一页按钮
        await nextButton.click({ delay: 100 });
    }

    return teachersInfo;
}

/**
 * @param page
 * @returns 教授简介
 * @description 获取课程所有教授的个人简介
 * @deprecated
 */
const getTeachersInfoBySearch = async (page: Page): Promise<Teacher[]> => {
    const teachers: Teacher[] = [];

    // 首先获取所有教师名称
    const getAllTeacherNames = async (): Promise<string[]> => {
        const names: string[] = [];
        while (true) {
            await page.waitForSelector('.m-teachers_teacher-list_wrap .um-list-slider_con_item', { timeout: 10000 });

            const newNames = await page.evaluate(() => {
                const cards = document.querySelectorAll('.m-teachers_teacher-list_wrap .um-list-slider_con_item');
                return Array.from(cards).map(card => card.querySelector('.cnt .f-fc3')?.textContent?.trim() || '');
            });

            names.push(...newNames);

            const nextButton = await page.$('.um-list-slider_next:not(.f-dn)');
            if (!nextButton) break;

            try {
                await Promise.all([
                    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
                    nextButton.click()
                ]);
            } catch (e) {
                console.error(`点击下一页按钮时出错: ${e}`);
                break;
            }
        }
        return names.filter(name => name !== '');
    };

    const teacherNames = await getAllTeacherNames();
    console.log(`共找到 ${teacherNames.length} 位教师`);

    // 为每个教师获取详细信息
    for (const name of teacherNames) {
        console.log(`正在获取教师信息：${name}`);
        teachers.push({ name }); // 先添加名字，后面再更新介绍

        try {
            // 跳转到搜索页面
            await page.goto(`https://www.icourse163.org/search.htm?search=${encodeURIComponent(name)}`, {
                waitUntil: 'networkidle0',
                timeout: 12000
            });

            // 等待并获取搜索结果中的教师链接
            await page.waitForSelector('.search-results-recommend a', { timeout: 10000 });
            const href = await page.evaluate(() => {
                const link = document.querySelector('.search-results-recommend a') as HTMLAnchorElement;
                return link ? link.href : null;
            });

            if (href) {
                console.log("找到教师个人链接：" + href);

                // 跳转到教师详细信息页面
                await page.goto(href, { waitUntil: 'networkidle0', timeout: 30000 });

                // 获取教师介绍
                await page.waitForSelector('.j-teacher-desc', { timeout: 10000 });
                console.log("开始获取介绍");

                const { intro, title } = await page.evaluate(() => {
                    let intro = '';

                    const descElement = document.querySelector('.j-teacher-desc');
                    if (descElement) {
                        const viewAllButton = descElement.querySelector('#j-teacher-desc-all');
                        if (viewAllButton) {
                            (viewAllButton as HTMLElement).click();

                            // await new Promise(resolve => setTimeout(resolve, 1000)); // 等待模态框加载

                            const modalDescElement = document.querySelector('.ux-modal_dialog .ux-modal_bd_ct p');
                            intro = modalDescElement ? modalDescElement.textContent?.trim() || '' : '';
                        } else {
                            intro = descElement.textContent?.trim() || '';
                        }
                    }

                    const titleElement = document.querySelector('.school-desc .tag');
                    const title = titleElement ? titleElement.textContent?.trim() || '' : '';

                    return { intro, title };
                });

                // 更新教师信息
                const index = teachers.findIndex(t => t.name === name);
                if (index !== -1) {
                    teachers[index].intro = intro;
                    teachers[index].title = title;
                }
            } else {
                console.error(`未找到教师 ${name} 的详细信息链接`);
            }

        } catch (error) {
            console.error(`获取教师 ${name} 的信息时出错: ${error}`);
        }
    }

    return teachers;
};