"""
Модуль для публикации новостей на веб-сайт через GitHub Pages.
Создает HTML файлы, обновляет sitemap.xml и отправляет в Google Indexing API.
"""
import os
import json
import subprocess
import requests
import logging
from pathlib import Path
from typing import Optional, Dict, Tuple
from datetime import datetime
from urllib.parse import quote
from dotenv import load_dotenv

load_dotenv()

# Настройка логирования
LOG_DIR = Path(__file__).parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

# Файл для логов публикации
PUBLISH_LOG_FILE = LOG_DIR / "web_publish.log"
ERROR_LOG_FILE = LOG_DIR / "web_publish_errors.log"

# Настройка логгера для публикации
publish_logger = logging.getLogger("web_publisher")
publish_logger.setLevel(logging.DEBUG)

# Обработчик для общего лога (INFO и выше)
publish_handler = logging.FileHandler(PUBLISH_LOG_FILE, encoding='utf-8')
publish_handler.setLevel(logging.INFO)
publish_formatter = logging.Formatter(
    '%(asctime)s | %(levelname)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
publish_handler.setFormatter(publish_formatter)

# Обработчик для ошибок (ERROR и выше)
error_handler = logging.FileHandler(ERROR_LOG_FILE, encoding='utf-8')
error_handler.setLevel(logging.ERROR)
error_formatter = logging.Formatter(
    '%(asctime)s | ERROR | %(message)s\n%(exc_info)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
error_handler.setFormatter(error_formatter)

# Добавляем обработчики
if not publish_logger.handlers:
    publish_logger.addHandler(publish_handler)
    publish_logger.addHandler(error_handler)

def log_info(message: str):
    """Логирует информационное сообщение"""
    print(message)
    publish_logger.info(message)

def log_error(message: str, exc_info=None):
    """Логирует ошибку"""
    print(f"❌ {message}")
    publish_logger.error(message, exc_info=exc_info)

def log_warning(message: str):
    """Логирует предупреждение"""
    print(f"⚠️  {message}")
    publish_logger.warning(message)

def log_success(message: str):
    """Логирует успешное действие"""
    print(f"✅ {message}")
    publish_logger.info(f"SUCCESS: {message}")

# GitHub Pages настройки
# Для публикации новостей используйте ОТДЕЛЬНЫЙ репозиторий, чтобы избежать конфликтов
NEWS_REPO_PATH = os.getenv("NEWS_REPO_PATH")  # Путь к отдельному репозиторию для новостей
GITHUB_REPO_PATH = os.getenv("GITHUB_REPO_PATH", NEWS_REPO_PATH or ".")  # Fallback для совместимости
GITHUB_REPO_URL = os.getenv("GITHUB_REPO_URL")  # URL репозитория для push
GITHUB_BRANCH = os.getenv("GITHUB_BRANCH", "main")  # Ветка для публикации
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")  # Personal Access Token для автоматического push
SITE_URL = os.getenv("SITE_URL", "https://bench.energy")  # URL сайта для новостей

# Google Indexing API
# Путь к ключу может быть относительным (от корня проекта) или абсолютным
GOOGLE_INDEXING_KEY_PATH = os.getenv("GOOGLE_INDEXING_KEY_PATH", "google-indexing-key.json")


def create_slug(title: str) -> str:
    """
    Создает URL-friendly slug из заголовка.
    
    Args:
        title: Заголовок новости
        
    Returns:
        Slug для использования в URL
    """
    import re
    # Убираем HTML теги
    title = re.sub(r'<[^>]+>', '', title)
    # Заменяем пробелы на дефисы, убираем спецсимволы
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    slug = slug.strip('-')
    # Ограничиваем длину
    if len(slug) > 80:
        slug = slug[:80].rstrip('-')
    return slug


def create_ai_summary(news_title: str, news_summary: str) -> str:
    """
    Создает краткое AI Summary для блока в начале статьи.
    
    Args:
        news_title: Заголовок новости
        news_summary: Краткое содержание
        
    Returns:
        AI Summary в 2 предложениях
    """
    # Берем первые 2 предложения из summary или создаем краткое описание
    sentences = news_summary.split('. ')
    if len(sentences) >= 2:
        summary = '. '.join(sentences[:2])
        if not summary.endswith('.'):
            summary += '.'
    else:
        summary = news_summary[:200] + '...' if len(news_summary) > 200 else news_summary
    
    return summary


def create_schema_org_markup(news_data: Dict, article_url: str, html_content: str = "") -> str:
    """
    Создает расширенную Schema.org разметку NewsArticle для SEO и LLM.
    
    Args:
        news_data: Словарь с данными новости
        article_url: URL опубликованной статьи
        html_content: HTML контент статьи (для улучшенной оптимизации)
        
    Returns:
        JSON-LD разметка
    """
    # Используем улучшенную SEO оптимизацию если доступна
    try:
        from seo_optimizer import generate_enhanced_schema_org
        return generate_enhanced_schema_org(news_data, article_url, html_content)
    except ImportError:
        # Fallback на базовую версию
        pass
    
    # Базовая версия (fallback)
    schema = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": news_data.get("title", ""),
        "description": news_data.get("summary", ""),
        "datePublished": datetime.now().isoformat(),
        "dateModified": datetime.now().isoformat(),
        "author": {
            "@type": "Organization",
            "name": "Bench Energy",
            "url": "https://t.me/benchenergy",
            "sameAs": [
                "https://t.me/benchenergy",
                article_url
            ]
        },
        "publisher": {
            "@type": "Organization",
            "name": "Bench Energy",
            "url": "https://t.me/benchenergy",
            "logo": {
                "@type": "ImageObject",
                "url": f"{SITE_URL}/assets/bench-energy-logo.png"
            },
            "sameAs": [
                "https://t.me/benchenergy"
            ]
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": article_url
        },
        "articleSection": news_data.get("category", "Coal"),
        "keywords": "coal market, energy news, thermal coal, coking coal, freight, shipping, Bench Energy, Telegram channel @benchenergy",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": f"{SITE_URL}/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "News",
                    "item": f"{SITE_URL}/posts/"
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": news_data.get("title", "")[:50],
                    "item": article_url
                }
            ]
        }
    }
    
    if news_data.get("source_url"):
        schema["sameAs"] = [news_data["source_url"], "https://t.me/benchenergy"]
    else:
        schema["sameAs"] = ["https://t.me/benchenergy"]
    
    return json.dumps(schema, indent=2, ensure_ascii=False)


