export interface SEOConfig {
  title: string
  description: string
  keywords: string[]
  author: string
  siteUrl: string
  siteName: string
  twitterHandle?: string
  locale: string
  themeColor: string
  ogImage?: string
  twitterImage?: string
}

export interface PageSEO {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  noIndex?: boolean
}

// Default SEO Configuration
export const defaultSEO: SEOConfig = {
  title: 'Banana by Monky - รายรับรายจ่ายส่วนตัว',
  description: 'ระบบบันทึกรายรับรายจ่ายส่วนตัว Banana by Monky ติดตามการเงินง่าย ๆ',
  keywords: [
    'vue3',
    'vuetify',
    'admin template',
    'dashboard',
    'web app',
    'typescript',
    'banana by monky',
    'รายรับรายจ่าย',
    'การเงินส่วนตัว',
  ],
  author: 'Banana by Monky',
  siteUrl: import.meta.env.VITE_APP_URL || 'https://yourdomain.com',
  siteName: 'Banana by Monky',
  twitterHandle: import.meta.env.VITE_TWITTER_HANDLE || '@bananabymonky',
  locale: 'th_TH',
  themeColor: '#3b82f6',
  ogImage: '/og-image.png',
  twitterImage: '/twitter-image.png',
}

// Generate full title
export function generateTitle(pageTitle?: string): string {
  if (!pageTitle)
    return defaultSEO.title

  return `${pageTitle} | ${defaultSEO.siteName}`
}

// Generate full URL
export function generateUrl(path?: string): string {
  const baseUrl = defaultSEO.siteUrl.replace(/\/$/, '')
  if (!path)
    return baseUrl

  const cleanPath = path.startsWith('/') ? path : `/${path}`

  return `${baseUrl}${cleanPath}`
}

// Generate full image URL
export function generateImageUrl(image?: string): string {
  if (!image)
    return generateUrl(defaultSEO.ogImage)

  // If image is already a full URL, return it
  if (image.startsWith('http://') || image.startsWith('https://'))
    return image

  return generateUrl(image)
}
