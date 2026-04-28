import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Lauren Conversations — Admin',
  robots: 'noindex',
};

// Replaced by DCC's Lauren Control Center. The query param tells DCC
// to auto-open the modal on mount; LaurenAdmin.tsx + the matching
// /api/admin/lauren/* routes are now unused and can be deleted in a
// follow-up commit once nobody complains about the new flow.
export default function LaurenAdminPage() {
  redirect('https://app.refundlocators.com/?openLauren=1');
}
