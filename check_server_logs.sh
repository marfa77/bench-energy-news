#!/bin/bash
# Скрипт для проверки логов бота на сервере

# Загружаем переменные окружения
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

SERVER="${DEPLOY_SERVER:-37.27.0.210}"
USER="${DEPLOY_USER:-root}"
PASSWORD="${DEPLOY_PASSWORD:-}"

if [ -z "$PASSWORD" ]; then
    echo "Ошибка: DEPLOY_PASSWORD не установлен в .env"
    exit 1
fi

# Определяем команду SSH
if ssh -o ConnectTimeout=5 -o BatchMode=yes -o StrictHostKeyChecking=no ${USER}@${SERVER} "echo 'Connected'" 2>/dev/null; then
    SSH_CMD="ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
    echo "Используются SSH ключи"
elif command -v sshpass &> /dev/null && [ -n "$PASSWORD" ]; then
    SSH_CMD="sshpass -p '${PASSWORD}' ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
    echo "Используется sshpass с паролем"
else
    echo "Ошибка: sshpass не установлен и SSH ключи не работают"
    exit 1
fi

echo "=== ЛОГИ БОТА ЗА ВЧЕРА ==="
echo ""

# Статус timer
echo "=== Статус Systemd Timer ==="
$SSH_CMD ${USER}@${SERVER} "systemctl status benchenergy-news.timer --no-pager -l 2>/dev/null | head -20" || echo "Timer не найден"
echo ""

# Расписание
echo "=== Расписание запусков ==="
$SSH_CMD ${USER}@${SERVER} "systemctl list-timers --all | grep bench" || echo "Timer не найден"
echo ""

# Логи за вчера
echo "=== Логи за вчера (последние 50 строк) ==="
$SSH_CMD ${USER}@${SERVER} "journalctl -u benchenergy-news.service --since 'yesterday 00:00' --until 'yesterday 23:59' --no-pager 2>/dev/null | tail -50" || echo "Логи не найдены"
echo ""

# Статистика
echo "=== Статистика запусков ==="
$SSH_CMD ${USER}@${SERVER} "echo 'Количество запусков:' && journalctl -u benchenergy-news.service --since 'yesterday 00:00' --until 'yesterday 23:59' --no-pager 2>/dev/null | grep -c 'Запуск в режиме' || echo '0'" || echo "Не удалось получить статистику"
echo ""

echo "=== Найденные новости ==="
$SSH_CMD ${USER}@${SERVER} "journalctl -u benchenergy-news.service --since 'yesterday 00:00' --until 'yesterday 23:59' --no-pager 2>/dev/null | grep 'Найдено.*новостей'" || echo "Не найдено"
echo ""

echo "=== Успешные публикации ==="
$SSH_CMD ${USER}@${SERVER} "journalctl -u benchenergy-news.service --since 'yesterday 00:00' --until 'yesterday 23:59' --no-pager 2>/dev/null | grep 'Опубликовано в Telegram'" || echo "Не найдено"
echo ""

echo "=== Ошибки ==="
$SSH_CMD ${USER}@${SERVER} "journalctl -u benchenergy-news.service --since 'yesterday 00:00' --until 'yesterday 23:59' --no-pager 2>/dev/null | grep -i 'ошибка\|error' | head -10" || echo "Ошибок не найдено"
echo ""

echo "=== Последние 20 строк логов (все время) ==="
$SSH_CMD ${USER}@${SERVER} "journalctl -u benchenergy-news.service -n 20 --no-pager 2>/dev/null" || echo "Логи не найдены"
