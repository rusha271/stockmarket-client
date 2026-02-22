'use client';

import { redirect } from 'next/navigation';

export default function SignupPage() {
  // Redirect to the main auth page with signup tab
  redirect('/login?tab=1');
}
