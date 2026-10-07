'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, History, Users, Settings, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'History', href: '/history', icon: History },
  { name: 'Team', href: '/admin/team', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <div className={cn("flex h-full w-64 flex-col border-r bg-white", className)}>
      <div className="flex h-16 items-center px-6 border-b">
        <span className="text-lg font-bold tracking-tight">AI365</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary border-r-4 border-primary" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-r-4 border-transparent"
              )}
            >
              <item.icon className={cn(
                "mr-3 h-5 w-5",
                isActive ? "text-primary" : "text-gray-400"
              )} />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
