# TallyPro Server 部署指南

## 项目结构

```
├── docker/                        # Docker 相关
│   ├── Dockerfile                 # 服务端镜像（多阶段构建）
│   ├── docker-compose.yml         # 服务编排 + Traefik 接入
│   ├── .dockerignore              # 镜像构建排除规则
│   └── init.sql                   # 数据库初始化脚本
├── configs/                       # 统一配置
│   ├── .env.example               # 环境变量模板（入仓库）
│   ├── .env                       # 本地开发环境变量（gitignored）
│   └── .env.production            # 生产环境变量（CI 自动生成）
└── .github/workflows/deploy.yml   # CI/CD 工作流
```

## 部署架构

```
  用户请求 (HTTPS)
       │
  ┌────▼─────┐
  │ Traefik  │  ← 服务器已有，管理证书和路由
  │  (proxy) │
  └────┬─────┘
       │  proxy 网络 (external)
  ┌────▼─────┐
  │  server  │  ← ghcr.io/wh131462/tallypro-server
  │  :8866   │
  └────┬─────┘
       │  internal 网络
  ┌────▼─────┐
  │  mysql   │  ← 仅内部可达，不暴露端口
  │  :3306   │
  └──────────┘
```

- **proxy** (external)：与 Traefik 共享，server 通过 labels 自动注册路由和 HTTPS 证书
- **internal** (bridge)：项目内部 server ↔ mysql 通信，外部不可达

域名：`tally-api.131462.wang`

---

## CI/CD 自动部署（推荐）

代码推送 master 后全自动：构建镜像 → 推送 GHCR → 同步配置 → 部署，无需登录服务器。

### 1. 配置 GitHub Secrets

在仓库 **Settings → Secrets and variables → Actions** 中添加：

**服务器连接**：

| Secret | 说明 | 示例 |
|--------|------|------|
| `DEPLOY_HOST` | 服务器 IP 或域名 | `1.2.3.4` |
| `DEPLOY_USER` | SSH 用户名 | `root` |
| `DEPLOY_KEY` | SSH 私钥内容 | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DEPLOY_PATH` | 服务器上的部署目录 | `/opt/tally-pro` |

**应用配置**：

| Secret | 说明 | 示例 |
|--------|------|------|
| `APP_PORT` | 服务端口 | `8866` |
| `DB_NAME` | 数据库名 | `tally_pro` |
| `DB_USER` | 数据库用户名 | `root` |
| `DB_PASSWORD` | 数据库密码 | `your_strong_password` |
| `WX_APP_ID` | 微信小程序 AppID | `wx71ec...` |
| `WX_APP_SECRET` | 微信小程序 Secret | `96532c...` |
| `JWT_SECRET` | JWT 签名密钥 | `openssl rand -base64 32 生成` |
| `ADMIN_PASSWORD` | 管理后台密码 | `your_admin_password` |

**前端配置**（已硬编码，通常无需修改）：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_BASE_URL` | 前端 API 请求地址 | `https://tally-api.131462.wang/api` |

> `GITHUB_TOKEN` 由 Actions 自动注入，GHCR 推送无需额外配置。

### 2. 生成 SSH 密钥

```bash
# 本地生成密钥对
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# 公钥添加到服务器
ssh-copy-id -i ~/.ssh/github_actions.pub user@your-server

# 私钥内容复制到 GitHub Secret (DEPLOY_KEY)
cat ~/.ssh/github_actions
```

### 3. 服务器前置条件

确保服务器已安装 Docker 和 Traefik。proxy 网络 CI 会自动创建，通常无需手动操作。

### 4. 触发部署

```bash
git push origin master
```

CI 自动完成：
1. 构建 Docker 镜像（多阶段构建）
2. 推送到 `ghcr.io/wh131462/tallypro-server:latest`
3. 同步 `docker/` 目录到服务器
4. 从 GitHub Secrets 生成 `configs/.env.production`
5. 创建 proxy 网络（如不存在）
6. 拉取最新镜像并启动所有服务

### 触发条件

推送 `master` 分支，且变更涉及以下路径：

- `packages/server/**` / `packages/shared/**`
- `docker/**`
- `.github/workflows/deploy.yml`

### 镜像标签

```
ghcr.io/wh131462/tallypro-server:latest   # 最新版
ghcr.io/wh131462/tallypro-server:<sha>    # 按 commit SHA 标记
```

---

## 手动部署

### 1. 上传配置到服务器

```bash
mkdir -p /opt/tally-pro/{docker,configs}

# 上传 docker/ 目录和 configs/.env.example
scp -r docker/ user@server:/opt/tally-pro/
scp configs/.env.example user@server:/opt/tally-pro/configs/.env.production
```

### 2. 配置环境变量

```bash
ssh user@server
cd /opt/tally-pro
vim configs/.env.production
```

### 3. 启动

```bash
docker network create proxy 2>/dev/null
echo $GITHUB_TOKEN | docker login ghcr.io -u wh131462 --password-stdin
cd docker && docker compose up -d
```

### 4. 验证

```bash
docker compose ps
docker compose logs -f server
curl https://tally-api.131462.wang/api/health
```

---

## 常用运维命令

```bash
# 查看服务状态
docker compose -f docker/docker-compose.yml ps

# 查看日志
docker compose -f docker/docker-compose.yml logs -f server

# 手动更新并重启
docker compose -f docker/docker-compose.yml pull server
docker compose -f docker/docker-compose.yml up -d server

# 进入 MySQL
docker exec -it tally-pro-mysql mysql -uroot -p tally_pro

# 查看资源占用
docker stats
```

---

## 数据备份

```bash
# 备份数据库
docker exec tally-pro-mysql mysqldump -uroot -p tally_pro > backup_$(date +%Y%m%d).sql

# 恢复数据库
cat backup.sql | docker exec -i tally-pro-mysql mysql -uroot -p tally_pro

# 备份上传文件
docker run --rm -v tally-pro_uploads_data:/data -v $(pwd):/backup alpine \
  tar -czvf /backup/uploads_backup_$(date +%Y%m%d).tar.gz /data
```

---

## 故障排查

```bash
# 容器日志
docker logs tally-pro-server --tail 100

# 进入容器调试
docker exec -it tally-pro-server sh

# 检查网络连通
docker exec tally-pro-server ping mysql

# 检查 Traefik 路由
docker logs <traefik-container> 2>&1 | grep tally

# 检查镜像
docker images | grep tallypro
```
