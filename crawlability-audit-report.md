# Crawlability Audit Report

Audit date: 21 July 2026  
Website: https://www.tutorservices.in/

## Scope

- 13 public HTML pages
- Internal HTML links and fragments
- XML sitemap coverage
- robots.txt rules
- Titles and meta descriptions
- Robots indexing directives
- Canonical URLs
- Production HTTP status codes
- Domain and path redirect behavior

## Local Project Results

| Check | Result |
|---|---:|
| Public pages discovered | 13 |
| Pages reachable from the homepage | 13 |
| Orphan pages | 0 |
| Pages with zero incoming links | 0 |
| Broken internal links | 0 |
| Broken internal fragments | 0 |
| Duplicate title tags | 0 |
| Duplicate meta descriptions | 0 |
| Duplicate canonical URLs | 0 |
| Pages containing noindex | 0 |
| Canonical URL errors | 0 |
| Pages missing from local sitemap | 0 |
| Extra URLs in local sitemap | 0 |

## Live Website Results

- All 13 intended public page URLs return HTTP 200.
- All internal destination pages resolve directly without redirect chains.
- `https://tutorservices.in/` permanently redirects once to `https://www.tutorservices.in/`.
- `http://www.tutorservices.in/` permanently redirects once to `https://www.tutorservices.in/`.
- `http://tutorservices.in/` uses two permanent redirects: HTTP to HTTPS, then apex to www.
- `https://www.tutorservices.in/index.html` currently returns HTTP 200 and duplicates the homepage.
- Clean path variants such as `/about` and `/blog` return HTTP 404; the canonical `.html` URLs work correctly.
- Live robots.txt returns HTTP 200 and references the correct sitemap URL.
- The deployed sitemap currently contains 9 URLs, while the corrected local sitemap contains 13.
- The deployed website currently exposes canonicals on 5 article pages; the corrected local project includes canonicals on all 13 pages.
- The deployed website has 13 unique titles, 13 unique meta descriptions and no noindex directives.

## Fixes Implemented

1. Added a permanent Vercel redirect from `/index.html` to `/` in `vercel.json`.
2. Confirmed every local public page has one unique canonical URL on the preferred `https://www.tutorservices.in` host.
3. Confirmed all 13 canonical URLs are included in the generated local `sitemap.xml`.
4. Confirmed `robots.txt` permits public crawling and points to the sitemap.
5. Confirmed all public pages are reachable through internal links from the homepage.

## Deployment Required

Upload and deploy:

- All 13 current public HTML pages
- `sitemap.xml`
- `robots.txt`
- `vercel.json`
- `generate-sitemap.js`

After deployment, `/index.html` should permanently redirect to `/`, all 13 pages should expose canonical tags, and the live sitemap should list 13 URLs.

## External Redirect Note

The two-hop redirect from `http://tutorservices.in/` is caused by platform/domain routing: HTTP is upgraded to HTTPS before the apex domain redirects to the preferred www host. It is permanent, reaches the correct canonical URL, and cannot be safely reduced from static page code. Internal links already point directly to canonical page URLs and do not use this chain.
