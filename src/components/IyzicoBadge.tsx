/**
 * iyzico logo rozetleri.
 *
 * SVG'ler Next.js Image optimizer'ından geçmiyor ("image type is not allowed");
 * `dangerouslyAllowSVG` açmak ise tüm görselleri (admin'den yüklenenler dahil)
 * etkileyeceği için tercih edilmedi. Bu dosyalar /public altında statik ve
 * küçük olduğundan doğrudan <img> ile servis ediliyor.
 */

type Variant = 'band-white' | 'band-colored' | 'pay-with'

const SOURCES: Record<Variant, { src: string; alt: string }> = {
  'band-white': {
    src: '/images/iyzico/logo-band-white.svg',
    alt: 'iyzico ile Öde — Mastercard, Visa, American Express, Troy',
  },
  'band-colored': {
    src: '/images/iyzico/logo-band-colored.svg',
    alt: 'Mastercard, Visa, American Express, Troy ile ödeyebilirsiniz',
  },
  'pay-with': {
    src: '/images/iyzico/iyzico-ile-ode.svg',
    alt: 'iyzico ile Öde',
  },
}

export default function IyzicoBadge({
  variant,
  className = '',
}: {
  variant: Variant
  className?: string
}) {
  const { src, alt } = SOURCES[variant]
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" decoding="async" className={className} />
  )
}
