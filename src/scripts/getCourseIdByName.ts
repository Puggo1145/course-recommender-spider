import { courseNames } from '../constants/courseNames';
import { getCourseIdBySearch } from '../libs/course-handler';

import fs from 'fs';
import path from 'path';


const MAX_CONCURRENT_TASKS = 5;
const SEARCHES_PER_TASK = 5;
const UNIVERSITY = "西南政法大学"
const COOKIE = `EDUWEBDEVICE=07654f166aa44dce8d7fe4abeecc0324; Hm_lvt_77dc9a9d49448cf5e629e5bebaa5500b=1721177818; HMACCOUNT=8CBBE8804B15E262; WM_TID=FNPtgGC9OrZFBBARRQKR7f8keO9M4i%2FM; hasVolume=true; __yadk_uid=mgzu8h4rEW2WNrJGho9lYdmTne9IW0AH; videoVolume=0.21; hb_MA-A976-948FFA05E931_source=cn.bing.com; NTESSTUDYSI=4878e21de90145179bc25f1843391ba3; WM_NI=AykDfVVbfka5nao%2FkOkvbhyo03UEU2Ov2f%2BulixfAxh4L9cZWrnQ2yXqfI5lchaMvXykS1GhsCe0LFa3caxuhz8BJrqmjNJsyE7k7rq%2FVKhLhV8CnW%2Fk7bcx3p%2B%2BHW1FbDc%3D; WM_NIKE=9ca17ae2e6ffcda170e2e6eed9fc60edb181b0fc5daf8a8aa7d85b979b9a87db5bf49584b5ec46a88eb6d2e22af0fea7c3b92a83a7a5a5e55e96beaa8ce43faebfa1d0ea45a9aaae89fc65f4ed9ba6d83a8daafe87aa7fb0b7b887c474acec84dae25295aea2b2b1739cafaaaab868a1b8afaef554bbb59dd2c664b19dabd1cf4ea3edad82fb7faca6f8a3c97ab3b3a6afc979bb9bf98cb67ab3f19aaceb48ac8af8a4ed5dedb5f983e274f1b0e5cccb5df39aaea5e237e2a3; NTES_YD_SESS=l9J5Jtvv0x.PnnfU..Ct_BppFKb.s7H.ZToGLeIPLfaHMmy6MT5QSOvldGRdFa0QGIm86hCMKaNmR4mAsNjbeBY8FLBLS5Xu11kbAuGbSaiGcA137heOULKL_nT8Nnm9ggHll_IIE0P5OlGvTXDcYttejGRrTBG0_C8EBBdNoL5q7l0aKH.fiJxmXoIKsrDYqnKrA6pSy51kI5lEydppihemADFBgXt5k7dRWkvwG_2HY; NTES_YD_PASSPORT=J_7JFPWEdl80O38kUJbSWG16i.LBcz4IR50ayqQiUdc0Wh3VWELSHaTMq54qkKOS5YhQVwJWUK0QNEMtlUwnOm8ZVw1otUbJSvcTNVLuzHSs1qHD7kUgcIBkMTrpBa_YexPapuL158Iip0NCvWkskBOFaLdSHu75SSHyFoPX.5Lws.QMNtPJlDQWtge6WpRx.AJcY7M_VMA0iz7qsdJiQUV4e; STUDY_INFO="yd.8e21141e743443d9b@163.com|8|1421911993|1722738377303"; STUDY_SESS="hW1c75W8EyGlWHoR1fYsP9qeGwh2Uwm7N3F4+Ag9RIr4IGiXEgZJvErTLdHpMaIcVA8/QpWzv7+hmkekeuVdVJcXrnHX0VhcZkB1PdP4Kab3w9bzzuoLeLXCXMaHYgZXnPlivNTZib8wa86m4pE8L1U3Ezw1dOMfejlJjT3grxoLhur2Nm2wEb9HcEikV+3FTI8+lZKyHhiycNQo+g+/oA=="; STUDY_PERSIST="Y9JihuynohzILvEBRka61bShqPpLYWwzWOT3ZQ27AXzD++Eoz4B4uMyM4/9LW5hHB0GGtqgzswL2koxbribOGrU1OhvJ5RhLocgfKra/7HX4pUUzMtmDMOI4obKWvgurqMZqM+ovDCUkDna8xqsgb/NFDgqnp0IcwDk4E1RPjIUzhgCu0tPmDFC9EJ/ElKeJObIkrVlrP3KL+NOIb+WFlHxXYQFeQ6pXt66LZvrGO+HZgpjCC7Iso4RP9U87vJE8LtaQzUT1ovP2MqtW5+L3Hw+PvH8+tZRDonbf7gEH7JU="; NETEASE_WDA_UID=1421911993#|#1582349769670; Hm_lpvt_77dc9a9d49448cf5e629e5bebaa5500b=1722738379`
const OUTPUT_DIR = path.join(__dirname, 'output');


export interface CourseResult {
    courseName: string;
    courseId: string | null;
}

async function processCourses(): Promise<CourseResult[]> {
    const queue: string[] = [...courseNames];
    const results: CourseResult[] = [];

    async function processChunk(chunk: string[]): Promise<void> {
        for (const courseName of chunk) {
            const courseId = await getCourseIdBySearch(courseName, UNIVERSITY, COOKIE);
            results.push({ courseName, courseId });
            console.log(`课程 "${courseName}" 的 ID 是: ${courseId}`);
        }
    }

    async function processQueue(): Promise<void> {
        while (queue.length > 0) {
            const chunk = queue.splice(0, SEARCHES_PER_TASK);
            await processChunk(chunk);
        }
    }

    const tasks: Promise<void>[] = Array(MAX_CONCURRENT_TASKS).fill(null).map(() => processQueue());
    await Promise.all(tasks);

    return results;
}

function saveResults(results: CourseResult[]): void {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `course_results_${timestamp}.json`;
    const filePath = path.join(OUTPUT_DIR, filename);

    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
    console.log(`结果已保存到: ${filePath}`);
}

processCourses().then((results: CourseResult[]) => {
    console.log('所有课程搜索完成');
    saveResults(results);
}).catch((error: Error) => {
    console.error('处理过程中发生错误:', error);
});