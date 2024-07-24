import axios from "axios"
// utils
import { getDate } from "../../utils/timehandler"
// constants
import { header } from "../../constants/header"
// types
import type {
    CourseInfoResponse,
    CourseCommentResponse,
    Replies,
} from "../../types/bili-response"

export const getCourse = async (bvid: string) => {
    const { data: { data } } = await axios.get<CourseInfoResponse>(
        `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
        { headers: header }
    )

    const aid = data.aid
    const courseComments = await getCourseComment(aid)


    const chapters = data.pages.map(item => ({
        title: item.part,
        duration: item.duration
    }))
    const comments = courseComments.comments.map(item => ({
        username: item.member.uname,
        rating: null,
        time: getDate(item.ctime),
        content: item.content.message,
        likes: item.like,
    }))

    const courseInfo = {
        name: data.title,
        desc: data.desc,
        curriculum_time: getDate(data.pubdate),
        rating: null,
        duration: data.duration,
        total_chapters: data.videos,
        chapters: chapters,
        total_comments: courseComments.total_comments,
        comments: comments,
    }

    return courseInfo
}

const requestComment = async (aid: string, next: number) => {
    const queryStr = {
        oid: aid,
        type: "1",
        mode: "3",
        next: next.toString(),
    }

    const { data } = await axios.get<CourseCommentResponse>(
        `https://api.bilibili.com/x/v2/reply/main?${new URLSearchParams(queryStr)}`,
        { headers: header }
    )

    // console.log(data);

    return data.data
}

export const getCourseComment = async (aid: string) => {
    let next = 1
    let comments: Replies[] = []

    try {
        const data = await requestComment(aid, next)
        const total_comments = data.cursor.all_count

        // 获取评论，每次等待 1-4 秒
        const interval = Math.floor(Math.random() * 1000) + 3000
        while (comments.length < total_comments) {
            await new Promise(resolve => setTimeout(resolve, interval))

            const data = await requestComment(aid, next)

            comments = comments.concat(data.replies)
            next = data.cursor.next

            console.log("已获取评论：" + comments.length)
        }

        return { total_comments, comments }
    } catch (error) {
        console.error("获取评论时发生错误：", error)

        return { total_comments: comments.length, comments }
    }
}
