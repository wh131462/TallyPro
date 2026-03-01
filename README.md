# TallyPro 计工宝

计件记工微信小程序 —— 让计件工资管理更简单。

企业主（雇主）设置产品与工序，员工按天填报工作量，企业主审核确认，系统自动按单价结算工资。

## 技术栈

- **前端**：uni-app (Vue 3 + TypeScript)
- **后端**：Express + MySQL + Sequelize
- **共享**：TypeScript 类型定义 & 常量
- **包管理**：pnpm workspace monorepo

## 项目结构

```
tally-pro/
├── packages/
│   ├── app/              # uni-app 小程序前端
│   ├── server/           # Node.js 后端服务
│   └── shared/           # 前后端共享类型 & 常量
├── docs/                 # 产品文档
├── design/               # 设计稿
├── pnpm-workspace.yaml   # workspace 配置
└── package.json          # 根配置 & 全局脚本
```

## 快速开始

```bash
# 安装 pnpm（如未安装）
npm install -g pnpm

# 安装所有依赖
pnpm install

# 启动小程序开发
pnpm dev:app

# 启动 H5 开发
pnpm dev:h5

# 启动后端服务
pnpm dev:server

# 构建小程序
pnpm build:app
```

## 包说明

| 包 | 说明 |
|---|---|
| `@tally-pro/app` | 微信小程序前端（uni-app） |
| `@tally-pro/server` | 后端 API 服务（Express + MySQL） |
| `@tally-pro/shared` | 共享 TypeScript 类型定义和常量 |

## 文档

- [产品设计文档](docs/PRODUCT_DESIGN.md)
