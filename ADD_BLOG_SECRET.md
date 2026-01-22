# Добавить NOTION_BLOG_PAGE_ID в GitHub Secrets

## 📋 Информация для добавления

### Secret Name
```
NOTION_BLOG_PAGE_ID
```

### Secret Value
```
2f05f3821e2180e99cdef21e05a7a624
```

### Откуда взято
- **URL страницы блога:** https://www.notion.so/pveselov/BenchEnergy-Blog-2f05f3821e2180e99cdef21e05a7a624
- **Page ID:** 32 символа в конце URL (после последнего дефиса)

---

## 🔧 Как добавить в GitHub

1. Перейдите в репозиторий: `https://github.com/marfa77/bench-energy-news`
2. **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **"New repository secret"** (зеленая кнопка)
4. Заполните:
   - **Name:** `NOTION_BLOG_PAGE_ID`
   - **Secret:** `2f05f3821e2180e99cdef21e05a7a624`
5. Нажмите **"Add secret"**

---

## ✅ После добавления

В списке Repository secrets должно быть **6 secrets**:

- ✅ NOTION_API_KEY
- ✅ NOTION_DATABASE_ID
- ✅ NOTION_BLOG_PAGE_ID ← **Добавить этот**
- ✅ VERCEL_TOKEN
- ✅ VERCEL_ORG_ID
- ✅ VERCEL_PROJECT_ID

---

## ⚠️ Важно

После добавления secret, убедитесь, что:
1. Интеграция Notion подключена к родительской странице блога:
   - Откройте страницу: https://www.notion.so/pveselov/BenchEnergy-Blog-2f05f3821e2180e99cdef21e05a7a624
   - Нажмите `...` в правом верхнем углу
   - **Connections** → **Add connections**
   - Выберите вашу интеграцию (ту же, что для новостей)

---

**Дата:** 2026-01-22
