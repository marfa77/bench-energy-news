#!/usr/bin/env python3
"""
Monthly coal market forecast generation based on collected articles.
Runs on the 28th of each month.
"""
import os
import re
import subprocess
from datetime import datetime
from pathlib import Path
from typing import List, Dict
from dotenv import load_dotenv
import asyncio
from telegram import Bot
from anthropic import Anthropic

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
TG_BOT_TOKEN = os.getenv("TG_BOT_TOKEN")
TG_TARGET_CHANNEL = os.getenv("TG_TARGET_CHANNEL", "@benchenergy")
NEWS_REPO_PATH = os.getenv("NEWS_REPO_PATH", "/Users/pavelveselov/Projects/bench-energy-news")
SITE_URL = os.getenv("SITE_URL", "https://marfa77.github.io/bench-energy-news")


def extract_articles_from_month(year: int, month: int) -> List[Dict]:
    """
    Extracts all articles for the specified month from posts/ directory.
    
    Args:
        year: Year
        month: Month (1-12)
        
    Returns:
        List of dictionaries with article data
    """
    posts_dir = Path(NEWS_REPO_PATH) / "posts"
    articles = []
    
    # Determine date range for the month
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)
    
    for html_file in posts_dir.glob("*.html"):
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Extract publication date
            date_match = re.search(r'<meta property="article:published_time" content="([^"]+)"', content)
            if not date_match:
                continue
            
            published_date = datetime.fromisoformat(date_match.group(1).replace('Z', '+00:00'))
            
            # Check if article is in the target month
            if start_date <= published_date < end_date:
                # Extract title
                title_match = re.search(r'<title>(.*?)</title>', content, re.DOTALL)
                title = title_match.group(1).replace(' | Bench Energy', '').strip() if title_match else html_file.stem
                
                # Extract description
                desc_match = re.search(r'<meta name="description" content="([^"]+)"', content)
                description = desc_match.group(1) if desc_match else ""
                
                # Extract category
                section_match = re.search(r'<meta property="article:section" content="([^"]+)"', content)
                category = section_match.group(1) if section_match else "Coal"
                
                articles.append({
                    'title': title,
                    'description': description,
                    'date': published_date,
                    'category': category,
                    'url': f"{SITE_URL}/posts/{html_file.name}"
                })
        except Exception as e:
            print(f"⚠️  Error processing {html_file.name}: {e}")
            continue
    
    # Sort by date
    articles.sort(key=lambda x: x['date'], reverse=True)
    return articles


def generate_forecast_prompt(articles: List[Dict], current_year: int, current_month: int) -> str:
    """
    Creates prompt for Claude to generate forecast.
    
    Args:
        articles: List of articles for the month
        current_year: Current year
        current_month: Current month
        
    Returns:
        Prompt for Claude
    """
    month_names = {
        1: "January", 2: "February", 3: "March", 4: "April",
        5: "May", 6: "June", 7: "July", 8: "August",
        9: "September", 10: "October", 11: "November", 12: "December"
    }
    
    month_name = month_names.get(current_month, "")
    
    # Build list of articles for analysis
    articles_summary = "\n".join([
        f"- {art['title']} ({art['date'].strftime('%Y-%m-%d')}): {art['description'][:200]}..."
        for art in articles[:20]  # Take last 20 articles
    ])
    
    prompt = f"""You are a professional coal market analyst at Bench Energy, a leading energy market intelligence company specializing in coal markets, freight, and energy sector analysis.

Based on the following news articles collected in {month_name} {current_year}, provide a comprehensive market forecast for the coal sector for the remainder of {current_year}.

**Articles analyzed ({len(articles)} total):**
{articles_summary}

**Your task:**
Write a professional market forecast report as if you are a senior coal market analyst at Bench Energy. The report should:

1. **Executive Summary** - Brief overview of key market trends observed in {month_name}
2. **Market Analysis** - Analysis of major developments based on the articles:
   - Price trends (thermal coal, coking coal)
   - Supply and demand dynamics
   - Regional market developments (China, India, Australia, Indonesia, etc.)
   - Freight and shipping trends
   - Policy and regulatory impacts
3. **Forecast for {current_year}** - Your professional outlook:
   - Price projections
   - Supply/demand balance
   - Key risks and opportunities
   - Regional outlooks
4. **Bench Energy View** - Your expert assessment and recommendations

**Writing style:**
- Professional, analytical, data-driven
- Use specific numbers and references when available
- Write in first person as Bench Energy analyst
- Be concise but comprehensive
- Use industry terminology appropriately
- Format with clear sections and bullet points where appropriate

**Output format:**
Provide the forecast in HTML format suitable for web publication, with proper headings (h2, h3), paragraphs, and lists. 

**IMPORTANT for Telegram compatibility:**
- Keep the total length under 4000 characters (including all formatting)
- Use concise, clear language
- Structure with clear sections but avoid overly long paragraphs
- Use bullet points for key points
- The content will be published both on website (full version) and Telegram (may be truncated if too long)

Start the report with: "Bench Energy Market Forecast - {month_name} {current_year}"

Write the forecast now:"""

    return prompt


