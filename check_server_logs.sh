#!/bin/bash
# Скрипт для проверки логов бота на сервере (подключение по SSH с паролем, как в CoinSpillX).

# Загружаем переменные окружения
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

SERVER="${DEPLOY_SERVER:-${SERVER_IP:-37.27.0.210}}"
USER="${DEPLOY_USER:-${SERVER_USER:-root}}"
# Как в CoinSpillX: поддерживаем и SERVER_PASS, и DEPLOY_PASSWORD
PASSWORD="${DEPLOY_PASSWORD:-${SERVER_PASS:-}}"

if [ -z "$PASSWORD" ]; then
    echo "Ошибка: задайте DEPLOY_PASSWORD или SERVER_PASS в .env"
    exit 1
fi

# Как в CoinSpillX: sshpass с паролем
if ! command -v sshpass &> /dev/null; then
    echo "Ошибка: установите sshpass (macOS: brew install hudochenkov/sshpass/sshpass)"
    exit 1
fi

run_ssh() {
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$USER@$SERVER" "$@"
}

echo "Подключение: $USER@$SERVER (по паролю)"
echo ""
echo "=== ЛОГИ БОТА ЗА ВЧЕРА ==="
echo ""

# Статус timer
echo "=== Статус Systemd Timer ==="
run_ssh "systemctl status benchenergy-news.timer --no-pager -l 2>/dev/null | head -20" || echo "Timer не найден"
echo ""

# Расписание
echo "=== Расписание запусков ==="
run_ssh "systemctl list-timers --all | grep bench" || echo "Timer не найден"
echo ""

# Логи за вчера
echo "=== Логи за вчера (последние 50 строк) ==="
run_ssh "journalctl -u benchenergy-news.service --since 'yesterday 00:00' --until 'yesterday 23:59' --no-pager 2>/dev/null | tail -50" || echo "Логи не найдены"
echo ""

# Статистика
echo "=== Статистика запусков ==="
run_ssh "echo 'Количество запусков:' && journalctl -u benchenergy-news.service --since 'yesterday 00:00' --until 'yesterday 23:59' --no-pager 2>/dev/null | grep -c 'Запуск в режиме' || echo '0'" || echo "Не удалось получить статистику"
echo ""

echo "=== Найденные новости ==="
run_ssh "journalctl -u benchenergy-news.service --since 'yesterday 00:00' --until 'yesterday 23:59' --no-pager 2>/dev/null | grep 'Найдено.*новостей'" || echo "Не найдено"
echo ""

echo "=== Успешные публикации ==="
run_ssh "journalctl -u benchenergy-news.service --since 'yesterday 00:00' --until 'yesterday 23:59' --no-pager 2>/dev/null | grep 'Опубликовано в Telegram'" || echo "Не найдено"
echo ""

echo "=== Ошибки ==="
run_ssh "journalctl -u benchenergy-news.service --since 'yesterday 00:00' --until 'yesterday 23:59' --no-pager 2>/dev/null | grep -i 'ошибка\|error' | head -10" || echo "Ошибок не найдено"
echo ""

echo "=== Последние 20 строк логов (все время) ==="
run_ssh "journalctl -u benchenergy-news.service -n 20 --no-pager 2>/dev/null" || echo "Логи не найдены"

echo ""
echo "=== Файл логов бота (bot_status.log, последние 40 строк) ==="
run_ssh "tail -40 /opt/bench-energy-news/bot/logs/bot_status.log 2>/dev/null" || echo "Файл не найден"
