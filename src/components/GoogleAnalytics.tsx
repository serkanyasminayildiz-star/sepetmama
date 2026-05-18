import Script from 'next/script'

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID

export default function GoogleAnalytics() {
  if (!GA_ID && !ADS_ID) return null

  const loaderId = GA_ID || ADS_ID

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${loaderId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${GA_ID ? `gtag('config', '${GA_ID}', { send_page_view: true });` : ''}
          ${ADS_ID ? `gtag('config', '${ADS_ID}');` : ''}
        `}
      </Script>
    </>
  )
}
