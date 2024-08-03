import fs from "fs"

import { 
    getMoocInfo, 
    getMoocComments,
} from "../index"
import { courseIds } from "../constants/courseIds"

// 将数组分块
function chunkArray(array: string[], size: number) {
    const chunkedArray = [];
    for (let i = 0; i < array.length; i += size) {
        chunkedArray.push(array.slice(i, i + size));
    }
    return chunkedArray;
}

// 处理每个分块
async function processChunk(chunk: string[]) {
    const promises = chunk.map(async courseId => {
        console.log(`正在获取课程 ${courseId}`);
        const infoRes = await getMoocInfo(courseId, "spoc");
        
        // 保存到 output
        const courseName = infoRes.courseName.replace(/[\/\\:]/g, '_');
        fs.writeFileSync(`../../output/${courseName}-info.json`, JSON.stringify(infoRes, null, 4));

        // const res = await getMoocComments({
        //     courseId: courseId,
        //     pageIndex: 1,
        //     pageSize: 20,
        //     orderBy: 3,
        // });
        // // 保存到 output
        // fs.writeFileSync(`../../output/${infoRes.courseName}-comments.json`, JSON.stringify(res?.comments, null, 4));
    });
    await Promise.all(promises);
}
    
(async () => {
    // 根据课程 id 获取课程信息
    const chunkedCourseIds = chunkArray(courseIds, 5);
    for (const chunk of chunkedCourseIds) {
        await processChunk(chunk);
    }
})();
