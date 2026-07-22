'use client';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '../../lib/supabase/browser';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    setState('sending');
    setMessage('');
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setState('idle');
      setMessage(error.message);
      return;
    }
    setState('sent');
    setMessage('Check your inbox for the sign-in link.');
  }

  return (
    <form className="login-form" onSubmit={submit}>
      <label htmlFor="email">Approved email</label>
      <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vera@…" />
      <button type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send magic link'}</button>
      {message ? <p className={`form-message ${state}`}>{message}</p> : null}
    </form>
  );
}
