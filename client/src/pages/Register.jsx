import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

/* ─── SVG Icons ────────────────────────────────────────────── */
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ─── Password Strength ─────────────────────────────────────── */
const getStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score; // 0-4
};
const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["", "bg-red-500", "bg-amber-500", "bg-yellow-400", "bg-emerald-500"];
const strengthTextColor = ["", "text-red-400", "text-amber-400", "text-yellow-400", "text-emerald-400"];

/* ─── Component ─────────────────────────────────────────────── */
function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [agreed, setAgreed] = useState(false);

  const strength = getStrength(form.password);

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    else if (form.name.trim().length < 2) e.name = "Name too short.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 6) e.password = "At least 6 characters required.";
    if (!form.confirm) e.confirm = "Please confirm your password.";
    else if (form.confirm !== form.password) e.confirm = "Passwords do not match.";
    if (!agreed) e.agreed = "You must agree to the terms.";
    return e;
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Submit ── */
  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      showToast("success", "Account created! Redirecting to login…");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: "" }));
  };

  /* ── Password requirements ── */
  const reqs = [
    { label: "At least 6 characters", met: form.password.length >= 6 },
    { label: "Uppercase letter",       met: /[A-Z]/.test(form.password) },
    { label: "Number",                  met: /[0-9]/.test(form.password) },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#080b14] px-4 py-8 overflow-hidden">

      {/* ── Animated Background Orbs ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[130px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse [animation-delay:1.5s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-pink-600/10 blur-[100px] animate-pulse [animation-delay:0.75s]" />
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl text-sm font-medium transition-all animate-[fadeInDown_0.4s_ease] ${
          toast.type === "success"
            ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
            : "bg-red-500/20 border border-red-500/40 text-red-300"
        }`}>
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.msg}
        </div>
      )}

      {/* ── Card ── */}
      <div className="relative w-full max-w-md animate-[fadeInUp_0.5s_ease]">

        {/* Glow border */}
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-purple-500/30 via-indigo-500/20 to-pink-500/20 blur-sm" />

        <div className="relative rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 p-7 sm:p-9 shadow-2xl">

          {/* Logo / Brand */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-1 tracking-tight">
            Create your account
          </h1>
          <p className="text-gray-400 text-center mb-7 text-sm">
            Join thousands of people already using the platform
          </p>

          <form onSubmit={handleRegister} noValidate className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                Full Name
              </label>
              <div className={`flex items-center rounded-xl border transition-all duration-200 ${
                errors.name
                  ? "border-red-500/60 bg-red-500/5"
                  : "border-white/10 bg-white/5 focus-within:border-purple-500/60 focus-within:bg-purple-500/5"
              }`}>
                <span className="pl-3.5 text-gray-400"><UserIcon /></span>
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange("name")}
                  className="flex-1 py-3 px-3 text-white placeholder-gray-500 text-sm focus:outline-none"
                  style={{ background: 'transparent' }}
                />
              </div>
              {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                Email
              </label>
              <div className={`flex items-center rounded-xl border transition-all duration-200 ${
                errors.email
                  ? "border-red-500/60 bg-red-500/5"
                  : "border-white/10 bg-white/5 focus-within:border-purple-500/60 focus-within:bg-purple-500/5"
              }`}>
                <span className="pl-3.5 text-gray-400"><MailIcon /></span>
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange("email")}
                  className="flex-1 py-3 px-3 text-white placeholder-gray-500 text-sm focus:outline-none"
                  style={{ background: 'transparent' }}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className={`flex items-center rounded-xl border transition-all duration-200 ${
                errors.password
                  ? "border-red-500/60 bg-red-500/5"
                  : "border-white/10 bg-white/5 focus-within:border-purple-500/60 focus-within:bg-purple-500/5"
              }`}>
                <span className="pl-3.5 text-gray-400"><LockIcon /></span>
                <input
                  id="register-password"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange("password")}
                  className="flex-1 py-3 px-3 text-white placeholder-gray-500 text-sm focus:outline-none"
                  style={{ background: 'transparent' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="pr-3.5 text-gray-400 hover:text-purple-400 transition-colors"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}

              {/* Strength bar */}
              {form.password && (
                <div className="mt-2.5">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength ? strengthColor[strength] : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strengthTextColor[strength]}`}>
                    {strengthLabel[strength]} password
                  </p>
                </div>
              )}

              {/* Requirements */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  {reqs.map((r) => (
                    <div key={r.label} className={`flex items-center gap-1.5 text-xs transition-colors ${r.met ? "text-emerald-400" : "text-gray-500"}`}>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${r.met ? "bg-emerald-500" : "bg-white/10"}`}>
                        {r.met && <CheckIcon />}
                      </div>
                      {r.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                Confirm Password
              </label>
              <div className={`flex items-center rounded-xl border transition-all duration-200 ${
                errors.confirm
                  ? "border-red-500/60 bg-red-500/5"
                  : form.confirm && form.confirm === form.password
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-white/10 bg-white/5 focus-within:border-purple-500/60 focus-within:bg-purple-500/5"
              }`}>
                <span className="pl-3.5 text-gray-400"><LockIcon /></span>
                <input
                  id="register-confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={handleChange("confirm")}
                  className="flex-1 py-3 px-3 text-white placeholder-gray-500 text-sm focus:outline-none"
                  style={{ background: 'transparent' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="pr-3.5 text-gray-400 hover:text-purple-400 transition-colors"
                  tabIndex={-1}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.confirm && <p className="mt-1.5 text-xs text-red-400">{errors.confirm}</p>}
              {form.confirm && form.confirm === form.password && !errors.confirm && (
                <p className="mt-1.5 text-xs text-emerald-400">✓ Passwords match</p>
              )}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer group" id="register-terms-label">
                <div
                  onClick={() => { setAgreed((v) => !v); if (errors.agreed) setErrors((e) => ({ ...e, agreed: "" })); }}
                  className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    agreed
                      ? "bg-gradient-to-br from-purple-500 to-pink-500 border-transparent"
                      : "border-white/20 bg-white/5 group-hover:border-purple-400"
                  }`}
                >
                  {agreed && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-400 leading-relaxed">
                  I agree to the{" "}
                  <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Terms of Service</span>
                  {" "}and{" "}
                  <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Privacy Policy</span>
                </span>
              </label>
              {errors.agreed && <p className="mt-1.5 text-xs text-red-400">{errors.agreed}</p>}
            </div>

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
                  </svg>
                  Creating account…
                </>
              ) : (
                "Create Account →"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Footer */}
          <p className="text-gray-400 text-center text-sm">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-purple-400 font-semibold hover:text-purple-300 transition-colors"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-15px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Register;