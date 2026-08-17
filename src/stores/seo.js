export const SITE_META = {
  title: '2026陕航电气GCU/BPCU设备TTP测试平台招标公告',
  keywords: '陕西航空电气有限责任公司, TTP需求测试, GCU测试, BPCU设备, TTP总线, 0730-2611010439/01, 航空电气招标, 西安招标',
  description:
    '陕西航空电气有限责任公司发布基于GCU/BPCU设备的TTP需求测试验证平台采购招标公告，涵盖总线同步、故障注入及通信测试，截止2026年9月3日。',
  url: 'https://26-ttp-test-bid.softwarelink.net/',
  jsonLd: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        headline: '2026陕航电气GCU/BPCU设备TTP测试平台招标公告',
        description:
          '陕西航空电气有限责任公司发布基于GCU/BPCU设备的TTP需求测试验证平台采购招标公告，涵盖总线同步、故障注入及通信测试，截止2026年9月3日。',
        url: 'https://26-ttp-test-bid.softwarelink.net/',
        datePublished: '2026-08-13T18:01:59+08:00',
      },
    ],
  },
}

function upsertMeta(selector, attr, value) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    const [key, val] = selector.replace(/[[\]]/g, '').split('=')
    el.setAttribute(key.replace('meta', '').trim() || attr, val?.replace(/"/g, '') || '')
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

export function applySiteMeta() {
  document.title = SITE_META.title
  const kw = document.querySelector('meta[name="keywords"]')
  if (kw) kw.setAttribute('content', SITE_META.keywords)
  const desc = document.querySelector('meta[name="description"]')
  if (desc) desc.setAttribute('content', SITE_META.description)
  const ogType = document.querySelector('meta[property="og:type"]')
  if (ogType) ogType.setAttribute('content', 'article')
  const ogTitle = document.querySelector('meta[property="og:title"]')
  if (ogTitle) ogTitle.setAttribute('content', SITE_META.title)
  const ogDesc = document.querySelector('meta[property="og:description"]')
  if (ogDesc) ogDesc.setAttribute('content', SITE_META.description)
  const ogUrl = document.querySelector('meta[property="og:url"]')
  if (ogUrl) ogUrl.setAttribute('content', SITE_META.url)
  upsertMeta('meta[property="og:type"]', 'content', 'article')

  let ld = document.head.querySelector('script[type="application/ld+json"]')
  if (!ld) {
    ld = document.createElement('script')
    ld.type = 'application/ld+json'
    document.head.appendChild(ld)
  }
  ld.textContent = JSON.stringify(SITE_META.jsonLd)
}
