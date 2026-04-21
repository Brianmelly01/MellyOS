'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, User, Key, Globe, Loader2, Check, Copy, RefreshCw, Trash2 } from 'lucide-react'
import { maskApiKey } from '@/lib/api-key'
import { useToast } from '@/hooks/use-toast'

interface UserData { id: string; name: string; email: string; role: string }
interface Site { id: string; name: string; url: string; apiKey: string; isActive: boolean }

interface Props { user: UserData; sites: Site[] }

type Tab = 'profile' | 'sites' | 'api'

export function SettingsClient({ user, sites: initialSites }: Props) {
  const { toast } = useToast()
  const [tab, setTab] = useState<Tab>('profile')
  const [sites, setSites] = useState(initialSites)

  // Profile form
  const [profile, setProfile] = useState({ name: user.name, email: user.email })
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [savingProfile, setSavingProfile] = useState(false)

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    const body: Record<string, string> = { name: profile.name, email: profile.email }
    if (passwords.newPass) {
      if (passwords.newPass !== passwords.confirm) {
        toast({ title: 'Passwords do not match', variant: 'destructive' }); setSavingProfile(false); return
      }
      body.currentPassword = passwords.current
      body.newPassword = passwords.newPass
    }
    const res = await fetch('/api/profile', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    setSavingProfile(false)
    if (res.ok) {
      toast({ title: 'Profile updated ✓' })
      setPasswords({ current: '', newPass: '', confirm: '' })
    } else {
      const d = await res.json()
      toast({ title: d.error || 'Failed to update', variant: 'destructive' })
    }
  }

  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  async function copyKey(key: string) {
    await navigator.clipboard.writeText(key)
    setCopiedKey(key); setTimeout(() => setCopiedKey(null), 2000)
  }

  async function regenKey(id: string) {
    const res = await fetch(`/api/sites/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regenerateKey: true }),
    })
    if (res.ok) {
      const updated = await res.json()
      setSites(prev => prev.map(s => s.id === id ? { ...s, apiKey: updated.apiKey } : s))
      toast({ title: 'API key regenerated ✓', description: 'Old key is now invalid.' })
    }
  }

  const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'profile', icon: User,     label: 'Profile'      },
    { id: 'sites',   icon: Globe,    label: 'Sites & Keys' },
    { id: 'api',     icon: Key,      label: 'API Reference'},
  ]

  const inputClass = "w-full bg-input/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-400/60 focus:ring-2 focus:ring-brand-400/15 transition-all"

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-400" /> Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your profile, sites, and API integrations.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass border border-border rounded-2xl w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'text-foreground bg-accent' : 'text-muted-foreground hover:text-foreground'}`}
            style={tab === t.id ? { background: 'linear-gradient(135deg, rgba(77,121,255,0.15), rgba(168,85,247,0.08))', border: '1px solid rgba(77,121,255,0.2)', color: '#4d79ff' } : {}}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass border border-border rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#4d79ff,#a855f7)' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-400/10 text-brand-400 border border-brand-400/20">{user.role}</span>
            </div>
          </div>

          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Full Name</label>
                <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className={inputClass} placeholder="Your name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Email</label>
                <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  className={inputClass} placeholder="your@email.com" />
              </div>
            </div>

            <div className="border-t border-border/50 pt-4">
              <p className="text-sm font-semibold text-foreground mb-3">Change Password</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Current Password', key: 'current', val: passwords.current },
                  { label: 'New Password',     key: 'newPass', val: passwords.newPass },
                  { label: 'Confirm New',      key: 'confirm', val: passwords.confirm },
                ].map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">{f.label}</label>
                    <input type="password" value={f.val} placeholder="••••••••"
                      onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))}
                      className={inputClass} />
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={savingProfile}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #4d79ff 0%, #a855f7 100%)' }}>
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Changes
            </button>
          </form>
        </motion.div>
      )}

      {/* Sites & Keys Tab */}
      {tab === 'sites' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {sites.length === 0 ? (
            <div className="glass border border-border rounded-2xl p-10 text-center">
              <Globe className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No sites connected. Go to Sites to add one.</p>
            </div>
          ) : sites.map(site => (
            <div key={site.id} className="glass border border-border rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-400/10 border border-brand-400/20 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{site.name}</p>
                    <p className="text-xs text-muted-foreground">{site.url}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${site.isActive ? 'text-neon-green bg-neon-green/10' : 'text-muted-foreground bg-muted/30'}`}>
                  {site.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="bg-input/40 rounded-xl p-3 flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <code className="text-xs font-mono text-muted-foreground flex-1 truncate">{maskApiKey(site.apiKey)}</code>
                <button onClick={() => copyKey(site.apiKey)} className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground flex-shrink-0">
                  {copiedKey === site.apiKey ? <Check className="w-3.5 h-3.5 text-neon-green" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => regenKey(site.id)} className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-destructive flex-shrink-0">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* API Reference Tab */}
      {tab === 'api' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass border border-border rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="font-semibold text-foreground mb-1">API Reference</h2>
            <p className="text-sm text-muted-foreground">Use these endpoints to push data from your external sites into MellyOS.</p>
          </div>

          {[
            {
              method: 'POST', path: '/api/notify', label: 'Send Notification',
              description: 'Push a notification into MellyOS from any external site.',
              body: `{\n  "type": "ORDER" | "MESSAGE" | "DESIGN_REQUEST" | "CUSTOM",\n  "title": "New order received",\n  "body": "Order #1234 placed by John Doe",\n  "metadata": { "orderId": "1234" }\n}`,
            },
            {
              method: 'POST', path: '/api/orders', label: 'Submit Order',
              description: 'Record a new order from an external site. Also auto-creates a notification.',
              body: `{\n  "externalId": "ext-1234",\n  "customerName": "Jane Doe",\n  "customerEmail": "jane@example.com",\n  "amount": 4999,\n  "currency": "USD",\n  "status": "PENDING",\n  "metadata": { "items": 3 }\n}`,
            },
          ].map(ep => (
            <div key={ep.path} className="border border-border/60 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-accent/30 border-b border-border/40">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-neon-green/15 text-neon-green">{ep.method}</span>
                <code className="text-sm font-mono text-foreground">{ep.path}</code>
                <span className="text-xs text-muted-foreground ml-auto">{ep.label}</span>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground">{ep.description}</p>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Required header</p>
                  <code className="text-xs font-mono bg-input/60 rounded-lg px-3 py-1.5 block text-muted-foreground">
                    x-api-key: {'<your-site-api-key>'}
                  </code>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Request body</p>
                  <pre className="text-xs font-mono bg-input/60 rounded-lg px-3 py-2 text-muted-foreground overflow-x-auto">{ep.body}</pre>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
