import { prisma } from '@/lib/prisma'
import AdminShell from '../AdminShell'
import KategorilerClient from './KategorilerClient'

export default async function KategorilerPage() {
  const kategoriler = await prisma.category.findMany({
    include: { parent: true, children: true },
    orderBy: { name: 'asc' },
  })

  return (
    <AdminShell>
      <KategorilerClient kategoriler={JSON.parse(JSON.stringify(kategoriler))} />
    </AdminShell>
  )
}