def create_html_article(news_data: Dict, web_version: str, image_url: Optional[str] = None, published_date: Optional[datetime] = None) -> Tuple[str, str, str]:
    """
    Создает HTML шаблон для новости с SEO оптимизацией.
    
    Args:
        news_data: Словарь с данными новости
        web_version: HTML контент статьи
        image_url: URL изображения (опционально)
        published_date: Дата публикации (опционально, по умолчанию текущая дата)
        
    Returns:
        Кортеж (html_content, article_url, slug)
    """
    title = news_data.get("title", "")
    summary = news_data.get("summary", "")
    source_url = news_data.get("source_url", "")
    source_name = news_data.get("source_name", "Unknown")
    category = news_data.get("category", "Coal")
    
    # Создаем AI Summary
    ai_summary = create_ai_summary(title, summary)
    
    # Определяем изображение для OpenGraph
    og_image = image_url or f"{SITE_URL}/assets/default-news.jpg"
    
    # Используем переданную дату или текущую дату
    if published_date is None:
        published_date = datetime.now()
    
    # Форматируем дату публикации
    pub_date = published_date.strftime("%Y-%m-%dT%H:%M:%S+00:00")
    pub_date_display = published_date.strftime("%B %d, %Y")
    
    # Создаем slug для URL
    slug = create_slug(title)
    article_url = f"{SITE_URL}/posts/{slug}.html"
    
    # Schema.org разметка (с улучшенной SEO оптимизацией)
    schema_markup = create_schema_org_markup(news_data, article_url, web_version)
    
    # Экранируем HTML в title и summary для мета-тегов
    import html
    title_escaped = html.escape(title)
    summary_escaped = html.escape(summary[:200])
    
    html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title_escaped} | Bench Energy</title>
    <meta name="description" content="{summary_escaped[:160]}">
    <meta name="keywords" content="coal market, energy news, thermal coal, coking coal, freight, shipping, Bench Energy, @benchenergy, Telegram channel">
    <meta name="author" content="Bench Energy">
    <link rel="canonical" href="{article_url}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="{article_url}">
    <meta property="og:title" content="{title_escaped}">
    <meta property="og:description" content="{summary_escaped}">
    <meta property="og:image" content="{og_image}">
    <meta property="og:site_name" content="Bench Energy">
    <meta property="article:author" content="Bench Energy">
    <meta property="article:published_time" content="{pub_date}">
    <meta property="article:modified_time" content="{pub_date}">
    <meta property="article:section" content="{category}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="{article_url}">
    <meta name="twitter:title" content="{title_escaped}">
    <meta name="twitter:description" content="{summary_escaped}">
    <meta name="twitter:image" content="{og_image}">
    
    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
    {schema_markup}
    </script>
    
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-F55Q439F8J"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());

      gtag('config', 'G-F55Q439F8J');
    </script>
    
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }}
        .answer-capsule {{
            background: #f0f7ff;
            border-left: 4px solid #0066cc;
            padding: 1.25rem;
            margin: 2rem 0;
            border-radius: 4px;
            font-size: 1.05rem;
            line-height: 1.7;
        }}
        .answer-capsule p {{
            margin: 0;
            color: #1a1a1a;
        }}
        .header {{
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        .header h1 {{
            margin: 0 0 10px 0;
            font-size: 2em;
            color: #1a1a1a;
        }}
        .meta {{
            color: #666;
            font-size: 0.9em;
            margin-bottom: 20px;
        }}
        .ai-summary {{
            background: #f0f9f4;
            border-left: 4px solid #22c55e;
            border-radius: 8px;
            padding: 1.25rem 1.5rem;
            margin: 1.5rem 0;
            font-size: 0.95rem;
            line-height: 1.7;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }}
        .ai-summary b {{
            color: #22c55e;
            font-weight: 700;
            font-size: 1rem;
        }}
        .content {{
            margin: 30px 0;
        }}
        .content h2 {{
            color: #1a1a1a;
            margin-top: 30px;
        }}
        .content p {{
            margin: 15px 0;
        }}
        .source-link {{
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }}
        .source-link a {{
            color: #1976D2;
            text-decoration: none;
        }}
        .source-link a:hover {{
            text-decoration: underline;
        }}
        .telegram-link {{
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background: #0088cc;
            color: white;
            text-decoration: none;
            border-radius: 5px;
        }}
        .telegram-link:hover {{
            background: #006ba3;
        }}
        .category-badge {{
            display: inline-block;
            padding: 5px 10px;
            background: #e3f2fd;
            color: #1976D2;
            border-radius: 3px;
            font-size: 0.85em;
            margin-bottom: 10px;
        }}
        img {{
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 20px 0;
        }}
    </style>
</head>
<body>
    <div class="header">
        <span class="category-badge">{category}</span>
        <h1>{title}</h1>
        <div class="meta">
            Published: {pub_date_display} | Bench Energy
        </div>
    </div>
    
    <div class="ai-summary">
        <b>AI Summary:</b> {ai_summary}
    </div>
    
    {f'<img src="{image_url}" alt="{title_escaped}" />' if image_url else ''}
    
    <div class="content">
        {web_version}
    </div>
    
    <div class="source-link">
        <strong>Source:</strong> <a href="{source_url}" target="_blank" rel="noopener noreferrer">{source_name}</a>
    </div>
    
    <div style="margin-top: 40px; padding: 20px; background: #f5f5f5; border-radius: 8px;">
        <h3 style="margin-top: 0;">📱 Follow Bench Energy on Telegram</h3>
        <p>Get the latest coal market news and analysis directly in your Telegram:</p>
        <a href="https://t.me/benchenergy" class="telegram-link" target="_blank" rel="noopener noreferrer">
            📱 Join @benchenergy Channel
        </a>
        <p style="margin-top: 15px; font-size: 0.9em; color: #666;">
            Bench Energy provides daily updates on coal markets, freight rates, and energy industry news. 
            Follow our Telegram channel <strong>@benchenergy</strong> for real-time market insights.
        </p>
    </div>
</body>
</html>"""
    
    return html_template, article_url, slug


def update_sitemap(article_url: str, slug: str, repo_path: str):
    """
    Обновляет sitemap.xml, добавляя новую статью.
    Безопасно работает с существующим sitemap.xml, не перезаписывает его полностью.
    
    Args:
        article_url: URL статьи
        slug: Slug статьи
        repo_path: Путь к репозиторию
    """
    sitemap_path = Path(repo_path) / "sitemap.xml"
    posts_dir = Path(repo_path) / "posts"
    posts_dir.mkdir(exist_ok=True)
    
    # Читаем существующий sitemap или создаем новый
    if sitemap_path.exists():
        print(f"   ℹ️  Обнаружен существующий sitemap.xml, обновляю...")
        try:
            with open(sitemap_path, 'r', encoding='utf-8') as f:
                sitemap_content = f.read()
        except:
            sitemap_content = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>"""
    else:
        sitemap_content = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>"""
    
    # Проверяем, есть ли уже эта статья в sitemap
    if article_url not in sitemap_content:
        # Добавляем новую запись
        lastmod = datetime.now().strftime("%Y-%m-%d")
        new_entry = f"""  <url>
    <loc>{article_url}</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>"""
        
        # Вставляем перед закрывающим тегом, сохраняя существующую структуру
        if "</urlset>" in sitemap_content:
            sitemap_content = sitemap_content.replace("</urlset>", new_entry + "\n</urlset>")
        else:
            # Если структура нестандартная, добавляем в конец перед закрывающим тегом
            sitemap_content = sitemap_content.rstrip() + "\n" + new_entry + "\n</urlset>"
        
        # Сохраняем
        try:
            with open(sitemap_path, 'w', encoding='utf-8') as f:
                f.write(sitemap_content)
            log_info(f"Sitemap обновлен: {article_url}")
        except Exception as e:
            log_error(f"Ошибка обновления sitemap: {e}", exc_info=True)
    else:
        log_info(f"Статья уже есть в sitemap, пропускаю")


def git_add_commit_push(repo_path: str, files: list, commit_message: str):
    """
    Добавляет файлы в Git, коммитит и пушит.
    
    Args:
        repo_path: Путь к репозиторию
        files: Список файлов для добавления
        commit_message: Сообщение коммита
        
    Returns:
        True если успешно, False иначе
    """
    try:
        # Переходим в директорию репозитория
        original_cwd = os.getcwd()
        os.chdir(repo_path)
        
        # Git add
        # Файлы уже должны быть относительными путями от корня репозитория
        repo_path_obj = Path(repo_path)
        for file_path in files:
            # Если путь абсолютный, делаем относительным
            if os.path.isabs(file_path):
                try:
                    rel_path = os.path.relpath(file_path, repo_path_obj)
                except ValueError:
                    # Если файл вне репозитория, используем как есть
                    rel_path = file_path
            else:
                # Уже относительный путь
                rel_path = file_path
            
            result = subprocess.run(
                ["git", "add", rel_path],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode != 0:
                log_warning(f"git add {rel_path}: {result.stderr}")
            else:
                log_info(f"git add {rel_path}")
        
        # Git commit
        # Автоматически добавляем [ci skip] если его еще нет, чтобы пропустить автоматический запуск GitHub Pages
        if "[ci skip]" not in commit_message and "[skip ci]" not in commit_message:
            commit_message = f"{commit_message} [ci skip]"
        log_info(f"ШАГ 8.2: Создание коммита...")
        result = subprocess.run(
            ["git", "commit", "-m", commit_message],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode != 0:
            if "nothing to commit" in result.stdout or "nothing to commit" in result.stderr:
                log_warning("Нет изменений для коммита (возможно, файлы уже закоммичены)")
                log_info(f"   stdout: {result.stdout}")
                log_info(f"   stderr: {result.stderr}")
                os.chdir(original_cwd)
                return True  # Это не ошибка, просто нет изменений
            else:
                log_error(f"Ошибка git commit: {result.stderr}")
                log_error(f"   stdout: {result.stdout}")
                os.chdir(original_cwd)
                return False
        
        log_success(f"Коммит создан: {commit_message}")
        
        # Git pull перед push для синхронизации
        log_info(f"ШАГ 8.2.5: Синхронизация с удаленным репозиторием (pull)...")
        # Сохраняем текущее состояние и делаем stash для неотслеживаемых файлов
        stash_result = subprocess.run(
            ["git", "stash", "--include-untracked"],
            capture_output=True,
            text=True,
            timeout=10,
            env={**os.environ, "GIT_TERMINAL_PROMPT": "0"}
        )
        
        pull_result = subprocess.run(
            ["git", "pull", "--rebase", "origin", GITHUB_BRANCH],
            capture_output=True,
            text=True,
            timeout=30,
            env={**os.environ, "GIT_TERMINAL_PROMPT": "0"}
        )
        
        # Восстанавливаем stash (если был создан)
        if stash_result.returncode == 0:
            subprocess.run(
                ["git", "stash", "pop"],
                capture_output=True,
                text=True,
                timeout=10,
                env={**os.environ, "GIT_TERMINAL_PROMPT": "0"}
            )
        
        if pull_result.returncode != 0:
            if "fatal: couldn't find remote ref" in pull_result.stderr:
                log_warning("Ветка не найдена на удаленном репозитории (возможно, первая публикация)")
            elif "Already up to date" in pull_result.stdout or "Already up to date" in pull_result.stderr:
                log_info("   Репозиторий уже синхронизирован")
            elif "could not detach HEAD" in pull_result.stderr or "would be overwritten" in pull_result.stderr:
                log_warning("Конфликты при pull (пропускаю синхронизацию, продолжим с текущим состоянием)")
            else:
                log_warning(f"Предупреждение git pull: {pull_result.stderr[:200]}")
        else:
            log_info("   Репозиторий синхронизирован с удаленным")
        
        # Git push с аутентификацией через токен
        log_info(f"ШАГ 8.3: Отправка в GitHub (push)...")
        if GITHUB_TOKEN:
            log_info("   Используется GITHUB_TOKEN для аутентификации")
            # Используем токен в URL для аутентификации
            # Формат: https://TOKEN@github.com/owner/repo.git
            remote_url = subprocess.run(
                ["git", "config", "--get", "remote.origin.url"],
                capture_output=True,
                text=True,
                timeout=5
            ).stdout.strip()
            log_info(f"   Remote URL: {remote_url[:50]}...")
            
            # Извлекаем owner/repo из URL
            if "github.com" in remote_url:
                # Формат: https://github.com/owner/repo.git или git@github.com:owner/repo.git
                if remote_url.startswith("https://"):
                    # Уже HTTPS URL
                    if "@" not in remote_url:
                        # Добавляем токен в URL
                        remote_url_with_token = remote_url.replace(
                            "https://github.com/",
                            f"https://{GITHUB_TOKEN}@github.com/"
                        )
                    else:
                        # Токен уже есть, заменяем
                        import re
                        remote_url_with_token = re.sub(
                            r"https://[^@]+@github.com/",
                            f"https://{GITHUB_TOKEN}@github.com/",
                            remote_url
                        )
                elif remote_url.startswith("git@"):
                    # SSH URL, конвертируем в HTTPS с токеном
                    # git@github.com:owner/repo.git -> https://TOKEN@github.com/owner/repo.git
                    remote_url_with_token = remote_url.replace(
                        "git@github.com:",
                        f"https://{GITHUB_TOKEN}@github.com/"
                    ).replace(".git", ".git")
                else:
                    remote_url_with_token = remote_url
                
                # Временно меняем remote URL для push
                subprocess.run(
                    ["git", "remote", "set-url", "origin", remote_url_with_token],
                    capture_output=True,
                    timeout=5
                )
            
            # Push с токеном
            result = subprocess.run(
                ["git", "push", "origin", GITHUB_BRANCH],
                capture_output=True,
                text=True,
                timeout=30,
                env={**os.environ, "GIT_TERMINAL_PROMPT": "0"}  # Отключаем интерактивные запросы
            )
        else:
            # Push без токена (может потребовать интерактивной аутентификации)
            log_warning("GITHUB_TOKEN не установлен, push может потребовать аутентификации")
            result = subprocess.run(
                ["git", "push", "origin", GITHUB_BRANCH],
                capture_output=True,
                text=True,
                timeout=30
            )
        
        if result.returncode != 0:
            error_msg = f"Ошибка git push: {result.stderr}"
            log_error(error_msg)
            log_error(f"   stdout: {result.stdout}")
            if "Authentication failed" in result.stderr or "fatal: could not read Username" in result.stderr:
                log_error("Ошибка аутентификации. Установите GITHUB_TOKEN в .env")
                log_error("Создайте Personal Access Token: https://github.com/settings/tokens")
            elif "remote: Permission denied" in result.stderr or "403" in result.stderr:
                log_error("Ошибка доступа к репозиторию. Проверьте права токена GITHUB_TOKEN")
            elif "fatal: not a git repository" in result.stderr:
                log_error("Ошибка: директория не является git репозиторием")
            elif "fatal: could not read" in result.stderr:
                log_error("Ошибка чтения конфигурации git")
            os.chdir(original_cwd)
            return False
        
        log_success("Изменения отправлены в GitHub")
        os.chdir(original_cwd)
        return True
        
    except subprocess.TimeoutExpired:
        print(f"   ⚠️  Таймаут выполнения git команды")
        if 'original_cwd' in locals():
            os.chdir(original_cwd)
        return False
    except Exception as e:
        print(f"   ⚠️  Ошибка git операций: {e}")
        if 'original_cwd' in locals():
            os.chdir(original_cwd)
        return False


def copy_image_to_assets(image_path: Path, repo_path: Path, slug: str) -> Optional[str]:
    """
    Копирует изображение в assets/ или images/ репозитория и возвращает публичный URL.
    Проверяет существующую структуру сайта, чтобы не повредить её.
    
    Args:
        image_path: Путь к локальному изображению
        repo_path: Путь к репозиторию
        slug: Slug статьи (для имени файла)
        
    Returns:
        Публичный URL изображения или None при ошибке
    """
    if not image_path or not image_path.exists():
        return None
    
    try:
        # Проверяем, какая папка существует: assets/ или images/
        assets_dir = repo_path / "assets"
        images_dir = repo_path / "images"
        
        # Используем существующую папку или создаем assets/ если нет ни одной
        if images_dir.exists() and not assets_dir.exists():
            target_dir = images_dir
            url_prefix = "images"
            print(f"   ℹ️  Использую существующую папку images/")
        else:
            target_dir = assets_dir
            url_prefix = "assets"
            target_dir.mkdir(exist_ok=True)
        
        # Определяем расширение файла
        ext = image_path.suffix or ".jpg"
        image_filename = f"{slug}{ext}"
        dest_path = target_dir / image_filename
        
        # Проверяем, не существует ли уже файл с таким именем
        if dest_path.exists():
            # Добавляем timestamp для уникальности
            import time
            timestamp = int(time.time())
            image_filename = f"{slug}-{timestamp}{ext}"
            dest_path = target_dir / image_filename
            print(f"   ⚠️  Файл уже существует, использую имя: {image_filename}")
        
        # Копируем файл
        import shutil
        shutil.copy2(image_path, dest_path)
        
        # Возвращаем публичный URL
        image_url = f"{SITE_URL}/{url_prefix}/{image_filename}"
        print(f"   ✅ Изображение скопировано: {url_prefix}/{image_filename}")
        return image_url
        
    except Exception as e:
        print(f"   ⚠️  Ошибка копирования изображения: {e}")
        return None


def publish_to_web(news_data: Dict, web_version: str, image_path: Optional[Path] = None) -> Optional[str]:
    """
    Публикует новость на веб-сайт через GitHub Pages.
    
    ВАЖНО: GITHUB_REPO_PATH должен указывать на КОРЕНЬ репозитория (не на bot/).
    Посты сохраняются в posts/ в корне репозитория.
    
    Args:
        news_data: Словарь с данными новости
        web_version: HTML версия контента для веба
        image_path: Путь к локальному изображению (опционально)
        
    Returns:
        URL опубликованной статьи или None при ошибке
    """
    news_title = news_data.get("title", "Unknown")
    news_url = news_data.get("source_url", "")
    
    log_info(f"=" * 80)
    log_info(f"🌐 НАЧАЛО ПУБЛИКАЦИИ: {news_title[:60]}")
    log_info(f"   Источник: {news_url}")
    log_info(f"   Время: {datetime.now().isoformat()}")
    
    try:
        # Определяем путь к репозиторию для новостей
        # Приоритет: NEWS_REPO_PATH > GITHUB_REPO_PATH > автоматический поиск
        repo_path = None
    
        if NEWS_REPO_PATH:
            # Используем отдельный репозиторий для новостей (рекомендуется)
            repo_path = Path(NEWS_REPO_PATH).expanduser().resolve()
            log_info(f"📁 ШАГ 1: Определение репозитория - используется NEWS_REPO_PATH: {repo_path}")
        elif GITHUB_REPO_PATH and GITHUB_REPO_PATH != ".":
            # Fallback на GITHUB_REPO_PATH для обратной совместимости
            repo_path = Path(GITHUB_REPO_PATH).expanduser().resolve()
            log_info(f"📁 ШАГ 1: Определение репозитория - используется GITHUB_REPO_PATH: {repo_path}")
        else:
            # Автоматический поиск - НЕ рекомендуется для production
            log_warning("ШАГ 1: Автоматический поиск репозитория (не рекомендуется)")
            log_warning("   Рекомендуется установить NEWS_REPO_PATH в .env")
            current_path = Path(__file__).parent.resolve()  # Директория bot/
            
            # Поднимаемся вверх по дереву директорий, ищем .git
            search_path = current_path
            for _ in range(5):  # Максимум 5 уровней вверх
                git_dir = search_path / ".git"
                if git_dir.exists():
                    repo_path = search_path
                    log_info(f"   ✅ Автоматически найден: {repo_path}")
                    break
                if search_path.parent == search_path:  # Достигли корня файловой системы
                    break
                search_path = search_path.parent
        
        if not repo_path:
            error_msg = "ШАГ 1: Репозиторий для новостей не найден!"
            log_error(error_msg)
            log_error("   Установите в .env: NEWS_REPO_PATH=/absolute/path/to/news-repository")
            return None
        
        if not repo_path.exists():
            error_msg = f"ШАГ 1: Репозиторий не найден: {repo_path}"
            log_error(error_msg)
            return None
        
        # Проверяем, что это Git репозиторий (должен быть .git в корне)
        git_dir = repo_path / ".git"
        if not git_dir.exists():
            error_msg = f"ШАГ 1: Это не Git репозиторий: {repo_path}"
            log_error(error_msg)
            log_error("   Убедитесь, что NEWS_REPO_PATH указывает на КОРЕНЬ репозитория")
            return None
        
        # Проверяем, что мы не в папке bot/
        if repo_path.name == "bot":
            log_warning(f"ШАГ 1: ВНИМАНИЕ: Путь указывает на папку bot/")
            log_warning(f"   Текущий путь: {repo_path}")
            log_warning(f"   Исправляю на: {repo_path.parent}")
            repo_path = repo_path.parent
            log_info(f"   ✅ Используем корень репозитория: {repo_path}")
        
        log_info(f"📁 ШАГ 1: Репозиторий определен: {repo_path}")
        
        # Создаем slug для статьи (нужен для имени файла изображения)
        log_info(f"📝 ШАГ 2: Создание slug для статьи...")
        slug = create_slug(news_data.get("title", ""))
        log_info(f"   Slug: {slug}")
        
        # Обрабатываем изображение
        image_url = None
        image_file_path = None
        if image_path and image_path.exists():
            log_info(f"🖼️  ШАГ 3: Копирование изображения...")
            log_info(f"   Исходный путь: {image_path}")
            image_url = copy_image_to_assets(image_path, repo_path, slug)
        if image_url:
            # Определяем путь к изображению (может быть в assets/ или images/)
            assets_dir = repo_path / "assets"
            images_dir = repo_path / "images"
            
            # Определяем, в какую папку было скопировано изображение
            if images_dir.exists() and not assets_dir.exists():
                target_image_dir = images_dir
            else:
                target_image_dir = assets_dir
            
            # Извлекаем имя файла из URL
            import re
            match = re.search(r'/([^/]+\.(jpg|jpeg|png|gif|webp))', image_url)
            if match:
                image_filename = match.group(1)
                image_file_path = target_image_dir / image_filename
            else:
                # Fallback: используем slug
                image_filename = f"{slug}{image_path.suffix or '.jpg'}"
                image_file_path = target_image_dir / image_filename
    
            if image_url:
                log_success(f"ШАГ 3: Изображение скопировано: {image_url}")
                # Определяем путь к изображению (может быть в assets/ или images/)
                assets_dir = repo_path / "assets"
                images_dir = repo_path / "images"
                
                # Определяем, в какую папку было скопировано изображение
                if images_dir.exists() and not assets_dir.exists():
                    target_image_dir = images_dir
                else:
                    target_image_dir = assets_dir
                
                # Извлекаем имя файла из URL
                import re
                match = re.search(r'/([^/]+\.(jpg|jpeg|png|gif|webp))', image_url)
                if match:
                    image_filename = match.group(1)
                    image_file_path = target_image_dir / image_filename
                else:
                    # Fallback: используем slug
                    image_filename = f"{slug}{image_path.suffix or '.jpg'}"
                    image_file_path = target_image_dir / image_filename
            else:
                log_warning("ШАГ 3: Не удалось скопировать изображение")
        else:
            log_info("ШАГ 3: Изображение не предоставлено, пропускаю")
        
        # Создаем HTML статью
        log_info(f"📝 ШАГ 4: Создание HTML статьи...")
        html_content, article_url, slug = create_html_article(news_data, web_version, image_url)
        log_info(f"   URL статьи: {article_url}")
        
        # Сохраняем HTML файл в posts/ в КОРНЕ репозитория (не в bot/posts/)
        log_info(f"💾 ШАГ 5: Сохранение HTML файла...")
        posts_dir = repo_path / "posts"
        posts_dir.mkdir(exist_ok=True)
        
        # Проверяем, что posts_dir действительно в корне репозитория
        if "bot" in str(posts_dir):
            log_warning(f"ШАГ 5: ВНИМАНИЕ: posts_dir находится внутри bot/: {posts_dir}")
            log_warning(f"   Исправляю на корень репозитория...")
            # Убираем bot/ из пути если есть
            parts = list(posts_dir.parts)
            if "bot" in parts:
                parts = [p for p in parts if p != "bot"]
                posts_dir = Path(*parts)
            log_info(f"   ✅ Используем: {posts_dir}")
        
        html_file = posts_dir / f"{slug}.html"
        
        # Если файл уже существует, добавляем timestamp для уникальности
        if html_file.exists():
            import time
            timestamp = int(time.time())
            html_file = posts_dir / f"{slug}-{timestamp}.html"
            log_warning(f"ШАГ 5: Файл с таким именем уже существует, использую: {html_file.name}")
            # Обновляем article_url для правильного URL
            article_url = f"{SITE_URL}/posts/{html_file.stem}.html"
        
        try:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(html_content)
            log_success(f"ШАГ 5: HTML файл создан: {html_file.name}")
        except Exception as e:
            error_msg = f"ШАГ 5: Ошибка создания HTML файла: {e}"
            log_error(error_msg, exc_info=True)
            return None
        
        # Обновляем sitemap.xml
        log_info(f"🗺️  ШАГ 6: Обновление sitemap.xml...")
        try:
            update_sitemap(article_url, slug, str(repo_path))
            log_success("ШАГ 6: sitemap.xml обновлен")
        except Exception as e:
            log_error(f"ШАГ 6: Ошибка обновления sitemap.xml: {e}", exc_info=True)
        
        # Обновляем index.html автоматически
        log_info(f"📋 ШАГ 7: Обновление index.html...")
        try:
            update_index_script = repo_path / "update_index.py"
            if update_index_script.exists():
                # Запускаем скрипт из корня репозитория
                result = subprocess.run(
                    ["python3", str(update_index_script)],
                    cwd=str(repo_path),
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                if result.returncode == 0:
                    log_success("ШАГ 7: index.html обновлен автоматически")
                    if result.stdout:
                        # Выводим только важные сообщения из скрипта
                        for line in result.stdout.split('\n'):
                            if 'Found' in line or 'Successfully' in line or '✓' in line:
                                log_info(f"   {line}")
                else:
                    log_warning(f"ШАГ 7: Ошибка обновления index.html: {result.stderr}")
            else:
                log_warning("ШАГ 7: Скрипт update_index.py не найден, пропускаю обновление index.html")
        except Exception as e:
            log_warning(f"ШАГ 7: Ошибка при обновлении index.html: {e}")
            # Не прерываем процесс, продолжаем публикацию
        
        # Обновляем RSS feed
        log_info(f"📡 ШАГ 7.5: Генерация RSS feed...")
        try:
            generate_rss_script = repo_path / "generate_rss.py"
            if generate_rss_script.exists():
                # Запускаем скрипт из корня репозитория
                result = subprocess.run(
                    ["python3", str(generate_rss_script)],
                    cwd=str(repo_path),
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                if result.returncode == 0:
                    log_success("ШАГ 7.5: RSS feed обновлен")
                    if result.stdout:
                        # Выводим только важные сообщения из скрипта
                        for line in result.stdout.split('\n'):
                            if 'Found' in line or 'Successfully' in line or '✓' in line or 'RSS Feed URL' in line:
                                log_info(f"   {line}")
                else:
                    log_warning(f"ШАГ 7.5: Ошибка генерации RSS feed: {result.stderr}")
            else:
                log_warning("ШАГ 7.5: Скрипт generate_rss.py не найден, пропускаю генерацию RSS feed")
        except Exception as e:
            log_warning(f"ШАГ 7.5: Ошибка при генерации RSS feed: {e}")
            # Не прерываем процесс, продолжаем публикацию
        
        # Git операции
        log_info(f"📤 ШАГ 8: Отправка в GitHub...")
        commit_message = f"Add news: {news_data.get('title', '')[:50]}"
        log_info(f"   Сообщение коммита: {commit_message}")
        
        # Формируем пути файлов относительно корня репозитория
        files_to_add = []
        
        # HTML файл: должен быть posts/{slug}.html относительно корня
        html_file_rel = html_file.relative_to(repo_path)
        files_to_add.append(str(html_file_rel))
        log_info(f"   📄 Добавляю в git: {html_file_rel}")
        
        # Sitemap: должен быть sitemap.xml в корне
        sitemap_file = repo_path / "sitemap.xml"
        if sitemap_file.exists():
            files_to_add.append("sitemap.xml")
            log_info(f"   🗺️  Добавляю в git: sitemap.xml")
        
        # Изображение: если было скопировано
        if image_url and 'image_file_path' in locals() and image_file_path:
            try:
                image_file_rel = image_file_path.relative_to(repo_path)
                files_to_add.append(str(image_file_rel))
                log_info(f"   🖼️  Добавляю в git: {image_file_rel}")
            except ValueError:
                log_warning(f"ШАГ 8: Изображение вне репозитория, пропускаю: {image_file_path}")
        
        # index.html: если был обновлен скриптом update_index.py
        index_file = repo_path / "index.html"
        if index_file.exists():
            files_to_add.append("index.html")
            log_info(f"   📋 Добавляю в git: index.html")
        
        # feed.xml: если был обновлен скриптом generate_rss.py (в public/)
        feed_file = repo_path / "public" / "feed.xml"
        if feed_file.exists():
            files_to_add.append("public/feed.xml")
            log_info(f"   📡 Добавляю в git: public/feed.xml")
        
        log_info(f"ШАГ 8: Всего файлов для коммита: {len(files_to_add)}")
        success = git_add_commit_push(str(repo_path), files_to_add, commit_message)
        
        if success:
            log_success(f"ШАГ 8: Статья опубликована на GitHub Pages: {article_url}")
            log_info(f"=" * 80)
            log_info(f"✅ ПУБЛИКАЦИЯ ЗАВЕРШЕНА УСПЕШНО: {news_title[:60]}")
            log_info(f"   URL: {article_url}")
            log_info(f"=" * 80)
            return article_url
        else:
            log_error(f"ШАГ 8: КРИТИЧЕСКАЯ ОШИБКА - Статья создана локально, но НЕ отправлена в GitHub")
            log_error(f"   URL статьи (локальный): {article_url}")
            log_error(f"   Файл создан: {html_file}")
            log_error(f"   Проверьте логи ошибок для деталей")
            log_error(f"   Возможные причины:")
            log_error(f"   - GITHUB_TOKEN не установлен или неверный")
            log_error(f"   - Проблемы с git push (сеть, права доступа)")
            log_error(f"   - Репозиторий не синхронизирован с GitHub")
            return None  # Возвращаем None если push не удался - это критическая ошибка
            
    except Exception as e:
        error_msg = f"КРИТИЧЕСКАЯ ОШИБКА при публикации: {e}"
        log_error(error_msg, exc_info=True)
        log_error(f"   Заголовок новости: {news_title}")
        log_error(f"   Источник: {news_url}")
        return None


def submit_to_google_indexing(url: str) -> bool:
    """
    Отправляет URL в Google Indexing API для быстрой индексации.
    
    ВАЖНО: Путь к ключу ищется относительно текущей рабочей директории.
    Если скрипт запущен из bot/, ключ должен быть в bot/ или указан абсолютный путь.
    
    Args:
        url: URL статьи для индексации
        
    Returns:
        True если успешно, False иначе
    """
    # Определяем путь к ключу
    key_path = Path(GOOGLE_INDEXING_KEY_PATH)
    
    # Если путь относительный, проверяем несколько возможных мест
    if not key_path.is_absolute():
        # 1. Текущая директория (где запущен скрипт)
        current_dir = Path.cwd()
        possible_paths = [
            current_dir / key_path,  # Текущая директория
            current_dir.parent / key_path,  # Родительская директория (если запущено из bot/)
            Path(__file__).parent / key_path,  # Директория модуля
            Path(__file__).parent.parent / key_path,  # Родительская директория модуля
        ]
        
        # Ищем первый существующий путь
        for path in possible_paths:
            if path.exists():
                key_path = path
                print(f"   🔑 Найден ключ: {key_path}")
                break
        else:
            # Если не нашли, используем исходный путь
            key_path = current_dir / key_path
    
    if not key_path.exists():
        print(f"⚠️  Google Indexing ключ не найден: {key_path}")
        print(f"   Проверенные пути:")
        if not Path(GOOGLE_INDEXING_KEY_PATH).is_absolute():
            print(f"   - {Path.cwd() / GOOGLE_INDEXING_KEY_PATH}")
            print(f"   - {Path.cwd().parent / GOOGLE_INDEXING_KEY_PATH}")
            print(f"   - {Path(__file__).parent / GOOGLE_INDEXING_KEY_PATH}")
        print(f"   Пропускаем отправку в Google Indexing")
        return False
    
    try:
        from google.oauth2 import service_account
        from google.auth.transport.requests import Request
        
        # Загружаем credentials
        credentials = service_account.Credentials.from_service_account_file(
            GOOGLE_INDEXING_KEY_PATH,
            scopes=['https://www.googleapis.com/auth/indexing']
        )
        
        if not credentials.valid:
            credentials.refresh(Request())
        
        # Google Indexing API endpoint
        indexing_url = "https://indexing.googleapis.com/v3/urlNotifications:publish"
        
        headers = {
            "Authorization": f"Bearer {credentials.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "url": url,
            "type": "URL_UPDATED"
        }
        
        response = requests.post(indexing_url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        
        print(f"✅ URL отправлен в Google Indexing: {url}")
        return True
        
    except ImportError:
        print("❌ google-auth не установлен. Установите: pip install google-auth")
        return False
    except Exception as e:
        print(f"⚠️  Ошибка отправки в Google Indexing: {e}")
        return False
