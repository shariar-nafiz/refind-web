import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Compass,
  LogOut,
  MapPin,
  Menu,
  PlusCircle,
  Search,
  Settings,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react'
import { authApi } from '@/api/auth.api'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useAuthStore } from '@/store/useAuthStore'

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await authApi.logout()
    logout()
    navigate('/')
  }

  const userInitials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
            <Compass className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-foreground">
              Re<span className="text-primary">Find</span>
            </span>
            <span className="text-[10px] -mt-1 font-medium text-muted-foreground uppercase tracking-wider">
              Bangladesh
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/items"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <Search className="size-4" />
            Explore Items
          </Link>
          <Link
            to="/items?type=LOST"
            className="text-sm font-medium text-muted-foreground hover:text-amber-600 transition-colors"
          >
            Lost
          </Link>
          <Link
            to="/items?type=FOUND"
            className="text-sm font-medium text-muted-foreground hover:text-emerald-600 transition-colors"
          >
            Found
          </Link>
          {user?.role === 'ROLE_ADMIN' && (
            <Link
              to="/admin"
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              <ShieldCheck className="size-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* Right Section Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />

          {/* Report Item CTA */}
          <Button asChild className="gap-1.5 font-medium shadow-xs">
            <Link to="/report">
              <PlusCircle className="size-4" />
              Report Item
            </Link>
          </Button>

          {/* User Auth state */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative size-9 rounded-full p-0">
                  <Avatar className="size-9 border border-border">
                    {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName} />}
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-foreground truncate">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <UserIcon className="mr-2 size-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard/my-items')}>
                    <Compass className="mr-2 size-4" />
                    <span>My Reports</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard/addresses')}>
                    <MapPin className="mr-2 size-4" />
                    <span>Saved Addresses</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                    <Settings className="mr-2 size-4" />
                    <span>Preferences</span>
                  </DropdownMenuItem>
                  {user.role === 'ROLE_ADMIN' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <ShieldCheck className="mr-2 size-4 text-primary" />
                      <span>Admin Console</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild size="sm">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button variant="outline" asChild size="sm">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9">
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-2 text-lg font-bold">
                  <Compass className="size-5 text-primary" />
                  ReFind Bangladesh
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-4 mt-6">
                <Button asChild className="w-full gap-2">
                  <Link to="/report" onClick={() => setMobileOpen(false)}>
                    <PlusCircle className="size-4" />
                    Report Lost or Found
                  </Link>
                </Button>

                <div className="flex flex-col gap-2 border-t border-border pt-4">
                  <Link
                    to="/items"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 py-2 text-sm font-medium text-foreground hover:text-primary"
                  >
                    <Search className="size-4" />
                    Explore Directory
                  </Link>
                  <Link
                    to="/items?type=LOST"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 py-2 text-sm font-medium text-amber-600"
                  >
                    Lost Items Feed
                  </Link>
                  <Link
                    to="/items?type=FOUND"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 py-2 text-sm font-medium text-emerald-600"
                  >
                    Found Items Feed
                  </Link>
                </div>

                <div className="flex flex-col gap-2 border-t border-border pt-4">
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-2 py-1">
                        <p className="text-sm font-semibold truncate">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="py-2 text-sm font-medium hover:text-primary"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/dashboard/my-items"
                        onClick={() => setMobileOpen(false)}
                        className="py-2 text-sm font-medium hover:text-primary"
                      >
                        My Reports
                      </Link>
                      <Link
                        to="/dashboard/addresses"
                        onClick={() => setMobileOpen(false)}
                        className="py-2 text-sm font-medium hover:text-primary"
                      >
                        Saved Addresses
                      </Link>
                      <Link
                        to="/dashboard/settings"
                        onClick={() => setMobileOpen(false)}
                        className="py-2 text-sm font-medium hover:text-primary"
                      >
                        Settings
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setMobileOpen(false)
                          handleLogout()
                        }}
                        className="mt-2 w-full gap-2"
                      >
                        <LogOut className="size-4" />
                        Log Out
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/login" onClick={() => setMobileOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link to="/register" onClick={() => setMobileOpen(false)}>
                          Create Account
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
