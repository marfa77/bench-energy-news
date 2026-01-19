#!/usr/bin/env python3
"""
Script to automatically update index.html with articles from posts/ directory.
Scans posts/ folder, extracts article metadata, and updates the articles list in index.html.
Generates Telegram-style cards with previews.
"""

import os
import re
from datetime import datetime
from pathlib import Path
from html import unescape

def extract_article_metadata(html_file_path):
    """Extract title, description, image, source, and published date from HTML article file."""
    try:
        with open(html_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract title (remove " | Bench Energy" suffix if present)
        title_match = re.search(r'<title>(.*?)</title>', content, re.DOTALL)
        if title_match:
            title = unescape(title_match.group(1).strip())
            # Remove " | Bench Energy" suffix
            title = re.sub(r'\s*\|\s*Bench Energy\s*$', '', title, flags=re.IGNORECASE)
        else:
            title = Path(html_file_path).stem.replace('-', ' ').title()
        
        # Extract description
        desc_match = re.search(r'<meta name="description" content="([^"]+)"', content)
        description = desc_match.group(1) if desc_match else title[:200] + "..."
        description = unescape(description)
        
        # Extract image
        og_image_match = re.search(r'<meta property="og:image" content="([^"]+)"', content)
        image_url = og_image_match.group(1) if og_image_match else "https://marfa77.github.io/bench-energy-news/assets/default-news.jpg"
        
        # Extract source URL
        source_match = re.search(r'<meta property="og:url" content="([^"]+)"', content)
        source_url = source_match.group(1) if source_match else f"https://marfa77.github.io/bench-energy-news/posts/{Path(html_file_path).name}"
        
        # Extract source name from title (usually after " - " or " | ")
        source_name = "Bench Energy"
        if " - " in title:
            parts = title.split(" - ")
            if len(parts) > 1:
                source_name = parts[-1].strip()
        elif " | " in title:
            parts = title.split(" | ")
            if len(parts) > 1:
                source_name = parts[-1].strip()
        
        # Extract category/keywords for hashtags
        keywords_match = re.search(r'<meta name="keywords" content="([^"]+)"', content)
        keywords = keywords_match.group(1) if keywords_match else "Coal"
        hashtags = [f"#{tag.strip()}" for tag in keywords.split(',')[:5] if tag.strip() and tag.strip() not in ['Bench Energy', '@benchenergy', 'Telegram channel']]
        
        # Extract published date
        date_match = re.search(r'<meta property="article:published_time" content="([^"]+)"', content)
        if date_match:
            date_str = date_match.group(1)
            try:
                # Parse ISO format date
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                published_date = dt
                formatted_date = dt.strftime('%B %d, %Y')
            except:
                formatted_date = date_str.split('T')[0] if 'T' in date_str else date_str
                published_date = datetime.now()  # Fallback
        else:
            # Try to get from file modification time
            mtime = os.path.getmtime(html_file_path)
            published_date = datetime.fromtimestamp(mtime)
            formatted_date = published_date.strftime('%B %d, %Y')
        
        return {
            'title': title,
            'description': description,
            'image_url': image_url,
            'source_url': source_url,
            'source_name': source_name,
            'hashtags': hashtags,
            'date': published_date,
            'formatted_date': formatted_date,
            'filename': Path(html_file_path).name
        }
    except Exception as e:
        print(f"Error reading {html_file_path}: {e}")
        return None

def get_all_articles(posts_dir):
    """Scan posts directory and extract metadata from all HTML files."""
    articles = []
    posts_path = Path(posts_dir)
    
    if not posts_path.exists():
        print(f"Posts directory {posts_dir} does not exist!")
        return articles
    
    for html_file in posts_path.glob('*.html'):
        metadata = extract_article_metadata(html_file)
        if metadata:
            articles.append(metadata)
    
    # Sort by date (newest first)
    articles.sort(key=lambda x: x['date'], reverse=True)
    return articles

def generate_articles_html(articles):
    """Generate HTML for articles list with Telegram-style cards."""
    if not articles:
        return ['        <h2>Latest Articles</h2>',
                '        <p>Articles will appear here automatically as they are published.</p>',
                '        <p>Check back soon for the latest coal market news!</p>']
    
    html_lines = ['        <h2>Latest Articles</h2>']
    for article in articles:
        hashtags_html = ' '.join(article.get('hashtags', []))
        source_name = article.get('source_name', 'Bench Energy')
        description = article.get('description', article['title'])[:200]
        if len(description) > 200:
            description = description[:197] + "..."
        
        html_lines.append(f'        <div class="news-card">')
        html_lines.append(f'            <div class="news-header">')
        html_lines.append(f'                <h3 class="news-title"><a href="posts/{article["filename"]}">{article["title"]}</a></h3>')
        html_lines.append(f'                <p class="news-description">{description}</p>')
        if hashtags_html:
            html_lines.append(f'                <div class="news-hashtags">{hashtags_html}</div>')
        html_lines.append(f'                <div class="news-source">Source: <a href="{article.get("source_url", "#")}" target="_blank" rel="noopener">{source_name}</a></div>')
        html_lines.append(f'            </div>')
        html_lines.append(f'            <div class="news-preview-card">')
        html_lines.append(f'                <div class="preview-source">{source_name}</div>')
        html_lines.append(f'                <div class="preview-image">')
        html_lines.append(f'                    <img src="{article.get("image_url", "assets/default-news.jpg")}" alt="{article["title"]}" loading="lazy">')
        html_lines.append(f'                </div>')
        html_lines.append(f'                <a href="posts/{article["filename"]}" class="preview-link">📖 Read Article</a>')
        html_lines.append(f'            </div>')
        html_lines.append(f'            <div class="news-meta">Published: {article["formatted_date"]}</div>')
        html_lines.append(f'        </div>')
    return html_lines

def update_index_html(index_path, articles_html):
    """Update index.html with new articles list."""
    try:
        with open(index_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Find the articles-list section
        start_idx = None
        end_idx = None
        
        for i, line in enumerate(lines):
            if 'class="articles-list"' in line:
                start_idx = i
                break
        
        if start_idx is None:
            print("Warning: Could not find articles-list section!")
            return False
        
        # Find the matching closing </div> tag
        div_count = 0
        for i in range(start_idx, len(lines)):
            div_count += lines[i].count('<div')
            div_count -= lines[i].count('</div>')
            if div_count == 0 and i > start_idx:
                end_idx = i
                break
        
        if end_idx is None:
            print("Warning: Could not find closing tag for articles-list section!")
            return False
        
        # Rebuild content: keep everything before, replace articles section, keep everything after
        new_lines = lines[:start_idx + 1]  # Include the opening <div class="articles-list">
        # Add articles HTML with proper newlines
        for line in articles_html:
            new_lines.append(line + '\n')
        new_lines.append('    </div>\n')  # Add closing tag
        new_lines.extend(lines[end_idx + 1:])  # Add everything after
        
        with open(index_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        
        return True
    except Exception as e:
        print(f"Error updating index.html: {e}")
        return False

def main():
    """Main function."""
    script_dir = Path(__file__).parent
    posts_dir = script_dir / 'posts'
    index_path = script_dir / 'index.html'
    
    print("Scanning posts directory...")
    articles = get_all_articles(posts_dir)
    
    if not articles:
        print("No articles found in posts/ directory!")
        return
    
    print(f"Found {len(articles)} article(s):")
    for article in articles:
        print(f"  - {article['title']} ({article['formatted_date']})")
    
    print("\nGenerating articles HTML...")
    articles_html = generate_articles_html(articles)
    
    print("Updating index.html...")
    if update_index_html(index_path, articles_html):
        print("✓ Successfully updated index.html!")
    else:
        print("✗ Failed to update index.html")

if __name__ == '__main__':
    main()
