# 使用官方 Node.js 基礎鏡像
FROM node:16

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json 文件
COPY package*.json ./

# 安裝專案依賴
RUN npm install

# 複製專案文件到工作目錄
COPY . .

# 開放應用運行端口
EXPOSE 3000

# 啟動 Node.js 應用
CMD ["node", "bin/www"]

