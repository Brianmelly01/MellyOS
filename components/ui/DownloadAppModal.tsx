'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone, Monitor, Apple } from 'lucide-react'
import Image from 'next/image'

interface DownloadAppModalProps {
  open: boolean
  onClose: () => void
}

export default function DownloadAppModal({ open, onClose }: DownloadAppModalProps) {
  const router = useRouter()

  function handleDownload() {
    // Trigger file download
    const link = document.createElement('a')
    link.href = '/MellyOS-app.txt'
    link.download = 'MellyOS-app.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Navigate to dashboard after a short delay
    setTimeout(() => {
      router.push('/dashboard')
      router.refresh()
    }, 800)
  }

  function handleCancel() {
    onClose()
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
            onClick={handleCancel}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-sm pointer-events-auto rounded-2xl border border-border overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #0f1117 0%, #13151f 100%)',
                boxShadow: '0 0 0 1px rgba(77,121,255,0.12), 0 32px 64px -16px rgba(0,0,0,0.8)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Top gradient bar */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, #4d79ff, #a855f7, transparent)' }}
              />

              {/* Close button */}
              <button
                id="download-modal-close"
                onClick={handleCancel}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-8 text-center">
                {/* Logo + glow */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div
                    className="absolute w-24 h-24 rounded-full blur-2xl opacity-30"
                    style={{ background: 'radial-gradient(circle, #4d79ff, #a855f7)' }}
                  />
                  <div className="relative w-16 h-16 rounded-2xl border border-border overflow-hidden flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #1a1d2e, #0d0f18)' }}>
                    <Image src="/logo.png" alt="MellyOS" width={48} height={48} className="object-contain" />
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mb-1">Get the MellyOS App</h2>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Access your dashboard on any device.<br />Manage sites and notifications on the go.
                </p>

                {/* Platform icons */}
                <div className="flex justify-center gap-6 mb-7">
                  {[
                    { Icon: Monitor, label: 'Desktop' },
                    { Icon: Smartphone, label: 'Android' },
                    { Icon: Apple, label: 'iOS' },
                  ].map(({ Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5">
                      <div className="w-10 h-10 rounded-xl border border-border flex items-center justify-center"
                        style={{ background: 'rgba(77,121,255,0.08)' }}>
                        <Icon className="w-5 h-5" style={{ color: '#4d79ff' }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    id="download-app-btn"
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #4d79ff 0%, #a855f7 100%)' }}
                  >
                    <Download className="w-4 h-4" />
                    Download App
                  </button>

                  <button
                    id="download-modal-cancel"
                    onClick={handleCancel}
                    className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-muted-foreground border border-border hover:text-foreground hover:border-brand-400/30 hover:bg-white/3 transition-all duration-200"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
