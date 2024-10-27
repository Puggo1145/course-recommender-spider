import { getRelatedCourseIds } from "../libs/course-handler";
import fs from "fs";


const courseNames = [
    "3D打印技术及应用",
    "android智能手机编程CNU",
    "App Inventor-零基础Android移动应用开发CNU",
    "Java程序设计",
    "Linux程序设计",
    "Python语言程序设计",
    "“爱上广告”——广告艺术鉴赏",
    "一流本科课程建设与申报视频资料",
    "一流课程建设与应用",
    "中国传统节日与养生文化",
    "中国文化概要",
    "中国文化概论CNU",
    "中国民族民间舞—云南花灯",
    "中国民族民间舞—蒙古族舞蹈",
    "中国茶文化与茶健康CNU",
    "中国行政法原理CNU2",
    "中外歌剧赏析",
    "中学物理课堂教学技能训练",
    "习近平总书记关于教育的重要论述专题",
    "二维动画制作CNU",
    "互联网金融CNU",
    "交互式界面设计CNU",
    "产品设计开发与制造",
    "人工智能实践:Tensorflow笔记_龙兴明",
    "人工智能实践：Tensorflow笔记CNU",
    "人工智能导论CNU",
    "企业识别系统设计",
    "传感器与测试技术_陈小波",
    "传感器原理及应用_蒋茂华",
    "信号与系统-毋玉芬CNU",
    "信息化教学能力之五项修炼CNU",
    "信息素养：效率提升与终身学习的新引擎CNU",
    "儿童保健学—从新手爸妈到育儿专家CNU",
    "分析化学CNU-祁文静",
    "创业营销十步流程CNU",
    "初级僧伽罗语视听说",
    "化妆设计基础---自我化妆提升术CNU",
    "医用发育生物学CNU",
    "半导体物理与器件原理CNU",
    "单片机原理及接口技术CNU",
    "发展心理学CNU",
    "发展心理学CNU-周永红",
    "发展心理学CNU-张潜",
    "可视化程序设计技术及应用_龙兴明",
    "商业银行经营学CNU",
    "嗓音发声原理及技巧",
    "地球资源与环境信息技术前沿",
    "地球资源与环境信息技术前沿CNU",
    "城市与文化遗产CNU",
    "基因工程原理与方法",
    "基础教育改革CNU-宋燕",
    "声乐演唱基CNU",
    "外国文学作品选（一）CNU",
    "大学物理实验（II）",
    "大学物理（力学、电磁学）CNU",
    "大家弹起来——钢琴即兴伴奏入门",
    "大数据基础与应用CNU",
    "媒体大数据挖掘与案例实战CNU",
    "学术论文文献阅读与机助汉英翻译CNU",
    "实验心理学：学会研究身边的现象CNU",
    "小学德育与班主任工作",
    "小学生品德发展与道德教育CNU",
    "小学科技创客教育及实践",
    "小学课程设计与评价CNU",
    "工程伦理CNU研究生",
    "建筑与园林",
    "影像的力量：电视剧历史与美学CNU",
    "影视艺术概论CNU2",
    "心理活动之生理奥妙CNU",
    "思想政治教育学原理CNU",
    "批判性思维",
    "教师职业道德",
    "教师职业道德CNU",
    "教师职业道德CNU-胡之骐",
    "教师职业道德CNU-黄露",
    "教师职业道德与教育政策法规CNU张晓燕",
    "教育哲学CNU-艾诗根",
    "教育心理学CNU-陈苗苗",
    "教育法治与教师法治素养",
    "教育法治与教师法治素养CNU",
    "教育法治与教师法治素养CNU-胡之骐",
    "教育法治与教师法治素养CNU-黄露",
    "教育研究方法CNU-左瑞勇",
    "教育研究方法CNU-田波琼",
    "教育研究方法CNU-谷小燕",
    "教育＋数字化＋智慧化",
    "数字化教育资源开发",
    "数字插画实战CNU",
    "数字电路与逻辑设计CNU",
    "数字营销：走进智慧的品牌CNU",
    "数学模型求解CNU",
    "文化创意产品设计",
    "文旅融合创意策划",
    "文献管理与信息分析CNU",
    "旅游目的地管理",
    "旅游节事活动策划",
    "旅游资源与旅游经营考察实习",
    "无机元素化学CNU-周琦",
    "智慧课堂教学CNU",
    "智能机器人基础",
    "有机化学CNU-徐海",
    "服装工艺基础训练",
    "机器人创意设计与实践",
    "毛泽东思想和中国特色社会主义理论体系概论彭华刚",
    "毛泽东思想和中国特色社会主义理论体系概论黄敏老师",
    "激光原理与技术CNU",
    "版画技法（中国水印木刻）",
    "物理教学策略与教学设计",
    "现代教育技术",
    "现代视听节目编导与制作CNU",
    "用户研究与体验设计",
    "电子技术_朱仁江",
    "电视采访报道CNU",
    "研学旅行管理与实务",
    "研学旅行课程开发",
    "社会调查与研究方法CNU",
    "神奇的材料世界CNU",
    "神经网络与深度学习——TensorFlow2.0实战CNU",
    "红色音乐文化",
    "纪录片创作理论与实践",
    "纪录片制作（重庆师范大学）",
    "经典导读与欣赏",
    "美国文学（19世纪）CNU",
    "能量转换与利用CNU",
    "自我认知与情绪管理CNU",
    "舞蹈教材教法",
    "艺术与思政创美实践课",
    "英语听力技能与实践",
    "英语语音与信息沟通CNU",
    "融合教育导论",
    "融合新闻：通往未来新闻之路CNU",
    "西方文学经典鉴赏CNU",
    "西方风景园林艺术史CNU",
    "计算机系统基础（二）：程序的执行和存储访问",
    "课程思政建设分享",
    "走近儿童的心理世界CNU",
    "跟着电影去旅游CNU",
    "软件的构造艺术-软件工程",
    "逻辑学导论",
    "逻辑学导论CNU",
    "逻辑学导论CNU3",
    "道路规划与几何设计CNU",
    "酒店环境与设备管理",
    "酒店运营管理III 酒店智慧化与电子商务",
    "酒店运营管理Ⅲ 酒店管理信息系统",
    "量子力学_杨芳",
    "音乐奥秘解码——轻松学乐理CNU",
    "食品营养学（双语）CNU",
    "食品质量检验技术",
    "马克思主义基本原理概论CNU",
    "鸿蒙移动开发技术"
];


