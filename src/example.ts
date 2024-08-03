import fs from "fs"

import { 
    getMoocInfo, 
    getMoocComments,
    getCourseIdBySearch,
} from "./index"
import { courseIds } from "./constants/courseIds"

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
        const infoRes = await getMoocInfo(courseId);
        // 保存到 output
        fs.writeFileSync(`../output/${infoRes.courseName}-info.json`, JSON.stringify(infoRes, null, 4));

        // const res = await getMoocComments({
        //     courseId: courseId,
        //     pageIndex: 1,
        //     pageSize: 20,
        //     orderBy: 3,
        // });
        // // 保存到 output
        // fs.writeFileSync(`../output/${infoRes.courseName}-comments.json`, JSON.stringify(res?.comments, null, 4));
    });
    await Promise.all(promises);
}
    
(async () => {
    // // 根据课程 id 获取课程信息
    // const chunkedCourseIds = chunkArray(courseIds, 5);
    // for (const chunk of chunkedCourseIds) {
    //     await processChunk(chunk);
    // }

    const cookie = `EDUWEBDEVICE=07654f166aa44dce8d7fe4abeecc0324; Hm_lvt_77dc9a9d49448cf5e629e5bebaa5500b=1721177818; HMACCOUNT=8CBBE8804B15E262; WM_TID=FNPtgGC9OrZFBBARRQKR7f8keO9M4i%2FM; hasVolume=true; __yadk_uid=mgzu8h4rEW2WNrJGho9lYdmTne9IW0AH; videoVolume=0.21; hb_MA-A976-948FFA05E931_source=cn.bing.com; WM_NI=46GQxUBLnIy%2FFTxDplYH6DMLwrBv35duW05PhbuZ%2Bm1M5eOm9MfbTeoKaK7zsIkPz4TSDF2Mg3ANgcUFst8%2BJLIEo4D7pwr%2BtlGuQZ7ucNpOzQFywE5TCWztAeKmef59UlM%3D; WM_NIKE=9ca17ae2e6ffcda170e2e6ee97b2479be8ff82f64396b08ea6c44f838b8b83db4fb5bcb697ed25b59ba1bbd82af0fea7c3b92af8ea89b2fb5f8294a2aafc25868cb8a5f3689b98faa5d048b5ae8e97b23fa8ab99d1b85cacbebbbbaa67f393fb86ce67fb93aa83d76fad95afacb672b197a5b1f940988d8ca7b147a5ed8fafe669979abd95bb218a9487a6ee4088e9c098f121b8b48996d452f5abadaff345ba8f8a9af64ff78c8db8f98083bb858ee86ef7e79b8dd037e2a3; NTESSTUDYSI=6dec3a921c8b405cb5ec53d65f4a346a; NTES_YD_SESS=jymCy0ueUeHkvboWsBWClFIyCl3JwIuMDGsXm5aVhXeZrOhUrIJ5LfDXetxs._qAHytCvt3CtIHoffQwFX9KngHcCBCodrJiPjHQJRCfUeLLk0u.ovJSUvZblRIG9ROZ49DW9AVLxv1QjA3hZVhKvESHlfBgErp062yIBijrHvmXnGFqmjhL25C9lIKVEaAr6NUhE6.GL4PZTvwfkas2NqlxVQYAw_9UTE3fA2GstHH4Q; NTES_YD_PASSPORT=yi.t9MnB8RIf6EIeJZ_jd5IVZm4TSdDb37rNdfzCO_4rZ2qhZLps8NKT04lJexaEYU47Q4174LYa32Syu6EIewsrNApjqBYsa7bpg25kALRUIBG.02rgtjVSu5nUYNob9gENUApa7VJCE_2r7auH8iK5BR9MRvrwo1pwYnGF1IyKX5KYabFiy8TI4PYPJ3EdqvEDeHJzMJsMhZTeS0UQIobT9; STUDY_INFO="yd.8279d089882f4bd29@163.com|8|1454127984|1722650845160"; STUDY_SESS="CJUfQ/2McZP4cJVy1hrPnWmN+z9RtS86IsjyQ403+LwGoyvYGiKDwE+xIf4sQbiSJqjisoefRJIm/YN/Fcnp+RnGqdF239LCvDT561g9Lc/Q5sfmzhcpP+iTgW4beC3LOdYTmfEWo1p8RsxS6tl2AYPT/8t2fa0Lv6M7AwH3kdQLhur2Nm2wEb9HcEikV+3FTI8+lZKyHhiycNQo+g+/oA=="; STUDY_PERSIST="t0K5jyPZep2vT6I36EU5F6ThpiGwRmXfh2fQ5joRtkJucHPEbNdyTvGHnSiOO3UqS5TJOz+Gum7Na0D6XPJUmp+QNceZyUdT30AGqAHEfMcO/nMboiOa6zmRQwvLJnCQrHgAXJDzsiy62ymqHobPKy58Sz4344KoREPXvlj59Zd1tzXiHOROE2N059ONydXCimxnTdK4O3a38lgyOpVwPRlLLdSzQm20hey6BZtA21LZgpjCC7Iso4RP9U87vJE8LtaQzUT1ovP2MqtW5+L3Hw+PvH8+tZRDonbf7gEH7JU="; NETEASE_WDA_UID=1454127984#|#1611789309467; Hm_lpvt_77dc9a9d49448cf5e629e5bebaa5500b=1722651378`
    await getCourseIdBySearch("3D打印技术及应用", "重庆师范大学", cookie);
})();
