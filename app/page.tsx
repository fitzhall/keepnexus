'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import { Button, GlassPanel } from '@/components/ui'
import { LiquidLoader } from '@/components/animations/liquid-loader'
import { ArrowRight, Shield, FileText, Users, Calendar, Sparkles } from 'lucide-react'

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: Implement Supabase integration
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    setEmail('')
  }

  const features = [
    {
      icon: Shield,
      title: 'Keep it Secure',
      description: 'Auto-rotating multisig with Shamir secret sharing',
      color: 'text-primary',
      delay: 0.1,
    },
    {
      icon: FileText,
      title: 'Establish Legal Protection',
      description: 'Revocable living trusts generated instantly',
      color: 'text-secondary',
      delay: 0.2,
    },
    {
      icon: Users,
      title: 'Ensure Access',
      description: 'Heir education and inheritance drills',
      color: 'text-success',
      delay: 0.3,
    },
    {
      icon: Calendar,
      title: 'Plan for the Future',
      description: 'Automated CPA reports and regulatory monitoring',
      color: 'text-warning',
      delay: 0.4,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          {/* Floating orbs in background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
          </div>

          {/* Logo/Brand */}
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2">
              <Sparkles className="w-10 h-10 text-primary" />
              <h1 className="text-5xl font-bold gradient-text">KeepNexus</h1>
            </div>
          </m.div>

          {/* Tagline */}
          <m.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl md:text-3xl font-light text-text-secondary mb-6"
          >
            The 9-minute Bitcoin Governance OS
          </m.h2>

          {/* Main value prop */}
          <m.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-text-muted max-w-3xl mx-auto mb-12"
          >
            Turn any Bitcoin stack into a self-driving trust that texts your heirs,
            your lawyer, and your CPA—automatically.
          </m.p>

          {/* Threat Score Display */}
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12"
          >
            <GlassPanel variant="card" className="inline-block px-8 py-6" glow>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-text-muted mb-1">Your Threat Score</p>
                  <p className="text-5xl font-bold gradient-text threat-pulse">0</p>
                </div>
                <div className="w-px h-16 bg-dark-border" />
                <div className="text-left">
                  <p className="text-sm text-success flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    All Systems Secure
                  </p>
                  <p className="text-xs text-text-muted mt-1">Real-time monitoring active</p>
                </div>
              </div>
            </GlassPanel>
          </m.div>

          {/* Waitlist Form */}
          <m.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onSubmit={handleWaitlist}
            className="max-w-md mx-auto mb-16"
          >
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 bg-glass-white backdrop-blur-md border border-glass-light rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 focus:shadow-glow-sm transition-all"
                required
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                glow
                loading={isLoading}
              >
                {isLoading ? <LiquidLoader size="sm" /> : (
                  <>
                    Join Waitlist
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-text-muted mt-3">
              Be among the first 500 to secure your Bitcoin legacy
            </p>
          </m.form>

          {/* KEEP Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <m.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: feature.delay + 0.5 }}
              >
                <GlassPanel
                  variant="card"
                  hover
                  className="h-full text-center group"
                >
                  <feature.icon className={`w-12 h-12 mx-auto mb-4 ${feature.color} group-hover:scale-110 transition-transform`} />
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-muted">
                    {feature.description}
                  </p>
                </GlassPanel>
              </m.div>
            ))}
          </div>

          {/* Stats */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div>
              <p className="text-3xl font-bold gradient-text">9 min</p>
              <p className="text-sm text-text-muted">Setup Time</p>
            </div>
            <div>
              <p className="text-3xl font-bold gradient-text">$99/yr</p>
              <p className="text-sm text-text-muted">Starting Price</p>
            </div>
            <div>
              <p className="text-3xl font-bold gradient-text">100%</p>
              <p className="text-sm text-text-muted">Automated</p>
            </div>
          </m.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-text-muted">
            © 2025 KeepNexus. Building the future of Bitcoin inheritance.
          </p>
        </div>
      </footer>
    </div>
  )
}