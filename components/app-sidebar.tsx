"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import {
  IconDashboard,
  IconHelp,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Pill, User, Stethoscope, UserRoundPlus, Microscope, Building2 } from "lucide-react"

const navMain = [
  { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
  { title: "Create Patient", url: "/dashboard/create-patient", icon: UserRoundPlus },
  { title: "Patients", url: "/dashboard/patients", icon: User },
  { title: "Doctors", url: "/dashboard/doctors", icon: Stethoscope },
  { title: "Medications", url: "/dashboard/medications", icon: Pill },
  { title: "Diseases", url: "/dashboard/diseases", icon: Microscope },
]

const navSecondary = [
  { title: "Settings", url: "#", icon: IconSettings },
  { title: "Get Help", url: "#", icon: IconHelp },
  { title: "Search", url: "#", icon: IconSearch },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [hospitalInfo, setHospitalInfo] = useState({ name: "Hospital", userId: "" })

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hospitalInfo")
      if (stored) {
        setHospitalInfo(JSON.parse(stored))
      }
    } catch { }
  }, [])

  const user = {
    name: hospitalInfo.name,
    email: hospitalInfo.userId || "admin@alivepost.com",
    avatar: "/avatars/shadcn.jpg",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="text-base font-semibold truncate">{hospitalInfo.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
