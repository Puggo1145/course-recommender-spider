import axios, { AxiosError } from "axios";
import * as cheerio from "cheerio";


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

        analyzeCourseInfoDoc(res.data);

        return res.data;
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

const analyzeCourseInfoDoc = (doc: string) => {
    const html = cheerio.load(doc);

    // 课程基本信息
    // const courseBasicInfo = html
    //     .find(".certifiedTop")
    //     .find(".m-top")
    //     .find(".g-flow")
    //     .find(".introCard")
    //     .find(".course-enroll-info-wrapper")
    //     .find(".title-wrapper")


    // const courseName = courseBasicInfo
    //     .find(".f-cb")
    //     .find(".course-title-wrapper")
    //     .find(".course-title")
        // .text();
        
    // console.log(courseName);

    return;
}
