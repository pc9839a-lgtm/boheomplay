from pathlib import Path
import json
import re
import subprocess
import sys

DATE = "2026-07-19"
ROOT = Path(__file__).resolve().parents[1]
DAILY = ROOT / "functions" / f"_qa-{DATE}.js"
INDEX = ROOT / "content" / "insurance-seo-index.json"
SITEMAP = ROOT / "functions" / "sitemap.xml.js"
REGISTRY = ROOT / "functions" / "_daily-questions.js"
ROUTER = ROOT / "functions" / "q" / "[slug].js"
RENDERER = ROOT / "functions" / "_unified-question.js"
MIDDLEWARE = ROOT / "functions" / "q" / "_middleware.js"


def fail(message):
    raise SystemExit(message)


def parse_daily(path):
    text = path.read_text(encoding="utf-8")
    match = re.search(r"export\s+const\s+dailyQuestions\d+\s*=\s*(\[.*?\])\s*;", text, re.S)
    if not match:
        fail(f"daily array not found: {path}")
    return json.loads(match.group(1)), text


items, daily_text = parse_daily(DAILY)
index = json.loads(INDEX.read_text(encoding="utf-8"))

expected = {"slug", "no", "cs", "cn", "url", "title", "intent", "q", "a", "p", "c", "z"}
if len(items) != 10:
    fail(f"expected 10 questions, got {len(items)}")
for number, item in enumerate(items, 1):
    if set(item) != expected:
        fail(f"question {number} has invalid fields: {sorted(set(item) ^ expected)}")
    if not isinstance(item["q"], list) or len(item["q"]) < 3:
        fail(f"question {number} q must have at least 3 paragraphs")
    if not isinstance(item["a"], list) or len(item["a"]) < 3:
        fail(f"question {number} a must have at least 3 paragraphs")
    if not isinstance(item["c"], list) or len(item["c"]) != 5:
        fail(f"question {number} c must have exactly 5 checks")
    for field in ("slug", "cs", "cn", "url", "title", "intent", "p", "z"):
        if not str(item[field]).strip():
            fail(f"question {number} has empty {field}")

for field in ("slug", "title", "intent"):
    values = [item[field] for item in items]
    if len(values) != len(set(values)):
        fail(f"duplicate current-day {field}")

for token in ("<!DOCTYPE", "<html", "<style", "renderDailyQuestionPage", "renderQuestionPage", "renderUnifiedQuestionPage", "function "):
    if token in daily_text:
        fail(f"forbidden renderer token in daily file: {token}")

joined = "\n".join(" ".join([item["title"], item["intent"], *item["q"], *item["a"], item["p"], *item["c"], item["z"]]) for item in items)
for phrase in ("최저", "최고", "1위", "추천", "무조건", "가입 가능 확정", "보험료 절감 확정", "제휴 관계", "공식 관계"):
    if phrase in joined:
        fail(f"forbidden expression: {phrase}")

prior_rows = [row for date, batch in index.get("questionBatches", {}).items() if date != DATE for row in batch]
prior_slugs = {row[0] for row in prior_rows}
prior_titles = {row[1] for row in prior_rows}
for item in items:
    if item["slug"] in prior_slugs:
        fail(f"duplicate prior slug: {item['slug']}")
    if item["title"] in prior_titles:
        fail(f"duplicate prior title: {item['title']}")

registry = REGISTRY.read_text(encoding="utf-8")
variable = "dailyQuestions" + DATE.replace("-", "")
if f"import {{ {variable} }} from './_qa-{DATE}.js';" not in registry:
    fail("daily import missing")
if f"...withDate({variable}, '{DATE}')" not in registry:
    fail("daily registration missing")

router = ROUTER.read_text(encoding="utf-8")
if "from '../_daily-questions.js'" not in router or "renderUnifiedQuestionPage" not in router:
    fail("router no longer uses common daily registry and unified renderer")
if re.search(r"_qa-\d{4}-\d{2}-\d{2}", router):
    fail("router directly imports a dated file")

renderer = RENDERER.read_text(encoding="utf-8")
for marker in ("thread-page", "question-post", "answer-post", "answer-content", "thread-related", "<article>"):
    if marker not in renderer:
        fail(f"unified renderer marker missing: {marker}")

middleware = MIDDLEWARE.read_text(encoding="utf-8")
for marker in ('data-qa-compliance="required-v1"', "본 답변은 일반적인 정보 제공 목적입니다.", "내 보험 기준으로 바로 묻기", "일반 보험 질문 문의", "보험모집종사자: 김도윤", "지에이코리아주식회사", "20260217401069"):
    if marker not in middleware:
        fail(f"compliance marker missing: {marker}")

index["updatedAt"] = DATE
source_by_company = {row[0]: row for row in index.get("sources", [])}
for item in items:
    source_by_company[item["cs"]] = [item["cs"], item["url"], DATE]
new_sources = []
seen = set()
for row in index.get("sources", []):
    company = row[0]
    if company in seen:
        continue
    new_sources.append(source_by_company[company])
    seen.add(company)
for item in items:
    if item["cs"] not in seen:
        new_sources.append(source_by_company[item["cs"]])
        seen.add(item["cs"])
index["sources"] = new_sources
index.setdefault("questionBatches", {})[DATE] = [[item["slug"], item["title"], item["intent"], item["cs"], None] for item in items]
INDEX.write_text(json.dumps(index, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
json.loads(INDEX.read_text(encoding="utf-8"))

sitemap = SITEMAP.read_text(encoding="utf-8")
sitemap, replacements = re.subn(r"const LAST_UPDATED = '\d{4}-\d{2}-\d{2}';", f"const LAST_UPDATED = '{DATE}';", sitemap, count=1)
if replacements != 1:
    fail("sitemap date constant not found")
if "...dailyQuestions.map((item) => ({ loc: url(`/q/${item.slug}`)" not in sitemap:
    fail("daily question sitemap mapping missing")
if "seen.has(entry.loc)" not in sitemap:
    fail("sitemap URL deduplication missing")
SITEMAP.write_text(sitemap, encoding="utf-8")

for path in [DAILY, REGISTRY, ROUTER, RENDERER, MIDDLEWARE, SITEMAP]:
    result = subprocess.run(["node", "--check", str(path)], text=True, capture_output=True)
    if result.returncode:
        fail(f"JavaScript syntax failed for {path}: {result.stderr}")

print(json.dumps({"date": DATE, "questions": len(items), "indexTotal": sum(len(batch) for batch in index["questionBatches"].values()), "status": "validated"}, ensure_ascii=False))
