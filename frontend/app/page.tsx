import { DashboardShell } from "@/components/dashboard-shell"
import { CalendarView } from "@/components/calendar-view"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <CalendarView />
    </DashboardShell>
  )
}
