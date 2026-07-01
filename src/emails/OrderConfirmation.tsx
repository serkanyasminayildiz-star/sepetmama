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

export interface OrderEmailData {
  orderId: string
  total: number
  shippingFee: number
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  items: { name: string; quantity: number; price: number }[]
  isLoggedInUser?: boolean
  siteUrl?: string
}

export default function OrderConfirmation({
  orderId,
  total,
  shippingFee,
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  items,
  isLoggedInUser = false,
  siteUrl = 'https://www.sepetmama.com',
}: OrderEmailData) {
  const subtotal = total - shippingFee
  const shortId = orderId.slice(-8).toUpperCase()
  const trackUrl = `${siteUrl}/siparis/${orderId}`

  return (
    <Html>
      <Head />
      <Preview>Siparişiniz alındı — #{shortId}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={{ padding: '32px 32px 0', textAlign: 'center' as const }}>
            <Heading as="h1" style={logoStyle}>
              <span style={{ color: '#f97316' }}>se</span>
              <span style={{ color: '#2563eb' }}>Pet</span>
              <span style={{ color: '#f97316' }}>Mama</span>
            </Heading>
          </Section>

          <Section style={{ padding: '0 32px' }}>
            <Heading as="h2" style={titleStyle}>🎉 Siparişiniz alındı!</Heading>
            <Text style={paragraphStyle}>
              Merhaba <strong>{customerName}</strong>,
            </Text>
            <Text style={paragraphStyle}>
              Siparişiniz başarıyla alındı ve hazırlanmaya başlandı. Kargoya verildiğinde size tekrar bilgi vereceğiz.
            </Text>
          </Section>

          {/* Sipariş özeti kutusu */}
          <Section style={{ padding: '0 32px' }}>
            <div style={summaryBoxStyle}>
              <Text style={summaryLabelStyle}>SİPARİŞ NO</Text>
              <Text style={summaryValueStyle}>#{shortId}</Text>
              <Hr style={hrInBoxStyle} />
              <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td style={itemNameCellStyle}>
                        {item.name}
                        <div style={itemQtyStyle}>{item.quantity} adet × ₺{item.price.toFixed(2)}</div>
                      </td>
                      <td style={itemTotalCellStyle}>
                        ₺{(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Hr style={hrInBoxStyle} />
              <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                <tbody>
                  <tr>
                    <td style={totalsLabelStyle}>Ara Toplam</td>
                    <td style={totalsValueStyle}>₺{subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style={totalsLabelStyle}>Kargo</td>
                    <td style={totalsValueStyle}>
                      {shippingFee === 0 ? 'Ücretsiz' : `₺${shippingFee.toFixed(2)}`}
                    </td>
                  </tr>
                  <tr>
                    <td style={grandTotalLabelStyle}>Toplam</td>
                    <td style={grandTotalValueStyle}>
                      ₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* Teslimat */}
          <Section style={{ padding: '0 32px' }}>
            <Heading as="h3" style={subTitleStyle}>📦 Teslimat Bilgileri</Heading>
            <Text style={infoBlockStyle}>
              <strong>{customerName}</strong><br />
              📞 {customerPhone}<br />
              ✉ {customerEmail}<br />
              <span style={{ display: 'inline-block', marginTop: 6 }}>{shippingAddress}</span>
            </Text>
          </Section>

          {/* CTA — sadece login user için */}
          {isLoggedInUser && (
            <Section style={{ padding: '24px 32px', textAlign: 'center' as const }}>
              <Link href={trackUrl} style={buttonStyle}>
                Siparişimi Takip Et
              </Link>
            </Section>
          )}

          <Hr style={hrStyle} />

          {/* Footer */}
          <Section style={{ padding: '0 32px 32px' }}>
            <Text style={footerTextStyle}>
              Sorularınız için bize ulaşın:<br />
              ✉ <Link href="mailto:info@sepetmama.com" style={linkStyle}>info@sepetmama.com</Link><br />
              📞 +90 532 177 3721
            </Text>
            <Text style={footerSmallStyle}>
              © {new Date().getFullYear()} SepetMama · <Link href={siteUrl} style={linkStyle}>www.sepetmama.com</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ---- styles ----
const bodyStyle = {
  backgroundColor: '#f9fafb',
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
const subTitleStyle = {
  fontSize: 14,
  fontWeight: 800,
  color: '#1f2937',
  margin: '24px 0 8px',
  textTransform: 'uppercase' as const,
}
const paragraphStyle = {
  fontSize: 14,
  lineHeight: 1.6,
  color: '#4b5563',
  margin: '8px 0',
}
const summaryBoxStyle = {
  background: '#fff7ed',
  border: '1px solid #fed7aa',
  borderRadius: 12,
  padding: '16px 20px',
  margin: '16px 0',
}
const summaryLabelStyle = {
  fontSize: 10,
  fontWeight: 700,
  color: '#9ca3af',
  letterSpacing: '0.5px',
  margin: 0,
  textTransform: 'uppercase' as const,
}
const summaryValueStyle = {
  fontSize: 18,
  fontWeight: 800,
  color: '#1f2937',
  fontFamily: 'monospace',
  margin: '2px 0 0',
}
const hrInBoxStyle = {
  borderColor: '#fed7aa',
  margin: '12px 0',
}
const itemNameCellStyle = {
  padding: '8px 0',
  fontSize: 13,
  color: '#1f2937',
  fontWeight: 600,
}
const itemQtyStyle = {
  fontSize: 11,
  color: '#9ca3af',
  fontWeight: 400,
  marginTop: 2,
}
const itemTotalCellStyle = {
  padding: '8px 0',
  fontSize: 13,
  color: '#1f2937',
  fontWeight: 700,
  textAlign: 'right' as const,
  whiteSpace: 'nowrap' as const,
  verticalAlign: 'top' as const,
}
const totalsLabelStyle = {
  padding: '4px 0',
  fontSize: 13,
  color: '#6b7280',
}
const totalsValueStyle = {
  padding: '4px 0',
  fontSize: 13,
  color: '#1f2937',
  textAlign: 'right' as const,
  fontWeight: 600,
}
const grandTotalLabelStyle = {
  padding: '10px 0 0',
  fontSize: 15,
  color: '#1f2937',
  fontWeight: 800,
  borderTop: '1px solid #fed7aa',
}
const grandTotalValueStyle = {
  padding: '10px 0 0',
  fontSize: 18,
  color: '#f97316',
  textAlign: 'right' as const,
  fontWeight: 800,
  borderTop: '1px solid #fed7aa',
}
const infoBlockStyle = {
  background: '#f9fafb',
  borderRadius: 12,
  padding: '14px 18px',
  fontSize: 13,
  color: '#374151',
  lineHeight: 1.6,
}
const buttonStyle = {
  background: '#f97316',
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
  color: '#f97316',
  textDecoration: 'none',
}
