import fs from "fs"

import { getMoocInfo, getMoocComments } from "./index"

(async () => {
    // const courseId = "CQU-1449259163"
    const courseIds = [
        "BIT-268001",
    ]

    courseIds.forEach(async courseId => {
        console.log(`正在获取课程 ${courseId}`);

        const infoRes = await getMoocInfo(courseId);
        // 保存到 output
        fs.writeFileSync(`../output/${infoRes.courseName}-info.json`, JSON.stringify(infoRes, null, 4))

        // const res = await getMoocComments({
        //     courseId: courseId,
        //     pageIndex: 1,
        //     pageSize: 20,
        //     orderBy: 3,
        // })
        // // 保存到 output
        // fs.writeFileSync(`../output/${infoRes.courseName}-comments.json`, JSON.stringify(res?.comments, null, 4))
    })
})()
