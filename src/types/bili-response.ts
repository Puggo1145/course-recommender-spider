type StandardResponse<T> = {
    code: number
    message: string
    ttl: number
    data: T
}

type Pages = {
    cid: number
    page: number
    part: string // 名称
    duration: number // 时长
}

type CourseInfo = {
    bvid: string
    aid: string
    videos: number // 分 P 视频数量
    title: string // 标题
    pubdate: number // 发布时间
    desc: string // 视频简介
    duration: number // 总时长 - 秒
    owner: {
        mid: number
        name: string
        face: string
    },
    stat: {
        view: number
        danmaku: number
        reply: number
        favorite: number
        coin: number
        share: number
        like: number
    },
    pages: Pages[]
}

export type Replies = {
    rpid: number // 评论 id
    oid: number // 视频 id
    type: number
    ctime: number // 评论时间
    like: number // 点赞数  
    member: {
        mid: number
        uname: string
        avatar: string
    }
    content: {
        message: string
    }
}
export type CourseComment = {
    cursor: {
        prev: number
        next: number
        mode: number
        all_count: number // 评论总数
        support_mode: number[]
    }
    replies: Replies[]
}


export type CourseInfoResponse = StandardResponse<CourseInfo>
export type CourseCommentResponse = StandardResponse<CourseComment>
