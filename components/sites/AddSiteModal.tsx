'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Globe, Loader2, Link as LinkIcon, FileText } from 'lucide-react'

interface Site {
  id: string; name: string; url: string; description: string | null; apiKey: string
  isActive: boolean; createdAt: Date; _count: { notifications: number; orders: number }
}

interface Props {
  open: boolean
  onClose: () => void
  onAdded: (site: Site) => void
}

export function AddSiteModal({ open, onClose, onAdded }: Props) {
  const [form, setForm] = useState({ name: '', url: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to add site'); return }
      onAdded(data)
      setForm({ name: '', url: '', description: '' })
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  const inputClass = "w-full bg-input/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/15 transition-all"

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="glass border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border/50"
                style={{ background: 'linear-gradient(135deg, rgba(77,121,255,0.08) 0%, rgba(168,85,247,0.05) 100%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-400/15 border border-brand-400/25 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground text-sm">Connect a Site</h2>
                    <p className="text-xs text-muted-foreground">An API key will be generated automatically</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Site Name *</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input placeholder="e.g. Veltrixwear" value={form.name} onChange={update('name')} required className={inputClass} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">URL *</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="url" placeholder="https://veltrixwear.com" value={form.url} onChange={update('url')} required className={inputClass} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Description <span className="text-muted-foreground">(optional)</span></label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <textarea placeholder="What does this site do?" value={form.description} onChange={update('description')} rows={2}
                      className="w-full bg-input/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/15 transition-all resize-none" />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>
                )}

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                    Cancel
                  </button>
                  <button id="add-site-submit" type="submit" disabled={loading}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                    style={{ background: 'linear-gradient(135deg, #4d79ff 0%, #a855f7 100%)' }}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect Site'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
