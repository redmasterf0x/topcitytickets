"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserRoleSelectorProps {
  currentRole: "user" | "seller" | "admin"
  onRoleChange: (role: "user" | "seller" | "admin") => void
}

export function UserRoleSelector({ currentRole, onRoleChange }: UserRoleSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400">Demo Mode:</span>
      <Select value={currentRole} onValueChange={(value) => onRoleChange(value as "user" | "seller" | "admin")}>
        <SelectTrigger className="w-[180px] border-gray-700 bg-gray-800 text-white">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent className="border-gray-700 bg-gray-800 text-white">
          <SelectItem value="user">User Role</SelectItem>
          <SelectItem value="seller">Seller Role</SelectItem>
          <SelectItem value="admin">Admin Role</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
