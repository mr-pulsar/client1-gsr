import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store';
import { useNavigate } from 'react-router-dom';

const SHARED_PASSWORD = 'GSR123!';
const LOCAL_USER_ID = '000000000000000000000001';

export default function AuthPage() {
  const [form, setForm] = useState({ password: '' });
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      if (String(form.password || '').trim() !== SHARED_PASSWORD) {
        throw new Error('Authentication failed');
      }

      dispatch(
        setCredentials({
          token: 'local-password-token',
          user: { id: LOCAL_USER_ID, _id: LOCAL_USER_ID, name: 'GSR Admin', role: 'admin' },
        }),
      );
      navigate('/');
    } catch (submissionError) {
      setError(submissionError.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-full grid place-items-center p-3 sm:p-4 pb-10">
      <motion.form
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={submit}
        className="glass w-full max-w-md rounded-[1.5rem] p-5 shadow-soft sm:rounded-[2rem] sm:p-8"
      >
        <div className="text-xs tracking-wide text-brand-100">Courier Studio</div>
        <h1 className="mt-2 text-3xl font-bold text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Enter the password to continue.</p>

        <div className="mt-6 space-y-4">
          <input
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-brand-500"
            placeholder="Password"
            type="password"
            autoComplete="current-password"
            spellCheck={false}
            required
            minLength={1}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {error && <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        <button className="mt-6 w-full rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white shadow-soft hover:bg-brand-500">
          Sign In
        </button>

        <footer className="mt-6 text-center text-[10px] tracking-wide text-slate-400">Developed By Lunar Fox AI</footer>
      </motion.form>
    </div>
  );
}