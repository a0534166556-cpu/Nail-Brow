import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { PHONE_E164, STUDIO_ADDRESS_DISPLAY } from '../constants/contact'
import { seoForPath, SITE_NAME, SITE_URL } from '../constants/site'

function setMeta(
  key: string,
  content: string,
  attr: 'name' | 'property' = 'name',
) {
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

const LOCAL_BUSINESS_JSON_ID = 'local-business-jsonld'

function upsertLocalBusinessJsonLd() {
  const existing = document.getElementById(LOCAL_BUSINESS_JSON_ID)
  if (existing) return

  const script = document.createElement('script')
  script.id = LOCAL_BUSINESS_JSON_ID
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: SITE_NAME,
    description:
      'סטודיו לציפורניים, לק ג׳ל, מניקור, פדיקור ועיצוב גבות',
    url: SITE_URL,
    telephone: PHONE_E164,
    address: {
      '@type': 'PostalAddress',
      streetAddress: STUDIO_ADDRESS_DISPLAY,
      addressLocality: 'אשקלון',
      addressCountry: 'IL',
    },
    areaServed: { '@type': 'City', name: 'אשקלון' },
    priceRange: '₪₪',
    inLanguage: 'he',
  })
  document.head.appendChild(script)
}

export function PageSeo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = seoForPath(pathname)
    const canonicalPath = pathname === '/' ? '' : pathname
    const canonical = `${SITE_URL}${canonicalPath}`
    const ogImage = `${SITE_URL}/og-image.svg`

    document.title = meta.title
    setMeta('description', meta.description)
    setMeta('robots', meta.noIndex ? 'noindex, nofollow' : 'index, follow')
    setMeta('og:title', meta.title, 'property')
    setMeta('og:description', meta.description, 'property')
    setMeta('og:type', 'website', 'property')
    setMeta('og:url', canonical, 'property')
    setMeta('og:locale', 'he_IL', 'property')
    setMeta('og:site_name', SITE_NAME, 'property')
    setMeta('og:image', ogImage, 'property')
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', meta.title)
    setMeta('twitter:description', meta.description)
    setMeta('twitter:image', ogImage)
    setLink('canonical', canonical)

    const googleVerify = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION?.trim()
    if (googleVerify) {
      setMeta('google-site-verification', googleVerify)
    }

    upsertLocalBusinessJsonLd()
  }, [pathname])

  return null
}
