const fs = require("fs");
const path = require("path");

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATA_SOURCE_ID = process.env.NOTION_DATA_SOURCE_ID;

if (!NOTION_TOKEN || !DATA_SOURCE_ID) {
  console.error("NOTION_TOKEN 또는 NOTION_DATA_SOURCE_ID가 없습니다.");
  process.exit(1);
}

async function fetchAllPages() {
  const pages = [];
  let cursor;

  do {
    const response = await fetch(
      `https://api.notion.com/v1/data_sources/${DATA_SOURCE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2025-09-03",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page_size: 100,
          ...(cursor ? { start_cursor: cursor } : {}),
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Notion API 오류 ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    pages.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);

  return pages;
}

function getTitle(page) {
  const titleParts = page.properties?.["이름"]?.title ?? [];
  return titleParts.map((part) => part.plain_text).join("").trim();
}

function getDateRange(page) {
  const date = page.properties?.["날짜"]?.date;

  return {
    start: date?.start ?? null,
    end: date?.end ?? date?.start ?? null,
  };
}

async function main() {
  const pages = await fetchAllPages();

  const events = pages
  .map((page) => {
    const date = getDateRange(page);

    return {
      title: getTitle(page),
      start: date.start,
      end: date.end,
      date: date.start,
      url: page.url,
    };
  })
  .filter((event) => event.title && event.start)
  .sort((a, b) => a.start.localeCompare(b.start));
  
  const outputPath = path.join(__dirname, "..", "events.json");

  fs.writeFileSync(
    outputPath,
    JSON.stringify(events, null, 2),
    "utf8"
  );

  console.log(`${events.length}개의 일정을 events.json에 저장했습니다.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});