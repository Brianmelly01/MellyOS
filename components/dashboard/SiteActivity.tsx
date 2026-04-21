import Link from 'next/link'
import { Globe, ArrowRight, CheckCircle, XCircle } from 'lucide-react'

interface Props {
  sites: Array<{
    id: string
    name: string
    url: string
    isActive: boolean
  }>
}

export function SiteActivity({ sites }: Props) {
  return (
    <div className="glass rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Connected Sites</h2>
        </div>
        <Link href="/sites" className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors">
          Manage <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-border/30">
        {sites.length === 0 ? (
          <div className="py-6 text-center">
            <Globe className="w-7 h-7 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No sites connected</p>
            <Link href="/sites" className="text-xs text-brand-400 hover:underline mt-1 inline-block">Add your first site →</Link>
          </div>
        ) : sites.map((site) => (
          <div key={site.id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/40 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{site.name}</p>
              <p className="text-xs text-muted-foreground truncate">{site.url}</p>
            </div>
            {site.isActive
              ? <CheckCircle className="w-4 h-4 text-neon-green flex-shrink-0" />
              : <XCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  )
}
