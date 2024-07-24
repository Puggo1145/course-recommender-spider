import axios, { AxiosError } from "axios";
import MoocHTMLParser from "../parser/mooc-parser";
import puppeteer from "puppeteer";


const courseInfoUrl = "https://www.icourse163.org/course/"
const courseCommentUrl = "https://www.icourse163.org/web/j/mocCourseV2RpcBean.getCourseEvaluatePaginationByCourseIdOrTermId.rpc"


export const getCourseInfo = async (courseId: string) => {
    const url = courseInfoUrl + courseId
    const headers = {
        "Accept": "*/*",
        "Content-Type": "text/html",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        "Cookie": 'EDUWEBDEVICE=4c62bc545a4a4e6ca20d5dedd400d0e6; NTESSTUDYSI=c6eacf5aa60946579f5825a690dd0814'
    }

    try {
        const res = await axios.get(url, { headers });

        const decodedCourseInfo = analyzeCourseInfoDoc(res.data);

        return decodedCourseInfo;
    } catch (err) {
        if (err instanceof Error) {
            return {
                ok: false,
                msg: err.message
            };
        } else if (err instanceof AxiosError) {
            return {
                ok: false,
                msg: err.response?.data
            };
        }
    }
}

export const getCoursePageWithPuppeteer = async (courseId: string) => {
    console.log("正在启动浏览器");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    console.log("正在进入页面");
    await page.goto(courseInfoUrl + courseId);
    const html = await page.content();

    console.log("正在获取 html");
    await browser.close();

    const data = analyzeCourseInfoDoc(html);

    return data;
}

const analyzeCourseInfoDoc = (doc: string) => {
    const parser = new MoocHTMLParser(doc);

    return {
        courseName: parser.getCourseName(),
        term: parser.getTerm(),
        termTime: parser.getTermTime(),
        workLoad: parser.getWorkLoad(),
        studentCount: parser.getStudentCount(),
    };
}
