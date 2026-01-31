#!/bin/bash
# Запускать НА СЕРВЕРЕ (после ssh root@37.27.0.210 или из панели Hetzner → Console).
# Как в CoinSpillX: логи смотрят на самой машине, без SSH с ноутбука.

echo "📋 Логи benchenergy-news.service за вчера:"
echo "=========================================="
echo ""

journalctl -u benchenergy-news.service --since "yesterday 00:00:00" --until "today 00:00:00" --no-pager

echo ""
echo "=========================================="
echo "📊 Статистика за вчера:"
echo ""

SUCCESS_COUNT=$(journalctl -u benchenergy-news.service --since "yesterday 00:00:00" --until "today 00:00:00" --no-pager | grep -c "✅\|Опубликовано в Telegram" || true)
ERROR_COUNT=$(journalctl -u benchenergy-news.service --since "yesterday 00:00:00" --until "today 00:00:00" --no-pager | grep -c "❌\|ошибка\|error\|Ошибка" || true)

echo "✅ Успешных публикаций: $SUCCESS_COUNT"
echo "❌ Ошибок: $ERROR_COUNT"
echo ""

echo "📅 Статус таймера:"
systemctl status benchenergy-news.timer --no-pager -l 2>/dev/null | head -20 || echo "Таймер не найден"

echo ""
echo "⏰ Следующие запуски:"
systemctl list-timers benchenergy-news.timer --no-pager 2>/dev/null || true

echo ""
echo "=== Последние 30 строк логов ==="
journalctl -u benchenergy-news.service -n 30 --no-pager
