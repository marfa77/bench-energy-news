#!/bin/bash
# Скрипт для деплоя изменений на сервер и проверки

set -e

SERVER="37.27.0.210"
USER="root"
PASSWORD="gMrEc3RiFKVh"
PROJECT_NAME="bench-energy-news"

echo "🚀 Деплой изменений на сервер..."
echo ""

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Проверка подключения
echo "📡 Проверка подключения к серверу..."

# Используем sshpass с паролем
if command -v sshpass &> /dev/null; then
    SSH_CMD="sshpass -p '${PASSWORD}' ssh -o StrictHostKeyChecking=no"
    echo -e "${GREEN}✅ Используется sshpass для подключения${NC}"
elif ssh -o ConnectTimeout=5 -o BatchMode=yes -o StrictHostKeyChecking=no ${USER}@${SERVER} "echo 'Connected'" 2>/dev/null; then
    SSH_CMD="ssh"
    echo -e "${GREEN}✅ Подключение к серверу успешно (SSH ключи)${NC}"
else
    echo -e "${RED}❌ sshpass не установлен и SSH ключи не работают${NC}"
    exit 1
fi

# Поиск пути к проекту на сервере
echo ""
echo "🔍 Поиск пути к проекту на сервере..."
PROJECT_PATH=$(${SSH_CMD} ${USER}@${SERVER} "find /opt /root /home -type d -name '${PROJECT_NAME}' -o -name 'bench-energy-news' 2>/dev/null | head -1" 2>/dev/null || echo "")

if [ -z "$PROJECT_PATH" ]; then
    echo -e "${YELLOW}⚠️  Проект не найден, пробую стандартные пути...${NC}"
    # Пробуем стандартные пути
    for path in "/opt/bench-energy-news" "/opt/${PROJECT_NAME}" "/root/${PROJECT_NAME}" "/root/bench-energy-news"; do
        if ${SSH_CMD} ${USER}@${SERVER} "test -d $path" 2>/dev/null; then
            PROJECT_PATH=$path
            break
        fi
    done
fi

if [ -z "$PROJECT_PATH" ]; then
    echo -e "${RED}❌ Не удалось найти проект на сервере${NC}"
    echo "Проверьте путь вручную:"
    echo "${SSH_CMD} ${USER}@${SERVER} 'find / -type d -name \"bench-energy-news\" 2>/dev/null'"
    exit 1
fi

echo -e "${GREEN}✅ Проект найден: ${PROJECT_PATH}${NC}"

# Проверка текущего коммита на сервере
echo ""
echo "📝 Текущий коммит на сервере:"
${SSH_CMD} ${USER}@${SERVER} "cd ${PROJECT_PATH} && git log --oneline -1" || echo "Не удалось получить коммит"

# Обновление кода
echo ""
echo "🔄 Обновление кода на сервере..."
${SSH_CMD} ${USER}@${SERVER} "cd ${PROJECT_PATH} && git fetch origin && git pull origin main"

# Проверка изменений
echo ""
echo "🔍 Проверка примененных изменений..."
if ${SSH_CMD} ${USER}@${SERVER} "cd ${PROJECT_PATH} && grep -r 'generate_freight_post' bot/ 2>/dev/null | head -1"; then
    echo -e "${GREEN}✅ generate_freight_post найден${NC}"
else
    echo -e "${RED}❌ generate_freight_post не найден${NC}"
fi

if ${SSH_CMD} ${USER}@${SERVER} "cd ${PROJECT_PATH} && grep -r 'DO NOT invent specific numbers' bot/post_versions_generator.py 2>/dev/null"; then
    echo -e "${GREEN}✅ Защита от выдуманных цифр активна${NC}"
else
    echo -e "${YELLOW}⚠️  Защита от выдуманных цифр не найдена${NC}"
fi

# Проверка последнего коммита
echo ""
echo "📝 Последний коммит на сервере после обновления:"
${SSH_CMD} ${USER}@${SERVER} "cd ${PROJECT_PATH} && git log --oneline -1"

# Проверка статуса бота
echo ""
echo "🤖 Проверка статуса бота..."
if ${SSH_CMD} ${USER}@${SERVER} "systemctl list-timers --all | grep bench" 2>/dev/null; then
    echo -e "${GREEN}✅ Systemd timer найден${NC}"
    ${SSH_CMD} ${USER}@${SERVER} "systemctl status benchenergy-news.timer --no-pager -l" || echo "Timer не найден"
else
    echo -e "${YELLOW}⚠️  Systemd timer не найден, проверяю cron...${NC}"
    ${SSH_CMD} ${USER}@${SERVER} "crontab -l 2>/dev/null | grep bench" || echo "Cron задача не найдена"
fi

# Проверка логов
echo ""
echo "📋 Последние логи бота:"
${SSH_CMD} ${USER}@${SERVER} "journalctl -u benchenergy-news.service -n 20 --no-pager 2>/dev/null" || echo "Логи не найдены"

echo ""
echo -e "${GREEN}✅ Деплой завершен!${NC}"
echo ""
echo "Для проверки вручную выполните:"
echo "${SSH_CMD} ${USER}@${SERVER}"
echo "cd ${PROJECT_PATH}"
echo "git log --oneline -3"
echo "systemctl status benchenergy-news.timer"
