import { ProfileView } from '@/modules/users/components/profile-view';
import { AppLayout } from '@/shared/layout/app-layout';

export default function ProfilePage() {
  return (
    <AppLayout>
      <ProfileView />
    </AppLayout>
  );
}
