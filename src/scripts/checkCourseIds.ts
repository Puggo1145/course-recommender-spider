import fs from "fs";

import type { CourseResult } from "./getCourseIdByName";

const file = fs.readFileSync("./output/course_results_2024-08-13T02-14-25.254Z.json", 'utf-8');
const courses = JSON.parse(file) as CourseResult[];
// const nullCourses = courses.filter(course => course.courseId === null);
// console.log(nullCourses);

const courseIds = courses.map(course => course.courseId);
fs.writeFileSync("./output/courseIds.json", JSON.stringify(courseIds, null, 4))
