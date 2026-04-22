import DashboardLayout from '@/components/layout/dashboard-layout';
import Page from './page';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
