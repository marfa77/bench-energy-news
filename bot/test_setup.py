#!/usr/bin/env python3
"""
Quick test script to verify bot setup after migration.
"""
import sys
from pathlib import Path

# Add bot directory to path
sys.path.insert(0, str(Path(__file__).parent))

print("=" * 80)
print("  TESTING BOT SETUP AFTER MIGRATION")
print("=" * 80)
print()

# Test 1: Environment variables
print("1. Testing environment variables...")
from dotenv import load_dotenv
import os

load_dotenv()
news_repo = os.getenv("NEWS_REPO_PATH")
site_url = os.getenv("SITE_URL")

if news_repo:
    print(f"   ✅ NEWS_REPO_PATH: {news_repo}")
else:
    print("   ❌ NEWS_REPO_PATH not set")

if site_url:
    print(f"   ✅ SITE_URL: {site_url}")
else:
    print("   ❌ SITE_URL not set")

print()

# Test 2: Repository structure
print("2. Testing repository structure...")
if news_repo:
    repo_path = Path(news_repo)
    if repo_path.exists():
        print(f"   ✅ Repository exists: {repo_path}")
        if (repo_path / "posts").exists():
            print("   ✅ posts/ directory exists")
        if (repo_path / "index.html").exists():
            print("   ✅ index.html exists")
        if (repo_path / "update_index.py").exists():
            print("   ✅ update_index.py exists")
    else:
        print(f"   ❌ Repository not found: {repo_path}")

print()

# Test 3: Module imports
print("3. Testing module imports...")
modules = [
    ("news_search", "search_coal_news"),
    ("post_generator", "create_coal_analysis"),
    ("web_publisher", "publish_to_web"),
    ("published_news_db", "init_database"),
    ("image_extractor", "extract_image_from_url"),
    ("linkedin_publisher", "publish_to_linkedin"),
    ("monthly_forecast", "generate_monthly_forecast"),
]

all_ok = True
for module_name, function_name in modules:
    try:
        module = __import__(module_name)
        if hasattr(module, function_name):
            print(f"   ✅ {module_name}.{function_name}")
        else:
            print(f"   ⚠️  {module_name} imported but {function_name} not found")
            all_ok = False
    except Exception as e:
        print(f"   ❌ {module_name}: {e}")
        all_ok = False

print()

# Test 4: Database initialization
print("4. Testing database initialization...")
try:
    from published_news_db import init_database
    init_database()
    print("   ✅ Database initialized")
except Exception as e:
    print(f"   ❌ Database initialization error: {e}")
    all_ok = False

print()

# Summary
print("=" * 80)
if all_ok:
    print("  ✅ ALL TESTS PASSED - Bot is ready to use!")
else:
    print("  ⚠️  SOME TESTS FAILED - Check errors above")
print("=" * 80)
