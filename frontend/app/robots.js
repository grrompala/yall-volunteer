// robots.js — served at /robots.txt.
// Everything is open. The named entries are redundant with `*` but document
// intent for the crawlers we specifically care about: Google Search, Bing
// (whose index also feeds ChatGPT Search), Gemini grounding (Google-Extended),
// and OpenAI's search/browse/training fetchers.

const SITE_URL = 'https://www.good-deeds-dallas.org'

export default function robots() {
  const welcome = [
    'Googlebot',
    'Bingbot',
    'Google-Extended',
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
  ]
  // /chat is a prototype harness and /api is machinery — neither belongs in
  // anyone's index. (app/chat/layout.js also sets noindex, which is what
  // actually removes an already-crawled page; this just saves the crawl.)
  const disallow = ['/chat', '/api/']

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      ...welcome.map(userAgent => ({ userAgent, allow: '/', disallow })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
