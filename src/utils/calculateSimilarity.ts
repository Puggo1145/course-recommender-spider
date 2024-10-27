export function calculateSimilarity(inputText: string, referenceText: string): number {
    // 将输入文本和参照文本转换为小写
    const input = inputText.toLowerCase();
    const reference = referenceText.toLowerCase();

    // 将文本分割成字符数组
    const inputChars = Array.from(input);
    const referenceChars = Array.from(reference);

    // 计算共同字符数
    const commonChars = inputChars.filter(char => referenceChars.includes(char));
    
    // 计算相似度得分
    const similarity = commonChars.length / Math.max(inputChars.length, referenceChars.length);
    
    return similarity;
}

// 使用示例
// const referenceCourse = "3D打印技术及应用";
// const inputCourses = [
//     "3D 打印技术",
//     "3D 打印：从原理到创新应用",
//     "机械工程导论",
//     "3D建模与渲染"
// ];

// inputCourses.forEach(course => {
//     const similarity = calculateSimilarity(course, referenceCourse);
//     console.log(`"${course}" 与参照课程的相似度: ${(similarity * 100).toFixed(2)}%`);
// });