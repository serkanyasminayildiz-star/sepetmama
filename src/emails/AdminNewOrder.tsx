import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { OrderEmailData } from './OrderConfirmation'

export default function AdminNewOrder({
  orderId,
  total,
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  items,
  siteUrl = 'https://www.lezizmama.com',
}: OrderEmailData) {
  const shortId = orderId.slice(-8).toUpperCase()
  const adminUrl = `${siteUrl}/admin/siparisler`
  const fisUrl = `${siteUrl}/admin/siparisler/${orderId}/fis`
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <Html>
      <Head />
      <Preview>Yeni sipariş #{shortId} — ₺{total.toFixed(2)}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={{ padding: '24px 24px 0', textAlign: 'center' as const }}>
            <Heading as="h1" style={badgeStyle}>🛒 YENİ SİPARİŞ</Heading>
            <Text style={shortIdStyle}>#{shortId}</Text>
          </Section>

          <Section style={{ padding: '0 24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 }}>
              <tbody>
                <tr>
                  <td style={labelCell}>Müşteri</td>
                  <td style={valueCell}><strong>{customerName}</strong></td>
                </tr>
                <tr>
                  <td style={labelCell}>Telefon</td>
                  <td style={valueCell}>{customerPhone}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Email</td>
                  <td style={valueCell}>{customerEmail}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Ürün</td>
                  <td style={valueCell}>{items.length} çeşit / {itemCount} adet</td>
                </tr>
                <tr>
                  <td style={labelCell}>Toplam</td>
                  <td style={{ ...valueCell, color: '#1B5E4B', fontWeight: 800, fontSize: 16 }}>
                    ₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td style={labelCell}>Adres</td>
                  <td style={valueCell}>{shippingAddress}</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section style={{ padding: '20px 24px', textAlign: 'center' as const }}>
            <Link href={fisUrl} style={buttonPrimary}>
              🖨️ Paketleme Fişi
            </Link>
            <Link href={adminUrl} style={buttonSecondary}>
              Siparişler
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const bodyStyle = {
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: 0,
  padding: '24px 0',
}
const containerStyle = {
  backgroundColor: '#ffffff',
  borderRadius: 12,
  margin: '0 auto',
  maxWidth: 520,
  border: '2px solid #1B5E4B',
}
const badgeStyle = {
  background: '#1B5E4B',
  color: '#ffffff',
  display: 'inline-block',
  padding: '6px 16px',
  borderRadius: 50,
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.5px',
  margin: 0,
}
const shortIdStyle = {
  fontSize: 24,
  fontWeight: 900,
  fontFamily: 'monospace',
  color: '#1f2937',
  margin: '8px 0 16px',
}
const labelCell = {
  padding: '8px 12px 8px 0',
  fontSize: 11,
  color: '#9ca3af',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  verticalAlign: 'top' as const,
  width: 90,
}
const valueCell = {
  padding: '8px 0',
  fontSize: 13,
  color: '#1f2937',
  verticalAlign: 'top' as const,
}
const buttonPrimary = {
  background: '#1B5E4B',
  color: '#ffffff',
  textDecoration: 'none',
  padding: '10px 20px',
  borderRadius: 10,
  fontWeight: 800,
  fontSize: 13,
  display: 'inline-block',
  margin: '0 6px',
}
const buttonSecondary = {
  background: '#f3f4f6',
  color: '#374151',
  textDecoration: 'none',
  padding: '10px 20px',
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 13,
  display: 'inline-block',
  margin: '0 6px',
}
