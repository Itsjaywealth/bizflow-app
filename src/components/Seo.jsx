import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'BizFlow NG'
const SITE_URL = 'https://bizflowng.com'
const DEFAULT_TITLE = 'BizFlow NG — Business Management Software for Nigerian SMEs'
const DEFAULT_DESCRIPTION = 'Invoicing, payroll, HR and client management built for Nigerian businesses. Get paid faster. Run smarter.'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`
const SEARCH_CONSOLE_VERIFICATION =
  process.env.REACT_APP_GOOGLE_SITE_VERIFICATION || 'google-site-verification-placeholder'

function absolutize(url) {
  if (!url) return SITE_URL
  if (url.startsWith('http')) return url
  return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`
}

export default function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  path = '/',
  type = 'website',
  noindex = false,
}) {
  const canonical = absolutize(path)
  const socialImage = absolutize(image)

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="google-site-verification" content={SEARCH_CONSOLE_VERIFICATION} />
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={socialImage} />
      <meta property="og:image:alt" content={`${SITE_NAME} preview`} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_NG" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@bizflowng" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={socialImage} />
      <link rel="canonical" href={canonical} />
    </Helmet>
  )
}

Seo.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  path: PropTypes.string,
  type: PropTypes.string,
  noindex: PropTypes.bool,
}

export {
  SITE_NAME,
  SITE_URL,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  SEARCH_CONSOLE_VERIFICATION,
}
