export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'

export interface OrderStatusMeta {
  label: string
  emoji: string
  bg: string
  color: string
  description: string
}

export const ORDER_STATUS: Record<OrderStatus, OrderStatusMeta> = {
  PENDING: {
    label: 'Beklemede',
    emoji: '⏳',
    bg: '#FFF3E0',
    color: '#E65100',
    description: 'Ödeme bekleniyor',
  },
  CONFIRMED: {
    label: 'Hazırlanıyor',
    emoji: '📦',
    bg: '#E3F2FD',
    color: '#1565C0',
    description: 'Siparişiniz hazırlanıyor',
  },
  SHIPPED: {
    label: 'Kargoda',
    emoji: '🚚',
    bg: '#F3E5F5',
    color: '#6A1B9A',
    description: 'Siparişiniz kargoya verildi',
  },
  DELIVERED: {
    label: 'Teslim edildi',
    emoji: '✅',
    bg: '#E8F5E9',
    color: '#2E7D32',
    description: 'Siparişiniz teslim edildi',
  },
  CANCELLED: {
    label: 'İptal edildi',
    emoji: '❌',
    bg: '#FFEBEE',
    color: '#C62828',
    description: 'Sipariş iptal edildi',
  },
  REFUNDED: {
    label: 'İade edildi',
    emoji: '↩️',
    bg: '#EEEEEE',
    color: '#424242',
    description: 'Sipariş iade edildi',
  },
}

export function getStatusMeta(status: string): OrderStatusMeta {
  return ORDER_STATUS[status as OrderStatus] || {
    label: status,
    emoji: '•',
    bg: '#F5F5F5',
    color: '#666',
    description: status,
  }
}
