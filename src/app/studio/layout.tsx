import { isAuthenticated } from '@/app/login/actions/auth';
import { redirect } from 'next/navigation';

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const isAuth = await isAuthenticated();

  if (!isAuth) {
    redirect('/login');
  }

  return <>{children}</>;
}
