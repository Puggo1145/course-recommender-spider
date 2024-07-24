import fs from "fs"

import { getMoocInfo, getMoocComments } from "./index"

(async () => {
    const infoRes = await getMoocInfo("BIT-268001");
    // 保存到 output
    fs.writeFileSync("../output/info.json", JSON.stringify(infoRes, null, 4))

    // const res = await getMoocComments({
    //     courseId: "BIT-268001",
    //     pageIndex: 1,
    //     pageSize: 20,
    //     orderBy: 3,
    // })
    // // 保存到 output
    // fs.writeFileSync("../output/comments.json", JSON.stringify(res?.comments, null, 4))
})()
