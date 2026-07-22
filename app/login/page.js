import { LoginForm } from './login-form';

export const metadata = { title: 'Sign in — Vera' };

export default function LoginPage() {
  return (
    <main className="login-shell">
      <section className="login-panel">
        <p className="eyebrow">VERA / REVIEW DESK</p>
        <h1>Every good listing starts with a human eye.</h1>
        <p className="lede">Sign in with your approved email to review newly discovered events before they reach the platform.</p>
        <LoginForm />
      </section>
      <aside className="login-aside" aria-hidden="true">
        <span>✦</span><span>◇</span><span>✦</span>
        <p>DISCOVER<br />DISCERN<br />DELIGHT</p>
      </aside>
    </main>
  );
}
