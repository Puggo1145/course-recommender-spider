import axios, { AxiosError } from "axios";
import MoocHTMLParser from "../parser/mooc-parser";
import { getDocumentByPuppeteer } from "../html-handler";
import { getRandomUserAgent } from "../../constants/ua";
import { moocUrls } from "../../constants/urls";
import { getDate } from "../../utils/timehandler";
// types
import type { CourseOutlineStandard } from "../parser/mooc-parser";


import https from "https";
// import fs from "fs";




export const getMoocInfo = async (courseId: string) => {
    // 本地 html 测试文件
    // const html = fs.readFileSync("../output/example.html", "utf-8");

    const {
        html, 
        studentCount, 
        teachersIntro
    } = await getDocumentByPuppeteer({
        url: moocUrls.info + courseId,
        useCookie: true
    });

    const data = analyzeInfoDoc(html);

    return {...data, studentCount, teachersIntro};
}

const analyzeInfoDoc = (doc: string) => {
    const parser = new MoocHTMLParser(doc);

    let syllabus: CourseOutlineStandard[] | string[] = parser.getOutlineStandard();
    if (syllabus.length === 0) {
        syllabus = parser.getOutlineRichText();
    }

    return {
        courseName: parser.getName(),
        term: parser.getTerm(),
        termTime: parser.getTermTime(),
        workLoad: parser.getWorkLoad(),
        headingIntro: parser.getHeadingIntro(),
        teachingTarget: parser.getTeachingTarget(),
        syllabus,
        prerequisites: parser.getPrerequisites(),
        reference: parser.getReference(),
        university: parser.getUniversity(),
    };
}


const getCookie = async (courseId: string) => {
    console.log("正在获取 cookies");

    const headers = {
        "Accept": "*/*",
        "Content-Type": "text/html",
        "User-Agent": getRandomUserAgent(),
    }
    const res = await axios.get(
        moocUrls.info + courseId,
        { headers }
    );

    return res.headers["set-cookie"];
}


interface CommentProps {
    courseId: string;
    pageIndex: number;
    pageSize: number;
    orderBy: number;
}
type CommentRequestProps = CommentProps & {
    cookies: string[];
    csrfKey: string;
}
const requestComment = async({
    courseId,
    pageIndex,
    pageSize,
    orderBy,
    cookies,
    csrfKey
}: CommentRequestProps) => {
    const headers = {
        "Referer": moocUrls.info + courseId,
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": getRandomUserAgent(),
        "Cookie": cookies?.join("; ")
    }

    const res = await axios.post(
        `${moocUrls.comments}?csrfKey=${csrfKey}`,
        {
            courseId: courseId.split("-")[1],
            pageIndex,
            pageSize,
            orderBy
        },
        { 
            headers,
            httpsAgent: new https.Agent({ keepAlive: true }),
            timeout: 10000
        },
    );

    return res
}

export const getMoocComments = async ({
    courseId,
    pageIndex,
    pageSize,
    orderBy,
}: CommentProps) => {
    const comments: StructurizedComment[] = [];

    try {
        // 1. 获取 cookies
        const cookies = await getCookie(courseId);
        if (!cookies) {
            return {
                ok: false,
                msg: "Failed to get cookies",
            };
        }

        const csrfKey = cookies[0].split("; ")[0].split("=")[1];
        // 2. 获取最大页数
        const pageCountRes = await requestComment({
            courseId,
            pageIndex: 1,
            pageSize: 20,
            orderBy: 3,
            cookies,
            csrfKey
        });
        const totalPage = pageCountRes.data.result.query.totlePageCount;


        // 3. 开始获取评论
        while (pageIndex <= totalPage) {
            // const interval = Math.floor(Math.random() * 1000)
            // await new Promise(resolve => setTimeout(resolve, interval))

            console.log(`正在获取第 ${pageIndex}/${totalPage} 页评论`);

            const res = await requestComment({
                courseId,
                pageIndex,
                pageSize,
                orderBy,
                cookies,
                csrfKey
            });
            
            if (res.data.code !== 0) {
                throw new Error(res.data.message);
            }
            
            const formattedComments = structurizeComments(res.data.result.list);
            comments.push(...formattedComments);

            pageIndex++;
        }


        return {
            ok: true,
            comments: comments
        };
    } catch (err) {
        if (err instanceof Error) {
            return {
                ok: false,
                msg: err.message,
                comments: comments
            };
        } else if (err instanceof AxiosError) {
            return {
                ok: false,
                msg: err.message,
                comments: comments
            };
        }
    }
}

interface OriginalComment {
    id: number,
    gmtModified: number, // 时间戳
    commentorId: number,
    userNickName: string,
    faceUrl: string,
    content: string,
    mark: number,
    courseId: number,
    termId: number,
    courseName: string,
    agreeCount: number, // 点赞数
}
interface StructurizedComment {
    username: string;
    rating: number;
    time: string;
    content: string;
    likes: number;
}
const structurizeComments = (comments: OriginalComment[]) => {
    return comments.map(comment => ({
        username: comment.userNickName,
        rating: comment.mark,
        time: getDate(comment.gmtModified),
        content: comment.content,
        likes: comment.agreeCount
    }));
}
