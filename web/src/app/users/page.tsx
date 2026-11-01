import { UsersView } from '@/modules/users/components/users-view';
import { AppLayout } from '@/shared/layout/app-layout';

export default function UsersPage() {
  return (
    <AppLayout>
      <UsersView />
    </AppLayout>
  );
}
