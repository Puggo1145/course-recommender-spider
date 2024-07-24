import * as cheerio from "cheerio";

type Doc = cheerio.Cheerio<cheerio.Element>

// Cheerio 解析器
class MoocHTMLParser {
    private doc: Doc;

    constructor(html: string) {
        this.doc = cheerio.load(html)("#g-container").find("#g-body");
    }

    // 进入课程基本信息
    private goToCourseBacisInfo() {
        return this.doc
            .find(".certifiedTop")
            .find(".m-top")
            .find(".g-flow")
            .find(".introCard")
            .find(".course-enroll-info-wrapper")
            .find(".title-wrapper")
    }
    // 获取课程名称
    getCourseName() {
        const courseBasicInfo = this.goToCourseBacisInfo();
        return courseBasicInfo
            .find(".f-cb")
            .find(".course-title-wrapper")
            .find(".course-title")
            .text();
    }

    // 进入课程注册信息
    private goToCourseEnrollInfo() {
        const courseInfo = this.goToCourseBacisInfo();
        return courseInfo
            .find("#course-enroll-info")
            .find(".course-enroll-info")
            .find(".course-enroll-info_course-info")
    }
    // 获取课程学期
    getTerm() {
        const courseEnrollInfo = this.goToCourseEnrollInfo();
        return courseEnrollInfo
            .find(".course-enroll-info_course-info_term-select")
            .find(".course-enroll-info_course-info_term-select_dropdown")
            .find(".f-thide")
            .attr("title");
    }
    // 开课时间
    getTermTime() {
        const courseEnrollInfo = this.goToCourseEnrollInfo();
        return courseEnrollInfo
            .find(".course-enroll-info_course-info_term-info")
            .find(".course-enroll-info_course-info_term-info_term-time")
            .find("span").eq(1)
            .text();
    }
    // 学时安排
    getWorkLoad() {
        const courseEnrollInfo = this.goToCourseEnrollInfo();
        return courseEnrollInfo
            .find(".course-enroll-info_course-info_term-workload")
            .find("span").eq(1)
            .text();
    }
    // 学习人数
    getStudentCount() {
        const courseEnrollInfo = this.goToCourseEnrollInfo();
        return courseEnrollInfo
            .find(".course-enroll-info_course-info_term-progress")
            .find("span").eq(1)
            .text();
    }
}

export default MoocHTMLParser;