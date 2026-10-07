'use client'

import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, KeyRound } from 'lucide-react'
import { logout } from '@/app/(auth)/actions'
import { ChangePasswordModal } from '@/components/auth/change-password-modal'

export function UserDropdown({ profile }: { profile: any }) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <User className="h-5 w-5 text-gray-700" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile.email}
                </p>
                <p className="text-xs font-semibold mt-1">Role: {profile.role}</p>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {
            setIsPasswordModalOpen(true)
          }} className="cursor-pointer">
            <KeyRound className="mr-2 h-4 w-4" />
            <span>Change Password</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0">
            <form action={logout} className="w-full">
              <button type="submit" className="flex w-full items-center px-2 py-1.5 text-red-600 text-sm cursor-pointer hover:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordModal isOpen={isPasswordModalOpen} setIsOpen={setIsPasswordModalOpen} />
    </>
  )
}
