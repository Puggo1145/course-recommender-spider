import fs from 'fs';
import path from 'path';
import { getMoocInfo } from '../libs/core/mooc';

interface RelatedCourses {
    [key: string]: string[];
}


async function processCourse(courseName: string, courseIds: string[]): Promise<void> {
    if (courseIds.length === 0) {
        console.log(`跳过 ${courseName}，因为没有相关课程`);
        return;
    }

    console.log(`处理 ${courseName} 的相关课程...`);
    const relatedCoursesInfo = [];

    for (const courseId of courseIds) {
        try {
            const info = await getMoocInfo(courseId);
            relatedCoursesInfo.push(info);
        } catch (error) {
            console.error(`获取课程 ${courseId} 信息时出错:`, error);
        }
    }

    // 保存为 JSON 文件
    const sanitizedCourseName = courseName.replace(/[/\\?%*:|"<>]/g, '-');
    const fileName = `${sanitizedCourseName}_related_courses.json`;
    
    fs.writeFileSync(`../../output/${fileName}`, JSON.stringify(relatedCoursesInfo, null, 2), 'utf-8');
    console.log(`已保存 ${courseName} 的相关课程信息到 ${fileName}`);
}

async function processRelatedCoursesWithConcurrency(relatedCourses: RelatedCourses, maxConcurrency: number) {
    const queue = Object.entries(relatedCourses);
    const running: Promise<void>[] = [];

    while (queue.length > 0 || running.length > 0) {
        while (running.length < maxConcurrency && queue.length > 0) {
            const [courseName, courseIds] = queue.shift()!;
            const promise = processCourse(courseName, courseIds).then(() => {
                running.splice(running.indexOf(promise), 1);
            });
            running.push(promise);
        }
        await Promise.race(running);
    }
}

(async () => {
    try {
        const file = fs.readFileSync("../../output/related_courses_2024-08-07T08-41-55.992Z.json", "utf-8");
        const relatedCourses = JSON.parse(file) as RelatedCourses;

        const MAX_CONCURRENCY = 5;
        await processRelatedCoursesWithConcurrency(relatedCourses, MAX_CONCURRENCY);
        console.log("所有课程处理完成");
    } catch (error) {
        console.error("处理过程中发生错误:", error);
    }
})();