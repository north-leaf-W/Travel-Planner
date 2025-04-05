# 旅行计划助手

这是一个基于Vue 3和Element Plus的旅行计划管理应用，帮助用户规划和管理他们的旅行计划。

## 功能特点

- **旅行计划管理**：创建、编辑、查看和删除旅行计划
- **行程安排**：为每次旅行添加详细的行程安排，包括景点、餐厅和活动
- **旅行清单**：创建和管理旅行所需物品的清单，追踪打包进度
- **预算管理**：设置旅行预算，记录和分类旅行支出
- **日历视图**：直观地查看所有旅行计划的日程安排
- **日期冲突检查**：自动检测并防止创建日期重叠的旅行计划
- **实时数据存储**：使用Firebase实时数据库保存所有数据

## 技术栈

- **前端框架**：Vue 3 + Vite
- **UI组件库**：Element Plus
- **状态管理**：Pinia
- **数据存储**：Firebase Realtime Database
- **路由管理**：Vue Router

## 主要功能模块

### 1. 旅行计划管理
- 创建新的旅行计划，设置目的地、日期和描述
- 按出发日期排序显示所有旅行计划
- 查看、编辑和删除现有旅行计划

### 2. 行程安排
- 为每个旅行日期添加行程项目
- 记录景点、餐厅、活动和位置信息
- 时间线视图直观展示整个旅行的行程

### 3. 旅行清单
- 创建自定义旅行物品清单
- 快速添加常用物品
- 跟踪物品打包状态

### 4. 预算管理
- 设置旅行总预算
- 记录不同类别的支出
- 支出统计和预算使用情况可视化

### 5. 日历视图
- 月历形式展示所有旅行计划
- 直观地查看旅行日期和重叠情况
- 点击日期查看当天的详细行程

## 安装与运行

### 环境要求
- Node.js 16+
- npm 8+

### 安装步骤

```sh
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 打包构建
npm run build
```

## 使用说明

1. 注册/登录账户
  默认用户：
    email: 'demo@example.com',
    password: 'password123',
3. 创建新的旅行计划
4. 添加行程、清单项目和预算信息
5. 在日历视图或列表视图中管理所有旅行
6. 查看详情页面管理单个旅行的各项内容

## 项目结构

- `src/components/` - Vue组件
- `src/stores/` - Pinia状态管理
- `src/services/` - API服务和外部集成
- `src/assets/` - 静态资源文件
- `src/firebase.js` - Firebase配置
![image](https://github.com/user-attachments/assets/7d9d849e-9f55-4584-9127-0c11876674e2)
![image](https://github.com/user-attachments/assets/afc2ee26-ce77-4987-9fc9-5318bb50d0ce)
![image](https://github.com/user-attachments/assets/c8309bbe-7afc-402e-b9b2-72670538995f)
![image](https://github.com/user-attachments/assets/a074d3a3-51c7-4cbb-8679-e46050cfaf30)
![image](https://github.com/user-attachments/assets/928a1aa0-fa71-4b25-8f9b-a399691ce789)
![image](https://github.com/user-attachments/assets/b723355e-1923-4412-8fcf-b4735e3f2165)
![image](https://github.com/user-attachments/assets/c0ac9536-9cf5-46e2-938e-e5d3a7f624a5)
![image](https://github.com/user-attachments/assets/ae757f33-ef25-4379-9000-69a3802d014d)
![image](https://github.com/user-attachments/assets/6e8a38f1-5b44-473d-addf-0ae235abaf2d)
![image](https://github.com/user-attachments/assets/73d0dd63-d26a-4c26-a9fc-67748dd9474a)






