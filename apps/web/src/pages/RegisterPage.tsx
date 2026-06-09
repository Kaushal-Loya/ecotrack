import { useState, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { AxiosError } from 'axios';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const formId = useId();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (password !== confirm) {
      setFieldErrors({ confirm: ['Passwords do not match'] });
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name || undefined);
      navigate('/onboarding');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const data = err.response?.data;
        if (data?.errors) setFieldErrors(data.errors as Record<string, string[]>);
        else setError(data?.message ?? 'Registration failed');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <span className="text-5xl" aria-hidden="true">🌿</span>
          <h1 className="mt-3 font-display text-3xl font-bold text-gray-100">EcoTrack</h1>
          <p className="mt-1 text-sm text-gray-500">Create your free account</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-100 mb-6">Create account</h2>

          <form id={`${formId}-register`} onSubmit={handleSubmit} noValidate aria-label="Registration form">
            {/* Name */}
            <div className="mb-4">
              <label htmlFor={`${formId}-name`} className="label">
                Display name <span className="text-gray-600">(optional)</span>
              </label>
              <input
                id={`${formId}-name`}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Jane Smith"
                autoComplete="name"
                maxLength={100}
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor={`${formId}-email`} className="label">
                Email address <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id={`${formId}-email`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`input ${fieldErrors.email ? 'border-red-600' : ''}`}
                placeholder="you@example.com"
                required
                autoComplete="email"
                aria-required="true"
                aria-describedby={fieldErrors.email ? `${formId}-email-error` : undefined}
              />
              {fieldErrors.email && (
                <p id={`${formId}-email-error`} className="error-msg">
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor={`${formId}-password`} className="label">
                Password <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id={`${formId}-password`}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`input ${fieldErrors.password ? 'border-red-600' : ''}`}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                required
                autoComplete="new-password"
                aria-required="true"
                aria-describedby={`${formId}-pw-hint ${fieldErrors.password ? `${formId}-pw-error` : ''}`}
              />
              <p id={`${formId}-pw-hint`} className="mt-1 text-xs text-gray-600">
                At least 8 characters, one uppercase letter, one number
              </p>
              {fieldErrors.password && (
                <p id={`${formId}-pw-error`} className="error-msg">
                  {fieldErrors.password[0]}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div className="mb-6">
              <label htmlFor={`${formId}-confirm`} className="label">
                Confirm password <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id={`${formId}-confirm`}
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`input ${fieldErrors.confirm ? 'border-red-600' : ''}`}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                aria-required="true"
              />
              {fieldErrors.confirm && (
                <p role="alert" className="error-msg">
                  {fieldErrors.confirm[0]}
                </p>
              )}
            </div>

            {error && (
              <p role="alert" className="error-msg mb-4">
                {error}
              </p>
            )}

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full mb-4"
              aria-busy={loading}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-forest-400 hover:text-forest-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