def generate_forecast_with_claude(articles: List[Dict], current_year: int, current_month: int) -> str:
    """
    Generates forecast using Claude API.
    
    Args:
        articles: List of articles for the month
        current_year: Current year
        current_month: Current month
        
    Returns:
        HTML content of the forecast
    """
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY не установлен в .env")
    
    client = Anthropic(api_key=ANTHROPIC_API_KEY)
    
    prompt = generate_forecast_prompt(articles, current_year, current_month)
    
    print(f"🤖 Generating forecast with Claude based on {len(articles)} articles...")
    
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=4000,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )
    
    forecast_text = message.content[0].text
    
    # If response is not HTML, wrap in basic HTML structure
    if not forecast_text.strip().startswith('<'):
        forecast_text = f"<div class='forecast-content'>{forecast_text}</div>"
    
    return forecast_text


def create_forecast_html(forecast_content: str, current_year: int, current_month: int) -> str:
    """
    Creates full HTML document for forecast.
    
    Args:
        forecast_content: HTML content of forecast
        current_year: Current year
        current_month: Current month
        
    Returns:
        Full HTML document
    """
    month_names = {
        1: "January", 2: "February", 3: "March", 4: "April",
        5: "May", 6: "June", 7: "July", 8: "August",
        9: "September", 10: "October", 11: "November", 12: "December"
    }
    
    month_name = month_names.get(current_month, "")
    title = f"Bench Energy Market Forecast - {month_name} {current_year}"
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Bench Energy</title>
    <meta name="description" content="Professional coal market forecast for {current_year} by Bench Energy analysts. Analysis of market trends, price projections, and regional outlooks.">
    <meta name="keywords" content="coal market forecast, coal prices, thermal coal, coking coal, energy market analysis, Bench Energy">
    <link rel="canonical" href="{SITE_URL}/forecasts/{current_year}-{current_month:02d}-forecast.html">
    
    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="{SITE_URL}/forecasts/{current_year}-{current_month:02d}-forecast.html">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="Professional coal market forecast for {current_year} by Bench Energy analysts.">
    <meta property="og:site_name" content="Bench Energy">
    <meta property="article:published_time" content="{datetime.now().isoformat()}">
    <meta property="article:section" content="Forecast">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="Professional coal market forecast for {current_year} by Bench Energy analysts.">
    
    <!-- Schema.org -->
    <script type="application/ld+json">
    {{
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "{title}",
        "description": "Professional coal market forecast for {current_year} by Bench Energy analysts",
        "datePublished": "{datetime.now().isoformat()}",
        "author": {{
            "@type": "Organization",
            "name": "Bench Energy",
            "url": "https://t.me/benchenergy"
        }},
        "publisher": {{
            "@type": "Organization",
            "name": "Bench Energy",
            "logo": {{
                "@type": "ImageObject",
                "url": "{SITE_URL}/assets/bench-energy-logo.png"
            }}
        }},
        "articleSection": "Forecast"
    }}
    </script>
    
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
            background: #f5f5f5;
        }}
        .container {{
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        h1 {{
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }}
        h2 {{
            color: #34495e;
            margin-top: 30px;
        }}
        h3 {{
            color: #555;
        }}
        .forecast-content {{
            margin-top: 20px;
        }}
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #777;
            font-size: 0.9em;
        }}
        .footer a {{
            color: #3498db;
            text-decoration: none;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>{title}</h1>
        <div class="forecast-content">
            {forecast_content}
        </div>
        <div class="footer">
            <p>© {current_year} Bench Energy. All rights reserved.</p>
            <p><a href="{SITE_URL}">Back to News</a> | <a href="https://t.me/benchenergy" target="_blank">Telegram Channel</a></p>
        </div>
    </div>
</body>
</html>"""
    
    return html


async def publish_forecast_to_telegram(forecast_text: str, current_year: int, current_month: int) -> bool:
    """
    Publishes forecast to Telegram channel.
    Ensures content fits within Telegram's 4096 character limit.
    
    Args:
        forecast_text: Forecast text (can be HTML)
        current_year: Current year
        current_month: Current month
        
    Returns:
        True if successful
    """
    if not TG_BOT_TOKEN:
        print("⚠️  TG_BOT_TOKEN not set, skipping Telegram publication")
        return False
    
    month_names = {
        1: "January", 2: "February", 3: "March", 4: "April",
        5: "May", 6: "June", 7: "July", 8: "August",
        9: "September", 10: "October", 11: "November", 12: "December"
    }
    
    month_name = month_names.get(current_month, "")
    title = f"📊 Bench Energy Market Forecast - {month_name} {current_year}"
    
    # Convert HTML to Telegram format
    import html
    telegram_text = forecast_text
    
    # Replace headers with bold text
    telegram_text = re.sub(r'<h2[^>]*>(.*?)</h2>', r'<b>\1</b>\n', telegram_text, flags=re.DOTALL)
    telegram_text = re.sub(r'<h3[^>]*>(.*?)</h3>', r'<b>\1</b>\n', telegram_text, flags=re.DOTALL)
    # Replace bold/strong tags
    telegram_text = re.sub(r'<b[^>]*>(.*?)</b>', r'<b>\1</b>', telegram_text, flags=re.DOTALL)
    telegram_text = re.sub(r'<strong[^>]*>(.*?)</strong>', r'<b>\1</b>', telegram_text, flags=re.DOTALL)
    # Replace list items
    telegram_text = re.sub(r'<li[^>]*>(.*?)</li>', r'• \1\n', telegram_text, flags=re.DOTALL)
    telegram_text = re.sub(r'<ul[^>]*>|</ul>|<ol[^>]*>|</ol>', '', telegram_text)
    # Remove all other HTML tags
    telegram_text = re.sub(r'<[^>]+>', '', telegram_text)
    telegram_text = html.unescape(telegram_text)
    
    # Clean up extra whitespace
    telegram_text = re.sub(r'\n{3,}', '\n\n', telegram_text)
    telegram_text = telegram_text.strip()
    
    # Calculate available space (4096 - title - separators - footer)
    title_length = len(title) + 2  # +2 for \n\n
    footer = f"\n\n📖 Full forecast: {SITE_URL}/forecasts/{current_year}-{current_month:02d}-forecast.html"
    footer_length = len(footer)
    max_content_length = 4096 - title_length - footer_length - 50  # 50 chars safety margin
    
    # Smart truncation: cut at sentence boundary if possible
    if len(telegram_text) > max_content_length:
        truncated = telegram_text[:max_content_length]
        # Try to cut at last sentence end
        last_period = truncated.rfind('.')
        last_newline = truncated.rfind('\n\n')
        cut_point = max(last_period, last_newline)
        
        if cut_point > max_content_length * 0.8:  # If we found a good cut point
            telegram_text = truncated[:cut_point + 1]
        else:
            telegram_text = truncated.rstrip() + "..."
        
        telegram_text += footer
    else:
        telegram_text += footer
    
    message = f"{title}\n\n{telegram_text}"
    
    # Final check: ensure message fits
    if len(message) > 4096:
        # Emergency truncation
        max_text = 4096 - len(title) - len(footer) - 10
        telegram_text = telegram_text[:max_text] + "..." + footer
        message = f"{title}\n\n{telegram_text}"
    
    try:
        bot = Bot(token=TG_BOT_TOKEN)
        await bot.send_message(
            chat_id=TG_TARGET_CHANNEL,
            text=message,
            parse_mode='HTML'
        )
        print(f"✅ Forecast published to Telegram channel {TG_TARGET_CHANNEL}")
        print(f"   Message length: {len(message)} characters")
        return True
    except Exception as e:
        print(f"❌ Error publishing to Telegram: {e}")
        return False


def publish_forecast_to_web(forecast_html: str, current_year: int, current_month: int) -> str:
    """
    Publishes forecast to website.
    
    Args:
        forecast_html: HTML content of forecast
        current_year: Current year
        current_month: Current month
        
    Returns:
        URL of published forecast
    """
    # Create forecasts directory
    forecasts_dir = Path(NEWS_REPO_PATH) / "forecasts"
    forecasts_dir.mkdir(exist_ok=True)
    
    # Save HTML file
    filename = f"{current_year}-{current_month:02d}-forecast.html"
    filepath = forecasts_dir / filename
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(forecast_html)
    
    print(f"✅ Forecast saved: {filepath}")
    
    # Publish via git (commit and push)
    repo_path = Path(NEWS_REPO_PATH)
    
    import subprocess
    original_cwd = os.getcwd()
    os.chdir(repo_path)
    
    try:
        # Git add
        subprocess.run(["git", "add", str(filepath.relative_to(repo_path))], check=True)
        
        # Git commit
        commit_message = f"Add monthly forecast: {current_year}-{current_month:02d}"
        subprocess.run(["git", "commit", "-m", commit_message], check=True)
        
        # Git push
        GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
        if GITHUB_TOKEN:
            # Use token for push
            remote_url = subprocess.run(
                ["git", "config", "--get", "remote.origin.url"],
                capture_output=True, text=True
            ).stdout.strip()
            
            if "github.com" in remote_url:
                # Extract owner/repo
                match = re.search(r'github\.com[:/]([^/]+)/([^/]+?)(?:\.git)?$', remote_url)
                if match:
                    owner, repo = match.groups()
                    auth_url = f"https://{GITHUB_TOKEN}@github.com/{owner}/{repo}.git"
                    subprocess.run(
                        ["git", "remote", "set-url", "origin", auth_url],
                        check=True
                    )
            
            subprocess.run(["git", "push", "origin", "main"], check=True)
        else:
            subprocess.run(["git", "push", "origin", "main"], check=True)
        
        print(f"✅ Forecast published to website")
        
    except Exception as e:
        print(f"⚠️  Error publishing to website: {e}")
    finally:
        os.chdir(original_cwd)
    
    return f"{SITE_URL}/forecasts/{filename}"


async def generate_monthly_forecast():
    """
    Main function for generating and publishing monthly forecast.
    """
    now = datetime.now()
    current_year = now.year
    current_month = now.month
    
    print("=" * 80)
    print(f"📊 MONTHLY FORECAST GENERATION - {current_year}-{current_month:02d}")
    print("=" * 80)
    print()
    
    # Extract articles for current month
    print(f"📰 Extracting articles for {current_month}/{current_year}...")
    articles = extract_articles_from_month(current_year, current_month)
    
    if not articles:
        print(f"⚠️  No articles found for {current_month}/{current_year}")
        print("   Skipping forecast generation")
        return
    
    print(f"✅ Found {len(articles)} articles")
    print()
    
    # Generate forecast with Claude
    try:
        forecast_content = generate_forecast_with_claude(articles, current_year, current_month)
        print("✅ Forecast generated")
        print()
    except Exception as e:
        print(f"❌ Error generating forecast: {e}")
        return
    
    # Create HTML
    forecast_html = create_forecast_html(forecast_content, current_year, current_month)
    
    # Publish to Telegram
    print("📱 Publishing to Telegram...")
    await publish_forecast_to_telegram(forecast_content, current_year, current_month)
    print()
    
    # Publish to website
    print("🌐 Publishing to website...")
    web_url = publish_forecast_to_web(forecast_html, current_year, current_month)
    print(f"✅ URL: {web_url}")
    print()
    
    print("=" * 80)
    print("✅ FORECAST SUCCESSFULLY PUBLISHED")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(generate_monthly_forecast())
