import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Users, Clapperboard, Bell } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-primary text-primary">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 md:px-8 bg-primary/80 backdrop-blur-md border-b border-border-default">
        <span className="text-xl font-bold text-primary tracking-tight">AceVerse</span>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-secondary hover:text-primary transition-colors rounded-full"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-full font-medium bg-accent text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-accent/30"
          >
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 md:px-8 overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -20%, var(--color-accent) 0%, transparent 50%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary tracking-tight">
            Your gaming universe.
            <br />
            <span className="text-accent">
              One feed.
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-secondary max-w-2xl mx-auto">
            Share clips, track ranks, and stay connected with your squad. Built for gamers.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold bg-accent text-white transition-all hover:opacity-90 shadow-lg hover:shadow-accent/40"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-medium border border-border-default text-secondary hover:border-accent hover:text-accent transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Feature sections with scroll-triggered animations */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto space-y-24">
          <div className="scroll-animate opacity-0 translate-y-8">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center bg-accent/10 text-accent">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-primary">Track Your Ranks</h3>
                <p className="mt-2 text-secondary">
                  Link your games and display your rank badges—Immortal, Global Elite, Master—right on your profile and in the feed.
                </p>
              </div>
            </div>
          </div>

          <div className="scroll-animate opacity-0 translate-y-8">
            <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-12">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center bg-accent/10 text-accent">
                <Clapperboard className="w-8 h-8" />
              </div>
              <div className="md:text-right">
                <h3 className="text-2xl font-bold text-primary">Share Your Clips</h3>
                <p className="mt-2 text-secondary">
                  Post highlights, discuss meta, and tag your game. Embed clips and let your feed speak for your grind.
                </p>
              </div>
            </div>
          </div>

          <div className="scroll-animate opacity-0 translate-y-8">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center bg-accent/10 text-accent">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-primary">Find Your Squad</h3>
                <p className="mt-2 text-secondary">
                  Follow your favorite players, see who's online, and get suggested accounts so you never miss a duo.
                </p>
              </div>
            </div>
          </div>

          <div className="scroll-animate opacity-0 translate-y-8">
            <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-12">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center bg-accent/10 text-accent">
                <Bell className="w-8 h-8" />
              </div>
              <div className="md:text-right">
                <h3 className="text-2xl font-bold text-primary">Stay in the Loop</h3>
                <p className="mt-2 text-secondary">
                  Get notified when someone likes, replies, reposts, or follows you. Never miss a moment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof / stats */}
      <section className="py-20 px-4 md:px-8 border-t border-border-default">
        <div className="max-w-4xl mx-auto">
          <div className="scroll-animate opacity-0 translate-y-8 text-center">
            <p className="text-secondary text-lg">Join gamers who already post here</p>
            <div className="mt-8 flex flex-wrap justify-center gap-12 md:gap-16">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary">50K+</div>
                <div className="text-sm text-tertiary">Gamers</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary">1M+</div>
                <div className="text-sm text-tertiary">Clips shared</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary">7</div>
                <div className="text-sm text-tertiary">Games supported</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-3xl mx-auto rounded-3xl p-8 md:p-12 text-center scroll-animate opacity-0 translate-y-8 bg-accent/10 border border-accent/20">
          <h2 className="text-2xl md:text-3xl font-bold text-primary">Ready to join?</h2>
          <p className="mt-2 text-secondary">Create your account and start posting in under a minute.</p>
          <Link
            to="/register"
            className="inline-block mt-6 px-8 py-4 rounded-full font-semibold bg-accent text-white transition-all hover:opacity-90"
          >
            Sign up for AceVerse
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 border-t border-border-default">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-tertiary text-sm">© AceVerse. For gamers.</span>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <a href="#" className="text-tertiary hover:text-accent transition-colors">About</a>
            <a href="#" className="text-tertiary hover:text-accent transition-colors">Help</a>
            <a href="#" className="text-tertiary hover:text-accent transition-colors">Terms</a>
            <a href="#" className="text-tertiary hover:text-accent transition-colors">Privacy</a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .scroll-animate {
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .scroll-animate.visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
      <ScrollAnimations />
    </div>
  )
}

function ScrollAnimations() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.scroll-animate').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return null
}
