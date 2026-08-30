import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

export interface WinBackEmailData {
  customerName: string
  code: string
  discountText: string // ör. "%15 indirim"
  minOrderText?: string // ör. "Min. ₺200 sepet"
  expiresText?: string
  siteUrl?: string
}

export default function WinBackEmail({
  customerName,
  code,
  discountText,
  minOrderText,
  expiresText,
  siteUrl = 'https://www.lezizmama.com',
}: WinBackEmailData) {
  return (
    <Html>
      <Head />
      <Preview>Siparişinizi tamamlayamadınız mı? Size özel {discountText}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={{ padding: '32px 32px 0', textAlign: 'center' as const }}>
            <Heading as="h1" style={logoStyle}>
              <span style={{ color: '#8A3F22' }}>Leziz</span>
              <span style={{ color: '#2B1810' }}> Mama</span>
            </Heading>
          </Section>

          <Section style={{ padding: '0 32px' }}>
            <Heading as="h2" style={titleStyle}>Siparişinizi tamamlayamadınız mı?</Heading>
            <Text style={paragraphStyle}>
              Merhaba <strong>{customerName || 'değerli müşterimiz'}</strong>,
            </Text>
            <Text style={paragraphStyle}>
              Kısa süre önce sepetinizi hazırladınız ancak siparişiniz tamamlanmadı.
              O sırada sitemizde kısa süreli teknik bir aksaklık yaşanmış olabilir —
              yaşanan zorluk için özür dileriz.
            </Text>
            <Text style={paragraphStyle}>
              Sorunu giderdik. Sizi tekrar aramızda görmek için aşağıdaki indirim
              kuponunu hazırladık. Ödeme adımında kullanmanız yeterli:
            </Text>
          </Section>

          {/* Kupon kutusu */}
          <Section style={{ padding: '8px 32px' }}>
            <div style={couponBoxStyle}>
              <Text style={discountStyle}>{discountText}</Text>
              <div style={codeBadgeStyle}>{code}</div>
              {minOrderText && <Text style={metaStyle}>{minOrderText}</Text>}
              {expiresText && <Text style={metaStyle}>{expiresText}</Text>}
            </div>
          </Section>

          <Section style={{ padding: '8px 32px 24px', textAlign: 'center' as const }}>
            <Link href={siteUrl} style={buttonStyle}>
              Alışverişe Dön
            </Link>
          </Section>

          <Hr style={hrStyle} />

          <Section style={{ padding: '0 32px 32px' }}>
            <Text style={footerTextStyle}>
              Bir sorun yaşarsanız bize ulaşın, yardımcı olalım:<br />
              ✉ <Link href="mailto:info@lezizmama.com" style={linkStyle}>info@lezizmama.com</Link><br />
              📞 +90 532 177 3721
            </Text>
            <Text style={footerSmallStyle}>
              © {new Date().getFullYear()} Leziz Mama · <Link href={siteUrl} style={linkStyle}>www.lezizmama.com</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ---- styles ----
const bodyStyle = {
  backgroundColor: '#F7F1E6',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: 0,
  padding: '32px 0',
}
const containerStyle = {
  backgroundColor: '#ffffff',
  borderRadius: 16,
  margin: '0 auto',
  maxWidth: 560,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
}
const logoStyle = {
  fontSize: 32,
  fontWeight: 900,
  letterSpacing: '-1px',
  margin: 0,
}
const titleStyle = {
  fontSize: 22,
  fontWeight: 800,
  color: '#1f2937',
  margin: '24px 0 12px',
  textAlign: 'center' as const,
}
const paragraphStyle = {
  fontSize: 14,
  lineHeight: 1.6,
  color: '#4b5563',
  margin: '8px 0',
}
const couponBoxStyle = {
  background: '#FBEDDA',
  border: '2px dashed #8A3F22',
  borderRadius: 16,
  padding: '24px 20px',
  margin: '8px 0',
  textAlign: 'center' as const,
}
const discountStyle = {
  fontSize: 26,
  fontWeight: 900,
  color: '#8A3F22',
  margin: '0 0 12px',
}
const codeBadgeStyle = {
  display: 'inline-block',
  background: '#1f2937',
  color: '#ffffff',
  fontFamily: 'monospace',
  fontSize: 20,
  fontWeight: 800,
  letterSpacing: '2px',
  padding: '10px 22px',
  borderRadius: 10,
}
const metaStyle = {
  fontSize: 12,
  color: '#9ca3af',
  margin: '10px 0 0',
}
const buttonStyle = {
  background: '#8A3F22',
  color: '#ffffff',
  textDecoration: 'none',
  padding: '12px 28px',
  borderRadius: 12,
  fontWeight: 800,
  fontSize: 14,
  display: 'inline-block',
}
const hrStyle = {
  borderColor: '#e5e7eb',
  margin: '0 32px',
}
const footerTextStyle = {
  fontSize: 12,
  color: '#6b7280',
  lineHeight: 1.8,
  margin: '16px 0 8px',
  textAlign: 'center' as const,
}
const footerSmallStyle = {
  fontSize: 11,
  color: '#9ca3af',
  textAlign: 'center' as const,
  margin: '8px 0 0',
}
const linkStyle = {
  color: '#8A3F22',
  textDecoration: 'none',
}
