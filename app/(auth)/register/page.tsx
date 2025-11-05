import { AuthForm } from '@/components/auth-form';
import { AuthLayout } from '@/components/auth-layout';

export default function RegisterPage() {
  return (
    <AuthLayout title="Create an account" subtitle="Join ClassifAI Cars">
      <AuthForm mode="register" />
    </AuthLayout>
  );
}
