import { DashboardView } from '@/modules/dashboard/components/dashboard-view';
import { AppLayout } from '@/shared/layout/app-layout';

export default function DashboardPage() {
  return (
    <AppLayout>
      <DashboardView />
    </AppLayout>
  );
}
