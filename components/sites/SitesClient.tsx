'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Plus, Search } from 'lucide-react'
import { SiteCard } from './SiteCard'
import { AddSiteModal } from './AddSiteModal'
import { useToast } from '@/hooks/use-toast'

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

export function SitesClient({ initialSites }: { initialSites: Site[] }) {
  const { toast } = useToast()
  const [sites, setSites] = useState(initialSites)
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = sites.filter(
    s => s.name.toLowerCase().includes(search.toLowerCase()) || s.url.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id: string) {
    const res = await fetch(`/api/sites/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setSites(prev => prev.filter(s => s.id !== id))
      toast({ title: 'Site removed', description: 'The site has been disconnected.' })
    } else {
      toast({ title: 'Error', description: 'Failed to remove site.', variant: 'destructive' })
    }
  }

  async function handleRegenerateKey(id: string) {
    const res = await fetch(`/api/sites/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regenerateKey: true }),
    })
    if (res.ok) {
      const updated = await res.json()
      setSites(prev => prev.map(s => s.id === id ? { ...s, apiKey: updated.apiKey } : s))
      toast({ title: 'API key regenerated', description: 'The old key is now invalid.' })
    } else {
      toast({ title: 'Error', description: 'Failed to regenerate key.', variant: 'destructive' })
    }
  }

  function handleAdded(site: Site) {
    setSites(prev => [site, ...prev])
    setShowAdd(false)
    toast({ title: 'Site connected! 🎉', description: `${site.name} is now linked to MellyOS.` })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe className="w-6 h-6 text-brand-400" />
            Connected Sites
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your websites and their API integrations.
          </p>
        </div>
        <button
          id="add-site-btn"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
          style={{ background: 'linear-gradient(135deg, #4d79ff 0%, #a855f7 100%)' }}
        >
          <Plus className="w-4 h-4" /> Add Site
        </button>
      </div>

      {/* Search */}
      {sites.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sites..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-input/50 border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/15 transition-all"
          />
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl border border-border p-16 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(77,121,255,0.1)', border: '1px solid rgba(77,121,255,0.2)' }}>
            <Globe className="w-8 h-8 text-brand-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {search ? 'No sites match your search' : 'No sites connected yet'}
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            {search
              ? 'Try a different search term.'
              : 'Connect your first website to start receiving real-time notifications and orders.'}
          </p>
          {!search && (
            <button
              onClick={() => setShowAdd(true)}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #4d79ff 0%, #a855f7 100%)' }}
            >
              Connect your first site
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((site, i) => (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <SiteCard
                  site={site}
                  onDelete={handleDelete}
                  onRegenerateKey={handleRegenerateKey}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AddSiteModal open={showAdd} onClose={() => setShowAdd(false)} onAdded={handleAdded} />
    </div>
  )
}
