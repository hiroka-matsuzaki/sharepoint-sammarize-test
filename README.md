# sharepoint-sammarize-test

## Azure Functions
Azure Functionsの作成（リソースが存在しない場合のみ）
```bash
az functionapp create \
  --resource-group smatsu-test \
  --name smatsu-test-func \
  --storage-account smatsutest \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4 \
  --os-type Linux \
  --consumption-plan-location japanwest
```

```bash
az functionapp config appsettings set \
  --name smatsu-test-func \
  --resource-group smatsu-test \
  --settings \
  CLIENT_ID=<クライアントID> \
  CLIENT_SECRET=<クライアントシークレット> \
  TENANT_ID=<テナントID> \
```

存在するリソースへのデプロイ
```bash
    func azure functionapp publish smatsu-test-func --typescrip
```
