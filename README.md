# 兰兰导管日记

一个用于记录每日导管次数的纯前端小网页：导完一次就点一下“记录一次”，自动累计今天的次数；界面风格和“习惯打卡”一致，数据保存在浏览器本地（localStorage），不上传任何服务器。

## 功能
- “今日”页显示今天已导管次数，支持“＋记录一次”和“撤销一次”
- “历史”页按月查看哪些天有记录，点击日期可看当天次数
- 统计今日次数与连续导管天数
- 浅色卡片风界面，适配手机

## 本地使用
直接用浏览器打开 `index.html` 即可。

## 部署到 GitHub Pages（公开仓库）
1. 到 github.com 注册并登录免费账号
2. 新建**公开**仓库，名称例如 `catheter-diary`（不要勾选“自动创建 README”）
3. 在本目录执行（首次 `git push` 会弹出浏览器登录 GitHub）：
   ```
   git init
   git add .
   git commit -m "初始提交：兰兰导管日记"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/catheter-diary.git
   git push -u origin main
   ```
4. 打开仓库网页 Settings → Pages：Source 选 “Deploy from a branch”，Branch 选 `main`、目录 `/ (root)`，点 Save
5. 等待 1–2 分钟后访问 `https://<你的用户名>.github.io/catheter-diary/`

说明：GitHub Pages 免费账号只支持公开仓库；记录数据存在各设备的浏览器本地，不同设备 / 浏览器之间不互通。

## 数据存储
- localStorage 键名：`lanlan-catheter-diary-v1`
- 结构：`records` 按 `YYYY-MM-DD` 保存当天导管次数
