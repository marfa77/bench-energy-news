# Проверка таймеров публикации

## Проблема
Последний пост был опубликован в 3 утра, что может указывать на неправильную настройку расписания.

## Где настраиваются таймеры

Таймеры для публикации постов настраиваются на сервере, а не в коде. Есть два варианта:

### 1. Systemd Timer (рекомендуется)

Проверьте наличие systemd timer файла:
```bash
# Проверка активных таймеров
systemctl list-timers --all | grep bench

# Просмотр конкретного timer
systemctl status benchenergy-news.timer

# Просмотр расписания
cat /etc/systemd/system/benchenergy-news.timer
```

Пример правильного расписания (2 раза в день - утром и вечером):
```ini
[Timer]
OnCalendar=*-*-* 08:00,20:00
```

### 2. Cron

Проверьте crontab:
```bash
# Просмотр crontab для пользователя
crontab -l

# Или для root
sudo crontab -l

# Или проверьте системные cron файлы
cat /etc/cron.d/benchenergy-news
```

Пример правильного расписания (2 раза в день):
```bash
# Запуск в 8:00 и 20:00 каждый день
0 8,20 * * * cd /path/to/bench-energy-news/bot && python3 main.py --once
```

## Рекомендуемое расписание

Для оптимального охвата аудитории рекомендуется публикация:
- **Утром**: 08:00 (по местному времени сервера)
- **Вечером**: 20:00 (по местному времени сервера)

Если последний пост был в 3:00, возможно настроено:
- `0 3 * * *` (каждый день в 3:00)
- Или другое расписание

## Как исправить

### Для systemd timer:
```bash
# Отредактируйте timer файл
sudo nano /etc/systemd/system/benchenergy-news.timer

# Измените OnCalendar на:
OnCalendar=*-*-* 08:00,20:00

# Перезагрузите systemd
sudo systemctl daemon-reload

# Перезапустите timer
sudo systemctl restart benchenergy-news.timer
```

### Для cron:
```bash
# Откройте crontab для редактирования
crontab -e

# Измените строку на:
0 8,20 * * * cd /path/to/bench-energy-news/bot && python3 main.py --once
```

## Проверка логов

Проверьте логи для понимания, когда запускался бот:
```bash
# Systemd logs
journalctl -u benchenergy-news.service -n 50

# Или логи приложения
tail -f /path/to/bench-energy-news/bot/logs/*.log
```

## Важно

- Убедитесь, что используется флаг `--once` при запуске через cron/timer
- Проверьте часовой пояс сервера: `timedatectl` или `date`
- Убедитесь, что путь к скрипту правильный в cron/timer
