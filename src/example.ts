import { getCourse } from "./index";
import { getCourseInfo, getCoursePageWithPuppeteer } from "./index";
import fs from "fs";

(async () => {
    // const res = await getCourse("BV1qW4y1a7fU");
    // const res = await getCourseInfo("BIT-268001");
    // console.log(res);

    const res = await getCoursePageWithPuppeteer("BIT-268001");
    console.log(res);
    
        

    // 将数据保存为 JSON 文件, nodejs
    // fs.writeFileSync("data.html", res);
    // fs.writeFileSync("data.json", JSON.stringify(res, null, 4));
    
})()
