import { getCourse } from "./libs/bili";
import { getCourseInfo } from "./libs/mooc";
import fs from "fs";

(async () => {
    // const res = await getCourse("BV1qW4y1a7fU");
    const res = await getCourseInfo("BIT-268001");

    // 将数据保存为 JSON 文件, nodejs
    // fs.writeFileSync("data.html", res);
    // fs.writeFileSync("data.json", JSON.stringify(res, null, 4));
    
})()
