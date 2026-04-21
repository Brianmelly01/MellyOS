import Link from 'next/link'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

const statusStyles: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:    { label: 'Pending',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  PROCESSING: { label: 'Processing', color: '#4d79ff', bg: 'rgba(77,121,255,0.1)'  },
  COMPLETED:  { label: 'Completed',  color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
  CANCELLED:  { label: 'Cancelled',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
  REFUNDED:   { label: 'Refunded',   color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)'  },
}

interface Props {
  orders: Array<{
    id: string
    customerName: string
    amount: number
    currency: string
    status: string
    createdAt: Date
    site: { name: string }
  }>
}

export function RecentOrders({ orders }: Props) {
  return (
    <div className="glass rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
        </div>
        <Link href="/notifications" className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="py-12 text-center">
          <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No orders yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Orders from your connected sites will appear here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Customer</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Site</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {orders.map((order) => {
                const ss = statusStyles[order.status] || statusStyles.PENDING
                return (
                  <tr key={order.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-foreground whitespace-nowrap">{order.customerName}</td>
                    <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{order.site.name}</td>
                    <td className="px-4 py-3.5 font-semibold text-foreground whitespace-nowrap">
                      {order.currency} {(order.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: ss.bg, color: ss.color }}>
                        {ss.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap text-xs">
                      {formatRelativeTime(order.createdAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
