import { Resend } from 'resend'
import { render } from '@react-email/components'
import OrderConfirmation, { type OrderEmailData } from '@/emails/OrderConfirmation'
import AdminNewOrder from '@/emails/AdminNewOrder'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || 'SepetMama <siparis@mail.sepetmama.com>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@sepetmama.com'

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

function envWarn(action: string, orderId: string) {
  console.warn(`[email] RESEND_API_KEY yok, ${action} atlandı: order=${orderId}`)
}

export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  if (!resend) {
    envWarn('müşteri onay email', data.orderId)
    return
  }
  try {
    const html = await render(OrderConfirmation(data))
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: data.customerEmail,
      subject: `Siparişiniz alındı — #${data.orderId.slice(-8).toUpperCase()}`,
      html,
    })
    if (result.error) {
      console.error('[email] müşteri onay email gönderme hatası:', result.error, 'order=', data.orderId)
    }
  } catch (err) {
    console.error('[email] müşteri onay email beklenmedik hata:', err, 'order=', data.orderId)
  }
}

export async function sendAdminNotification(data: OrderEmailData): Promise<void> {
  if (!resend) {
    envWarn('admin bildirim email', data.orderId)
    return
  }
  try {
    const html = await render(AdminNewOrder(data))
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `Yeni sipariş #${data.orderId.slice(-8).toUpperCase()} — ₺${data.total.toFixed(2)}`,
      html,
    })
    if (result.error) {
      console.error('[email] admin bildirim email gönderme hatası:', result.error, 'order=', data.orderId)
    }
  } catch (err) {
    console.error('[email] admin bildirim email beklenmedik hata:', err, 'order=', data.orderId)
  }
}
