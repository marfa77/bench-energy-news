#!/bin/bash

# Скрипт для получения VERCEL_ORG_ID и VERCEL_PROJECT_ID
# Использует Vercel API с токеном

# Vercel токен из GITHUB_SECRETS_SETUP.md
VERCEL_TOKEN="Tu0x0MhTNWA49HdrXpTrh0MH"

echo "🔍 Получение Vercel Organization ID и Project ID..."
echo ""

# Получаем список команд/организаций
echo "📋 Список команд/организаций:"
echo "---"
curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  https://api.vercel.com/v2/teams | jq -r '.teams[] | "Team ID: \(.id)\nTeam Name: \(.name)\nTeam Slug: \(.slug)\n---"'

echo ""
echo "📦 Список проектов:"
echo "---"
curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  https://api.vercel.com/v9/projects | jq -r '.projects[] | "Project ID: \(.id)\nProject Name: \(.name)\nTeam ID: \(.accountId)\n---"'

echo ""
echo "✅ Если вы используете личный аккаунт (не team), используйте ваш User ID"
echo "   Получить User ID можно через: curl -H \"Authorization: Bearer $VERCEL_TOKEN\" https://api.vercel.com/v2/user"
