'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, Bell, ShoppingBag, Key, Copy, RefreshCw, Trash2, Check, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { maskApiKey } from '@/lib/api-key'
import { formatDate } from '@/lib/utils'

interface Site {
  id: string
  name: string
  url: string
  description: string | null
  apiKey: string
  isActive: boolean
  createdAt: Date
  _count: { notifications: number; orders: number }
}

interface Props {
  site: Site
  onDelete: (id: string) => void
  onRegenerateKey: (id: string) => void
}

export function SiteCard({ site, onDelete, onRegenerateKey }: Props) {
  const [copied, setCopied] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [showSnippet, setShowSnippet] = useState(false)
  const [deletingConfirm, setDeletingConfirm] = useState(false)

  async function copyKey() {
    await navigator.clipboard.writeText(site.apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const curlSnippet = `curl -X POST ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notify \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${site.apiKey}" \\
  -d '{"type":"CUSTOM","title":"Hello from ${site.name}","body":"Test notification"}'`

  return (
    <div className="glass rounded-2xl border border-border p-5 flex flex-col gap-4 hover:border-brand-400/25 transition-all duration-300 group">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-brand-400/10 border border-brand-400/20 flex items-center justify-center flex-shrink-0">
            <Globe className="w-4 h-4 text-brand-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{site.name}</h3>
            <a href={site.url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-brand-400 transition-colors flex items-center gap-1 truncate">
              {site.url} <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
            </a>
          </div>
        </div>
        <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${site.isActive ? 'text-neon-green bg-neon-green/10' : 'text-muted-foreground bg-muted/50'}`}>
          {site.isActive ? '● Active' : '● Inactive'}
        </span>
      </div>

      {/* Description */}
      {site.description && (
        <p className="text-xs text-muted-foreground leading-relaxed">{site.description}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 bg-accent/50 rounded-xl px-3 py-2">
          <Bell className="w-3.5 h-3.5 text-brand-400" />
          <div>
            <p className="text-xs font-bold text-foreground">{site._count.notifications}</p>
            <p className="text-[10px] text-muted-foreground">Notifications</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-accent/50 rounded-xl px-3 py-2">
          <ShoppingBag className="w-3.5 h-3.5 text-neon-cyan" />
          <div>
            <p className="text-xs font-bold text-foreground">{site._count.orders}</p>
            <p className="text-[10px] text-muted-foreground">Orders</p>
          </div>
        </div>
      </div>

      {/* API Key section */}
      <div className="bg-input/40 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Key className="w-3 h-3" /> API Key
          </span>
          <div className="flex items-center gap-1">
            <button onClick={copyKey} title="Copy API key"
              className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
              {copied ? <Check className="w-3.5 h-3.5 text-neon-green" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => onRegenerateKey(site.id)} title="Regenerate API key"
              className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-destructive">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <code className="text-xs font-mono text-muted-foreground break-all">
          {showKey ? site.apiKey : maskApiKey(site.apiKey)}
        </code>
        <button onClick={() => setShowKey(v => !v)} className="text-[10px] text-brand-400 hover:text-brand-300">
          {showKey ? 'Hide' : 'Show'} full key
        </button>
      </div>

      {/* Code snippet toggle */}
      <button
        onClick={() => setShowSnippet(v => !v)}
        className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <span>Integration snippet</span>
        {showSnippet ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {showSnippet && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          <pre className="text-[10px] font-mono bg-input/60 rounded-xl p-3 overflow-x-auto text-muted-foreground whitespace-pre-wrap break-all">
            {curlSnippet}
          </pre>
        </motion.div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border/50">
        <span className="text-[10px] text-muted-foreground">Added {formatDate(site.createdAt)}</span>
        {deletingConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-destructive">Confirm?</span>
            <button onClick={() => onDelete(site.id)}
              className="text-[10px] font-semibold text-destructive hover:underline">Yes</button>
            <button onClick={() => setDeletingConfirm(false)}
              className="text-[10px] text-muted-foreground hover:underline">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setDeletingConfirm(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
            <Trash2 className="w-3 h-3" /> Remove
          </button>
        )}
      </div>
    </div>
  )
}
