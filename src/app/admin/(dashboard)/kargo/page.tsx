import AdminShell from '../AdminShell'

export default function KargoPage() {
  return (
    <AdminShell>
      <div>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 700, color: '#2C1A0E', marginBottom: 20 }}>🚚 Kargo Ayarları</h1>
        <div style={{ background: 'white', borderRadius: 18, padding: 28, boxShadow: '0 4px 16px rgba(92,61,46,0.06)', maxWidth: 520 }}>
          <div style={{ background: '#FDF6EE', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: '#5C3D2E', fontWeight: 600, margin: 0 }}>
              🚚 Ücretsiz kargo limiti: <span style={{ color: '#E8845A' }}>₺1.000</span>
            </p>
            <p style={{ fontSize: 13, color: '#5C3D2E', opacity: 0.6, marginTop: 6, marginBottom: 0 }}>
              Standart kargo ücreti: <span style={{ fontWeight: 700 }}>₺49,90</span>
            </p>
          </div>
          <p style={{ fontSize: 13, color: '#5C3D2E', opacity: 0.6 }}>
            Kargo ayarlarını değiştirmek için <code>src/app/(shop)/sepet/CartClient.tsx</code> ve <code>src/app/(shop)/odeme/OdemeClient.tsx</code> dosyalarındaki <code>FREE_SHIPPING</code> ve <code>SHIPPING_FEE</code> sabitlerini güncelleyin.
          </p>
        </div>
      </div>
    </AdminShell>
  )
}
