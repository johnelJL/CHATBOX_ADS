import { Metadata } from 'next';

import { CreateListingWizard } from '@/components/create-listing-wizard';
import { DashboardShell } from '@/components/dashboard-shell';

export const metadata: Metadata = {
  title: 'Create listing – ClassifAI Cars'
};

export default function CreateListingPage() {
  return (
    <DashboardShell title="Create listing">
      <CreateListingWizard />
    </DashboardShell>
  );
}
