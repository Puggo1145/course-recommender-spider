import fs from "fs"
import { 
    getMoocInfo, 
    getMoocComments,
} from "../index"

async function processCourse(courseId: string) {
    try {
        console.log(`正在获取课程 ${courseId}`);
        const infoRes = await getMoocInfo(courseId);
        
        // 保存到 output
        const courseName = infoRes.courseName.replace(/[\/\\:]/g, '_');
        fs.writeFileSync(`../../output/${courseName}-info.json`, JSON.stringify(infoRes, null, 4));

        const res = await getMoocComments({
            courseId: courseId,
            pageIndex: 1,
            pageSize: 20,
            orderBy: 3,
        });
        // 保存到 output
        fs.writeFileSync(`../../output/${courseName}-comments.json`, JSON.stringify(res?.comments, null, 4));

        return null; // 表示成功
    } catch (error) {
        console.error(`获取课程 ${courseId} 失败:`, error);
        return courseId; // 返回失败的 courseId
    }
}

(async () => {
    // 根据课程 id 获取课程信息
    const file = fs.readFileSync("./output/courseIds.json", 'utf-8');
    const courseIds = JSON.parse(file) as string[];
    console.log(`共有 ${courseIds.length} 个课程`);
    
    const failedCourseIds: string[] = [];

    for (const courseId of courseIds) {
        const failedCourseId = await processCourse(courseId);
        if (failedCourseId) {
            failedCourseIds.push(failedCourseId);
        }
    }

    // 保存失败的 courseIds
    if (failedCourseIds.length > 0) {
        fs.writeFileSync("../../output/failedCourseIds.json", JSON.stringify(failedCourseIds, null, 4));
        console.log(`有 ${failedCourseIds.length} 个课程获取失败，已保存到 failedCourseIds.json`);
    } else {
        console.log("所有课程都成功获取");
    }
})();