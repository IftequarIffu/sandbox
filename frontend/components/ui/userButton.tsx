"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "@/lib/types"
import { useClerk } from "@clerk/nextjs"
import { LogOut, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"

export default function UserButton({ userData }: { userData: User }) {
  if (!userData) return null

  const { signOut } = useClerk()
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="w-9 h-9 font-mono rounded-full overflow-hidden bg-gradient-to-t from-neutral-800 to-neutral-600 flex items-center justify-center text-sm font-medium">
          {userData.name
            .split(" ")
            .slice(0, 2)
            .map((name) => name[0].toUpperCase())}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="cursor-pointer">
          <Pencil className="mr-2 h-4 w-4" />
          <span>Edit Profile</span>
          {/* open modal with name and email (disabled) */}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut(() => router.push("/"))}
          className="!text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