export interface RelatedCourses {
    [key: string]: string[];
}
function chunkArray<T>(array: T[], size: number): T[][] {
    const chunked: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size));
    }
    return chunked;
}

async function processCourseBatch(courseNames: string[]): Promise<RelatedCourses> {
    const results: RelatedCourses = {};
    for (const name of courseNames) {
        const result = await getRelatedCourseIds(name);
        if (result) {
            Object.assign(results, result);
        }
    }
    return results;
}

/**
 * @param courseNames 课程名称数组
 * @description 获取多门课程的 3-5 门课的关联课程的课程 ID
 */
async function getMultipleRelatedCourseIds(courseNames: string[]): Promise<RelatedCourses> {
    const MAX_CONCURRENT_BROWSERS = 5;
    const courseBatches = chunkArray(courseNames, Math.ceil(courseNames.length / MAX_CONCURRENT_BROWSERS));

    const results = await Promise.all(courseBatches.map(batch => processCourseBatch(batch)));

    return results.reduce((acc, result) => ({ ...acc, ...result }), {});
}


(async () => {
    const results = await getMultipleRelatedCourseIds(courseNames);
    console.log(results);

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `related_courses_${timestamp}.json`;

    fs.writeFileSync(`../../output/${filename}`, JSON.stringify(results, null, 2));
})();
