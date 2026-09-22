import { Link } from 'react-router-dom'
import { Compass, Heart, Shield, Sparkles } from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="border-t border-border/80 bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                <Compass className="size-4" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Re<span className="text-primary">Find</span>
              </span>
            </Link>
            <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
              Bangladesh’s nationwide lost-and-found community recovery platform. Empowering
              citizens with privacy-preserving verification, automated matching, and rapid recovery
              across all 64 districts.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="size-3.5 text-primary" />
                Zero-Knowledge Privacy
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="size-3.5 text-emerald-500" />
                Smart Matching
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Directory
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/items" className="hover:text-primary transition-colors">
                  All Items
                </Link>
              </li>
              <li>
                <Link to="/items?type=LOST" className="hover:text-amber-500 transition-colors">
                  Lost Items
                </Link>
              </li>
              <li>
                <Link to="/items?type=FOUND" className="hover:text-emerald-500 transition-colors">
                  Found Items
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-primary transition-colors">
                  Report Item
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Account & Legal
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/login" className="hover:text-primary transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-primary transition-colors">
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ReFind Bangladesh. Built with trust and care.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            Made with <Heart className="size-3 text-red-500 fill-red-500" /> for Bangladesh
          </p>
        </div>
      </div>
    </footer>
  )
}
