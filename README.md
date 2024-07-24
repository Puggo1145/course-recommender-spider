## 项目搭建步骤
1. 确保你已经安装了 nodejs >= 18
2. 安装 yarn，使用特定版本 v1.22.22
3. 安装依赖，执行以下命令
```bash
yarn
```

4. 项目结构说明
- constants：常量定义
- libs：各平台爬虫模块
- output：爬虫结果输出文件夹
- types：类型定义
- utils：工具函数
- index.ts：入口文件
- test.ts：测试文件，在此文件中调用相应的爬虫模块并输出结果