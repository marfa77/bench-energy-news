#!/usr/bin/env python3
"""
Script to generate RSS feed from articles in posts/ directory.
Creates feed.xml compatible with RSS 2.0 standard for LinkedIn and other aggregators.
"""

import os
import re
from datetime import datetime
from pathlib import Path
from html import escape, unescape
from email.utils import formatdate

SITE_URL = "https://www.bench.energy"

def extract_article_metadata(html_file_path):
    """Extract title, description, published date, and URL from HTML article file."""
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
        if desc_match:
            description = unescape(desc_match.group(1).strip())
        else:
            # Fallback: extract first paragraph from article body
            body_match = re.search(r'<article[^>]*>(.*?)</article>', content, re.DOTALL)
            if body_match:
                p_match = re.search(r'<p[^>]*>(.*?)</p>', body_match.group(1), re.DOTALL)
                if p_match:
                    description = re.sub(r'<[^>]+>', '', unescape(p_match.group(1).strip()))
                    description = description[:300] + "..." if len(description) > 300 else description
                else:
                    description = title  # Fallback to title
            else:
                description = title  # Fallback to title
        
        # Extract Bench Energy Expert View section and append to description
        expert_view_match = re.search(
            r'<h3[^>]*>Bench Energy Expert View</h3>(.*?)(?:<hr\s*/?>|<h2|</div>|</article>)',
            content,
            re.DOTALL | re.IGNORECASE
        )
        if expert_view_match:
            expert_content = expert_view_match.group(1)
            # Remove HTML tags and clean up
            expert_text = re.sub(r'<[^>]+>', ' ', expert_content)
            expert_text = re.sub(r'\s+', ' ', expert_text)  # Normalize whitespace
            expert_text = unescape(expert_text.strip())
            
            # Truncate expert view if too long (max 500 chars for RSS)
            if len(expert_text) > 500:
                expert_text = expert_text[:497] + "..."
            
            # Append expert view to description
            if expert_text:
                description = f"{description} 🧭 Bench Energy Expert View: {expert_text}"
                # Ensure total description doesn't exceed RSS limits (typically 1000-2000 chars)
                if len(description) > 1500:
                    description = description[:1497] + "..."
        
        # Extract published date
        date_match = re.search(r'<meta property="article:published_time" content="([^"]+)"', content)
        if date_match:
            date_str = date_match.group(1)
            try:
                # Parse ISO format date
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                published_date = dt
            except:
                published_date = datetime.now()  # Fallback
        else:
            # Try to get from file modification time
            mtime = os.path.getmtime(html_file_path)
            published_date = datetime.fromtimestamp(mtime)
        
        # Generate article URL
        filename = Path(html_file_path).name
        article_url = f"{SITE_URL}/posts/{filename}"
        
        return {
            'title': title,
            'description': description,
            'date': published_date,
            'url': article_url,
            'filename': filename
        }
    except Exception as e:
        print(f"Error reading {html_file_path}: {e}")
        return None

def get_all_articles(posts_dir, limit=30):
    """Scan posts directory and extract metadata from HTML files."""
    articles = []
    posts_path = Path(posts_dir)
    
    if not posts_path.exists():
        print(f"Posts directory {posts_dir} does not exist!")
        return articles
    
    for html_file in sorted(posts_path.glob('*.html'), key=lambda p: p.stat().st_mtime, reverse=True):
        metadata = extract_article_metadata(html_file)
        if metadata:
            articles.append(metadata)
            if len(articles) >= limit:
                break
    
    # Sort by date (newest first)
    articles.sort(key=lambda x: x['date'], reverse=True)
    return articles

def generate_rss_feed(articles, output_path):
    """Generate RSS 2.0 feed XML."""
    feed_url = f"{SITE_URL}/feed.xml"
    last_build_date = datetime.now()
    
    # Generate RSS XML
    rss_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
    <channel>
        <title>Bench Energy News - Coal Market Updates</title>
        <link>{SITE_URL}</link>
        <description>Latest news and analysis about coal market from Bench Energy. Follow our Telegram channel @benchenergy for real-time market insights.</description>
        <language>en-US</language>
        <lastBuildDate>{formatdate(last_build_date.timestamp())}</lastBuildDate>
        <pubDate>{formatdate(last_build_date.timestamp())}</pubDate>
        <ttl>60</ttl>
        <atom:link href="{feed_url}" rel="self" type="application/rss+xml"/>
        <image>
            <url>{SITE_URL}/assets/bench-energy-logo.png</url>
            <title>Bench Energy News</title>
            <link>{SITE_URL}</link>
        </image>
"""
    
    # Add items for each article
    for article in articles:
        pub_date_rfc = formatdate(article['date'].timestamp())
        title_escaped = escape(article['title'])
        desc_escaped = escape(article['description'])
        url_escaped = escape(article['url'])
        
        rss_xml += f"""        <item>
            <title>{title_escaped}</title>
            <link>{url_escaped}</link>
            <guid isPermaLink="true">{url_escaped}</guid>
            <description>{desc_escaped}</description>
            <pubDate>{pub_date_rfc}</pubDate>
        </item>
"""
    
    rss_xml += """    </channel>
</rss>
"""
    
    # Write to file
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(rss_xml)
        return True
    except Exception as e:
        print(f"Error writing RSS feed: {e}")
        return False

def main():
    """Main function."""
    script_dir = Path(__file__).parent
    posts_dir = script_dir / 'posts'
    rss_path = script_dir / 'feed.xml'
    
    print("Scanning posts directory...")
    articles = get_all_articles(posts_dir, limit=30)
    
    if not articles:
        print("No articles found in posts/ directory!")
        return
    
    print(f"Found {len(articles)} article(s) for RSS feed")
    
    print("Generating RSS feed...")
    if generate_rss_feed(articles, rss_path):
        print(f"✓ Successfully generated RSS feed: {rss_path}")
        print(f"  RSS Feed URL: {SITE_URL}/feed.xml")
    else:
        print("✗ Failed to generate RSS feed")

if __name__ == '__main__':
    main()
