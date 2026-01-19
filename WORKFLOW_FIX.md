# Исправление GitHub Actions Workflow

## Проблема
Workflow падает с exit code 128 при выполнении git push.

## Решение
Обновите файл `.github/workflows/sync-notion.yml` через GitHub UI:

1. Откройте: https://github.com/marfa77/bench-energy-news/blob/main/.github/workflows/sync-notion.yml
2. Нажмите "Edit" (карандаш)
3. Замените шаг "Commit and push changes" на:

```yaml
      - name: Commit and push changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          echo "📦 Добавление файлов в git..."
          git add posts/ sitemap.xml index.html feed.xml || true
          if ! git diff --staged --quiet; then
            echo "💾 Создание коммита..."
            git commit -m "Auto-sync: Update from Notion [skip ci]" || exit 0
            echo "🔄 Синхронизация с удаленным репозиторием..."
            git pull --rebase origin main || true
            echo "📤 Отправка изменений..."
            git push origin main || {
              echo "❌ Ошибка git push. Проверка статуса..."
              git status
              git log --oneline -5
              exit 1
            }
            echo "✅ Изменения отправлены успешно"
          else
            echo "ℹ️  Нет изменений для коммита"
          fi
```

4. Также обновите шаг "Checkout repository":

```yaml
      - name: Checkout repository
        uses: actions/checkout@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0
```

5. Сохраните изменения

## Что исправлено
- Добавлена обработка ошибок в git операциях
- Добавлены отладочные логи для диагностики
- Улучшена обработка конфликтов при pull
- Добавлен вывод статуса git при ошибке push
