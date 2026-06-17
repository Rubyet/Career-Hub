import * as cheerio from "cheerio";

export interface CrawlResult {
  url: string;
  html: string;
  text: string;
  title: string;
  jobLinks: string[];
}

export interface CrawlOptions {
  maxPages: number;
  maxConcurrency: number;
  retryAttempts: number;
  delayMs: number;
  timeout: number;
}

const DEFAULT_OPTIONS: CrawlOptions = {
  maxPages: 50,
  maxConcurrency: 3,
  retryAttempts: 3,
  delayMs: 1000,
  timeout: 30000,
};

const JOB_LINK_PATTERNS = [
  /\/jobs?\//i,
  /\/careers?\//i,
  /\/positions?\//i,
  /\/openings?\//i,
  /\/opportunities?\//i,
  /\/apply/i,
  /\/posting/i,
  /greenhouse\.io/i,
  /lever\.co/i,
  /workday\.com/i,
  /ashbyhq\.com/i,
  /bamboohr\.com/i,
  /boards\./i,
];

function isJobLink(url: string): boolean {
  return JOB_LINK_PATTERNS.some((pattern) => pattern.test(url));
}

function normalizeUrl(base: string, href: string): string | null {
  try {
    const url = new URL(href, base);
    // Only allow http/https
    if (!url.protocol.startsWith("http")) return null;
    // Remove fragment
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

export async function crawlUrl(
  url: string,
  options: Partial<CrawlOptions> = {}
): Promise<CrawlResult[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const visited = new Set<string>();
  const results: CrawlResult[] = [];
  const queue: string[] = [url];

  while (queue.length > 0 && results.length < opts.maxPages) {
    const batch = queue.splice(0, opts.maxConcurrency);
    const promises = batch
      .filter((u) => !visited.has(u))
      .map(async (pageUrl) => {
        visited.add(pageUrl);
        for (let attempt = 0; attempt < opts.retryAttempts; attempt++) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), opts.timeout);

            const response = await fetch(pageUrl, {
              signal: controller.signal,
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (compatible; CareerIntelligenceHub/1.0; +http://localhost:3000)",
                Accept: "text/html,application/xhtml+xml",
              },
            });

            clearTimeout(timeoutId);

            if (!response.ok) continue;

            const html = await response.text();
            const result = parseHtml(html, pageUrl);
            results.push(result);

            // Add discovered job links to queue
            for (const link of result.jobLinks) {
              if (!visited.has(link) && results.length + queue.length < opts.maxPages) {
                queue.push(link);
              }
            }

            break;
          } catch {
            if (attempt < opts.retryAttempts - 1) {
              await new Promise((r) => setTimeout(r, opts.delayMs * (attempt + 1)));
            }
          }
        }
      });

    await Promise.all(promises);
    await new Promise((r) => setTimeout(r, opts.delayMs));
  }

  return results;
}

export function parseHtml(html: string, sourceUrl: string): CrawlResult {
  const $ = cheerio.load(html);

  // Remove scripts, styles, nav, footer
  $("script, style, nav, footer, header, iframe, noscript").remove();

  const title = $("title").text().trim() || $("h1").first().text().trim();

  // Extract job links
  const jobLinks: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      const normalized = normalizeUrl(sourceUrl, href);
      if (normalized && isJobLink(normalized)) {
        jobLinks.push(normalized);
      }
    }
  });

  // Extract clean text
  const text = $("body")
    .text()
    .replace(/\s+/g, " ")
    .trim();

  return {
    url: sourceUrl,
    html,
    text,
    title,
    jobLinks: [...new Set(jobLinks)],
  };
}

export function extractJobPostings(html: string, sourceUrl: string) {
  const $ = cheerio.load(html);

  // Remove non-content elements
  $("script, style, nav, footer, header, iframe, noscript").remove();

  // Common job listing selectors
  const jobSelectors = [
    '[class*="job-listing"]',
    '[class*="job-card"]',
    '[class*="job-post"]',
    '[class*="position-card"]',
    '[class*="opening"]',
    '[data-job]',
    '[class*="vacancy"]',
    ".posting",
    ".job",
    "article",
    '[class*="career"]',
  ];

  const jobs: { title: string; url: string; html: string; text: string }[] = [];

  for (const selector of jobSelectors) {
    $(selector).each((_, el) => {
      const $el = $(el);
      const title =
        $el.find("h2, h3, h4, a").first().text().trim() ||
        $el.find('[class*="title"]').first().text().trim();

      if (!title || title.length < 3) return;

      const link = $el.find("a").first().attr("href");
      const url = link ? normalizeUrl(sourceUrl, link) || sourceUrl : sourceUrl;

      jobs.push({
        title,
        url,
        html: $el.html() || "",
        text: $el.text().replace(/\s+/g, " ").trim(),
      });
    });

    if (jobs.length > 0) break;
  }

  // If no jobs found via selectors, treat the whole page as one job posting
  if (jobs.length === 0) {
    const mainContent =
      $("main, [role='main'], .content, #content, article").first().html() ||
      $("body").html() ||
      "";

    const title =
      $("h1").first().text().trim() ||
      $("title").text().trim();

    if (title) {
      jobs.push({
        title,
        url: sourceUrl,
        html: mainContent,
        text: $(mainContent).text().replace(/\s+/g, " ").trim(),
      });
    }
  }

  return jobs;
}
