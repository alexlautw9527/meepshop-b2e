
## 架構說明

- 主要框架：Express
- 資料庫：sqlite
- ORM：Prisma
  - Prisma 當中的 `$transaction` 可以達到原子化
- [在 VSC 可以直接檢視 sqlite 的 extension](https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer)

## 第一步：初始化資料庫

```
npm i 
npx dotenv -e .env.test -- npx prisma db push
npx dotenv -e .env -- npx prisma db push
```

## 第二步：Docker 啟動

```
docker-compose up api
```

可從 `localhost:8000` 打 API 

## API 

- 創建帳戶 POST `/api/accounts`
  - body
    - `name`
    - `initialBalance`
- 存款 POST `/api/accounts/:accountId/deposit`
  - param
    - `accountId`
  - body
    - `amount`
- 領錢 POST `/api/accounts/:accountId/withdraw`
  - param
    - `accountId`
  - body
    - `amount`
- 轉帳 POST `/api/transfers`
  - body
    - `fromAccountId`
    - `toAccountId`
    - `amount`
- 查看交易紀錄 GET `/accounts/:accountId/transactions`
- 查看目前帳戶列表 GET `/accounts/`

## 使用說明

- 可從 GET `/accounts/` 查詢用戶 id 來進行操作

## 整合測試

```
npm run test:watch
```