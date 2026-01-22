#!/bin/bash
# Скрипт для проверки статуса деплоя на сервере

echo "🔍 Проверка статуса деплоя на сервере..."
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Проверка подключения к серверу (если есть SSH доступ)
# Замените на ваш сервер
# SERVER="user@your-server.com"
# REPO_PATH="/path/to/bench-energy-news"

# Если нужно проверить локально (для тестирования)
if [ -d "bot" ]; then
    echo "📂 Локальная проверка:"
    echo ""
    
    # Проверка последнего коммита
    echo "📝 Последний коммит:"
    git log --oneline -1
    echo ""
    
    # Проверка статуса git
    echo "📊 Статус git:"
    git status --short
    echo ""
    
    # Проверка изменений в ключевых файлах
    echo "🔍 Проверка ключевых файлов:"
    if [ -f "bot/post_versions_generator.py" ]; then
        if grep -q "generate_freight_post" bot/post_versions_generator.py; then
            echo -e "${GREEN}✅ bot/post_versions_generator.py содержит generate_freight_post${NC}"
        else
            echo -e "${RED}❌ bot/post_versions_generator.py не содержит generate_freight_post${NC}"
        fi
        
        if grep -q "DO NOT invent specific numbers" bot/post_versions_generator.py; then
            echo -e "${GREEN}✅ Защита от выдуманных цифр активна${NC}"
        else
            echo -e "${YELLOW}⚠️  Защита от выдуманных цифр не найдена${NC}"
        fi
        
        # Проверяем только функцию generate_freight_post (не обычные посты)
        if grep -A 50 "def generate_freight_post" bot/post_versions_generator.py | grep -q "li_version"; then
            echo -e "${RED}❌ LinkedIn версия все еще в generate_freight_post${NC}"
        else
            echo -e "${GREEN}✅ LinkedIn версия удалена из generate_freight_post${NC}"
        fi
    fi
    
    if [ -f "bot/main.py" ]; then
        if grep -q "generate_freight_post" bot/main.py; then
            echo -e "${GREEN}✅ bot/main.py интегрирован с generate_freight_post${NC}"
        else
            echo -e "${RED}❌ bot/main.py не интегрирован${NC}"
        fi
    fi
    
    if [ -f "bot/storage.py" ]; then
        if grep -q "should_generate_freight_post" bot/storage.py; then
            echo -e "${GREEN}✅ bot/storage.py содержит логику счетчика постов${NC}"
        else
            echo -e "${RED}❌ bot/storage.py не содержит логику счетчика${NC}"
        fi
    fi
    
    echo ""
    echo "📦 Проверка зависимостей:"
    if [ -f "bot/requirements.txt" ]; then
        echo "✅ requirements.txt найден"
    else
        echo "❌ requirements.txt не найден"
    fi
fi

echo ""
echo "📋 Команды для проверки на сервере:"
echo ""
echo "1. Проверить статус git:"
echo "   cd /path/to/bench-energy-news && git status"
echo ""
echo "2. Проверить последний коммит:"
echo "   cd /path/to/bench-energy-news && git log --oneline -3"
echo ""
echo "3. Обновить код с GitHub:"
echo "   cd /path/to/bench-energy-news && git pull origin main"
echo ""
echo "4. Проверить systemd timer:"
echo "   systemctl status benchenergy-news.timer"
echo "   systemctl list-timers --all | grep bench"
echo ""
echo "5. Проверить логи бота:"
echo "   journalctl -u benchenergy-news.service -n 50"
echo "   # или"
echo "   tail -f /path/to/bench-energy-news/bot/logs/*.log"
echo ""
echo "6. Проверить, что изменения применены:"
echo "   grep -r 'generate_freight_post' /path/to/bench-energy-news/bot/"
echo "   grep -r 'DO NOT invent specific numbers' /path/to/bench-energy-news/bot/"
echo ""
