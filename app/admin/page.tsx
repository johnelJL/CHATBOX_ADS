import { AdminModerationTable } from '@/components/admin/moderation-table';
import { DashboardShell } from '@/components/dashboard-shell';

export default function AdminPage() {
  return (
    <DashboardShell title="Moderation queue">
      <AdminModerationTable />
    </DashboardShell>
  );
}
