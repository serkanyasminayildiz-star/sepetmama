import { Resend } from 'resend'
import { render } from '@react-email/components'
import OrderConfirmation, { type OrderEmailData } from '@/emails/OrderConfirmation'
import AdminNewOrder from '@/emails/AdminNewOrder'
import CouponEmail, { type CouponEmailData } from '@/emails/CouponEmail'
import WinBackEmail, { type WinBackEmailData } from '@/emails/WinBackEmail'
import RewardEmail, { type RewardEmailData } from '@/emails/RewardEmail'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || 'Leziz Mama <siparis@lezizmama.com>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@lezizmama.com'

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

export async function sendCouponEmail(
  to: string,
  data: CouponEmailData
): Promise<boolean> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY yok, kupon email atlandı: to=${to}`)
    return false
  }
  try {
    const html = await render(CouponEmail(data))
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `🎁 Size özel indirim kuponu: ${data.code}`,
      html,
    })
    if (result.error) {
      console.error('[email] kupon email gönderme hatası:', result.error, 'to=', to)
      return false
    }
    return true
  } catch (err) {
    console.error('[email] kupon email beklenmedik hata:', err, 'to=', to)
    return false
  }
}

export async function sendWinBackEmail(
  to: string,
  data: WinBackEmailData
): Promise<boolean> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY yok, win-back email atlandı: to=${to}`)
    return false
  }
  try {
    const html = await render(WinBackEmail(data))
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Siparişinizi tamamlayamadınız mı? Size özel ${data.discountText} 🎁`,
      html,
    })
    if (result.error) {
      console.error('[email] win-back email gönderme hatası:', result.error, 'to=', to)
      return false
    }
    return true
  } catch (err) {
    console.error('[email] win-back email beklenmedik hata:', err, 'to=', to)
    return false
  }
}

export async function sendRewardEmail(
  to: string,
  data: RewardEmailData
): Promise<boolean> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY yok, ödül email atlandı: to=${to}`)
    return false
  }
  try {
    const html = await render(RewardEmail(data))
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `🎁 ₺${data.rewardValue} hediye kuponu kazandınız!`,
      html,
    })
    if (result.error) {
      console.error('[email] ödül email gönderme hatası:', result.error, 'to=', to)
      return false
    }
    return true
  } catch (err) {
    console.error('[email] ödül email beklenmedik hata:', err, 'to=', to)
    return false
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
