import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to desk app - middleware will handle auth check
  redirect('/desk');
}
