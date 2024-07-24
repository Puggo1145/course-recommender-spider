import * as cheerio from "cheerio";

type Doc = cheerio.Cheerio<cheerio.Element>
interface CourseOutline {
    title: string | null;
    desc: string | null;
    courses: string[] | null;
}
interface Teachers {
    name: string | null;
    title: string | null;
}


// Cheerio 解析器
class MoocHTMLParser {
    private $: cheerio.CheerioAPI;
    private doc: Doc;

    constructor(html: string) {
        this.$ = cheerio.load(html);
        this.doc = this.$("#g-container").find("#g-body");
    }

    // 课程基本信息
    private goToBacisInfo() {
        return this.doc
            .find(".certifiedTop")
            .find(".m-top")
            .find(".g-flow")
            .find(".introCard")
            .find(".course-enroll-info-wrapper")
            .find(".title-wrapper")
    }
    // 获取课程名称
    getName() {
        const basicInfo = this.goToBacisInfo();
        return basicInfo
            .find(".f-cb")
            .find(".course-title-wrapper")
            .find(".course-title")
            .text() ?? null;
    }


    // 课程注册信息
    private goToEnrollInfo() {
        const courseInfo = this.goToBacisInfo();
        return courseInfo
            .find("#course-enroll-info")
            .find(".course-enroll-info")
            .find(".course-enroll-info_course-info")
    }
    // 获取课程学期
    getTerm() {
        const enrollInfo = this.goToEnrollInfo();
        return enrollInfo
            .find(".course-enroll-info_course-info_term-select")
            .find(".course-enroll-info_course-info_term-select_dropdown")
            .find(".f-thide")
            .attr("title") ?? null;
    }
    // 开课时间
    getTermTime() {
        const enrollInfo = this.goToEnrollInfo();
        return enrollInfo
            .find(".course-enroll-info_course-info_term-info")
            .find(".course-enroll-info_course-info_term-info_term-time")
            .find("span").eq(1)
            .text() ?? null;
    }
    // 学时安排
    getWorkLoad() {
        const enrollInfo = this.goToEnrollInfo();
        return enrollInfo
            .find(".course-enroll-info_course-info_term-workload")
            .find("span").eq(1)
            .text() ?? null;
    }
    // 学习人数
    getStudentCount() {
        const enrollInfo = this.goToEnrollInfo();
        return enrollInfo
            .find(".course-enroll-info_course-info_term-progress")
            .find("span").eq(1)
            .text() ?? null;
    }

    // 课程详情
    private goToDetail() {
        return this.doc
            .find(".g-flow")
            .find(".g-wrap")
            .find(".g-mn2")
            .find(".m-infomation")
            .find("#content-section")
    }
    // 课程简介
    getHeadingIntro() {
        const courseDetail = this.goToDetail();
        return courseDetail
            .find(".course-heading-intro")
            .find(".course-heading-intro_intro")
            .text() ?? null;
    }
    // TODO - 课程概述

    // 授课目标
    getTeachingTarget() {
        const courseDetail = this.goToDetail();
        return courseDetail
            .find(".category-content").eq(1)
            .find(".f-richEditorText")
            .text() ?? null;
    }
    // 课程大纲
    getOutline() {
        const outline: CourseOutline[] = [];

        const courseDetail = this.goToDetail();
        courseDetail
            .find(".category-content").eq(2)
            .find(".outline")
            .find(".outline__new-outline")
            .find(".outline__new-outline__chapter")
            .map((_, element) => {
                const content = this.$(element)
                    .find(".outline__new-outline__chapter__content")
                
                const title = content
                    .find(".outline__new-outline__chapter__content__title")
                    .find(".outline__new-outline__chapter__content__title__text")
                    .text() || null;
                const desc = content
                    .find(".outline__new-outline__chapter__content__goals")
                    .text() || null;
                const courses = content
                    .find(".outline__new-outline__chapter__content__plan")
                    .find(".outline__new-outline__chapter__content__plan__lessons")
                    .find(".outline__new-outline__chapter__content__plan__lessons__lesson")
                    .map((_, element) => this.$(element).text())
                    .get() ?? null;

                outline.push({
                    title,
                    desc,
                    courses
                })
            })

        return outline;
    }
    // 预备知识
    getPrerequisites() {
        const courseDetail = this.goToDetail();
        return courseDetail
            .find(".category-content").eq(3)
            .find(".f-richEditorText")
            .text() ?? null;
    }
    // 参考资料（教材）
    getReference() {
        const courseDetail = this.goToDetail();
        return courseDetail
            .find(".category-content").eq(4)
            .find(".f-richEditorText")
            .text() ?? null;
    }


    // 获取授课教师信息
    private goToInstitution() {
        return this.doc
            .find(".g-flow")
            .find(".g-wrap")
            .find(".g-sd2")
            .find(".m-sdinfo")
            .find(".m-teacher-list")
            .find(".m-teachers")
    }
    // 获取学校信息
    getUniversity() {
        const institution = this.goToInstitution();
        return institution
            .find("a")
            .attr("data-label") ?? null;
    }
    // 获取教师信息
    getTeachers() {
        const teachers: Teachers[] = [];

        const institution = this.goToInstitution();
        institution
            .find(".m-teachers_teacher-list")
            .find(".m-teachers_teacher-list_wrap")
            .find(".um-list-slider")
            .find(".um-list-slider_con")
            .find(".um-list-slider_con_item")
            .map((_, element) => {
                const content = this.$(element)
                    .find(".u-tchcard")
                    .find(".cnt")
                const name = content.find("h3").text() || null;
                const title = content.find("p").text() || null;

                teachers.push({
                    name,
                    title
                })
            })

        return teachers;
    }
}

export default MoocHTMLParser;