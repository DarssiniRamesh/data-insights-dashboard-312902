import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faAt,
  faChartLine,
  faCircleCheck,
  faCircleNotch,
  faEye,
  faEyeSlash,
  faLock,
  faUser,
  faUserPlus
} from "@fortawesome/free-solid-svg-icons";
import styles from "./AuthPage.module.css";

/**
 * Small helper for simulated async actions to make the UI feel realistic
 * without needing backend wiring for this task.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// PUBLIC_INTERFACE
function AuthPage() {
  /** Two-panel authentication UI (Sign In / Sign Up) with animated transitions. */
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const [signin, setSignin] = useState({ email: "", password: "", showPw: false });
  const [signup, setSignup] = useState({
    name: "",
    email: "",
    password: "",
    showPw: false,
    agree: true
  });

  const modeLabel = useMemo(() => (mode === "signin" ? "Sign in" : "Create account"), [mode]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setToast(null);

    // Minimal front-end validations for a polished UX.
    try {
      if (mode === "signin") {
        if (!signin.email.trim() || !signin.password) {
          setToast({ type: "error", message: "Please enter your email and password." });
          return;
        }
        await sleep(900);
        setToast({ type: "success", message: "Signed in (demo). Connect this to your API next." });
      } else {
        if (!signup.name.trim() || !signup.email.trim() || !signup.password) {
          setToast({ type: "error", message: "Please fill in all fields to create an account." });
          return;
        }
        if (!signup.agree) {
          setToast({ type: "error", message: "Please accept the terms to continue." });
          return;
        }
        await sleep(1100);
        setToast({ type: "success", message: "Account created (demo). You can now sign in." });
        setMode("signin");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgDecor} aria-hidden="true" />
      <main className={styles.shell}>
        <section className={styles.brandBar} aria-label="Brand">
          <div className={styles.brandMark} aria-hidden="true">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className={styles.brandText}>
            <div className={styles.brandName}>Data Insights</div>
            <div className={styles.brandTag}>Upload datasets. Visualize. Report.</div>
          </div>
        </section>

        <section
          className={`${styles.card} ${mode === "signup" ? styles.isSignup : styles.isSignin}`}
          aria-label="Authentication"
        >
          {/* Left: Forms */}
          <div className={styles.formsPane}>
            <div className={styles.formsViewport}>
              {/* Sign In */}
              <div className={`${styles.formPanel} ${styles.signinPanel}`} aria-hidden={mode !== "signin"}>
                <header className={styles.formHeader}>
                  <h1 className={styles.title}>Welcome back</h1>
                  <p className={styles.subtitle}>Sign in to your dashboard and continue where you left off.</p>
                </header>

                <form className={styles.form} onSubmit={handleSubmit}>
                  <label className={styles.label}>
                    <span className={styles.labelText}>Email</span>
                    <span className={styles.inputWrap}>
                      <span className={styles.inputIcon} aria-hidden="true">
                        <FontAwesomeIcon icon={faAt} />
                      </span>
                      <input
                        className={styles.input}
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="you@company.com"
                        value={signin.email}
                        onChange={(e) => setSignin((s) => ({ ...s, email: e.target.value }))}
                        disabled={busy}
                        required
                      />
                    </span>
                  </label>

                  <label className={styles.label}>
                    <span className={styles.labelText}>Password</span>
                    <span className={styles.inputWrap}>
                      <span className={styles.inputIcon} aria-hidden="true">
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                      <input
                        className={styles.input}
                        type={signin.showPw ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={signin.password}
                        onChange={(e) => setSignin((s) => ({ ...s, password: e.target.value }))}
                        disabled={busy}
                        required
                      />
                      <button
                        type="button"
                        className={styles.iconButton}
                        onClick={() => setSignin((s) => ({ ...s, showPw: !s.showPw }))}
                        disabled={busy}
                        aria-label={signin.showPw ? "Hide password" : "Show password"}
                      >
                        <FontAwesomeIcon icon={signin.showPw ? faEyeSlash : faEye} />
                      </button>
                    </span>
                  </label>

                  <div className={styles.row}>
                    <label className={styles.checkbox}>
                      <input type="checkbox" defaultChecked disabled={busy} />
                      <span>Remember me</span>
                    </label>
                    <button type="button" className={styles.linkBtn} disabled={busy}>
                      Forgot password?
                    </button>
                  </div>

                  <button className={styles.primaryBtn} type="submit" disabled={busy}>
                    <span>{modeLabel}</span>
                    <span className={styles.btnIcon} aria-hidden="true">
                      {busy ? <FontAwesomeIcon icon={faCircleNotch} spin /> : <FontAwesomeIcon icon={faArrowRight} />}
                    </span>
                  </button>

                  {toast && (
                    <div
                      className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}
                      role="status"
                      aria-live="polite"
                    >
                      <span className={styles.toastIcon} aria-hidden="true">
                        <FontAwesomeIcon icon={toast.type === "success" ? faCircleCheck : faCircleCheck} />
                      </span>
                      <span>{toast.message}</span>
                    </div>
                  )}

                  <div className={styles.switchRow}>
                    <span className={styles.muted}>New here?</span>
                    <button
                      type="button"
                      className={styles.switchBtn}
                      onClick={() => {
                        setToast(null);
                        setMode("signup");
                      }}
                      disabled={busy}
                    >
                      Create an account <FontAwesomeIcon icon={faUserPlus} className={styles.inlineIcon} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Sign Up */}
              <div className={`${styles.formPanel} ${styles.signupPanel}`} aria-hidden={mode !== "signup"}>
                <header className={styles.formHeader}>
                  <h1 className={styles.title}>Create your account</h1>
                  <p className={styles.subtitle}>Start exploring your data with a clean, modern dashboard.</p>
                </header>

                <form className={styles.form} onSubmit={handleSubmit}>
                  <label className={styles.label}>
                    <span className={styles.labelText}>Full name</span>
                    <span className={styles.inputWrap}>
                      <span className={styles.inputIcon} aria-hidden="true">
                        <FontAwesomeIcon icon={faUser} />
                      </span>
                      <input
                        className={styles.input}
                        type="text"
                        autoComplete="name"
                        placeholder="Alex Johnson"
                        value={signup.name}
                        onChange={(e) => setSignup((s) => ({ ...s, name: e.target.value }))}
                        disabled={busy}
                        required
                      />
                    </span>
                  </label>

                  <label className={styles.label}>
                    <span className={styles.labelText}>Email</span>
                    <span className={styles.inputWrap}>
                      <span className={styles.inputIcon} aria-hidden="true">
                        <FontAwesomeIcon icon={faAt} />
                      </span>
                      <input
                        className={styles.input}
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="you@company.com"
                        value={signup.email}
                        onChange={(e) => setSignup((s) => ({ ...s, email: e.target.value }))}
                        disabled={busy}
                        required
                      />
                    </span>
                  </label>

                  <label className={styles.label}>
                    <span className={styles.labelText}>Password</span>
                    <span className={styles.inputWrap}>
                      <span className={styles.inputIcon} aria-hidden="true">
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                      <input
                        className={styles.input}
                        type={signup.showPw ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        value={signup.password}
                        onChange={(e) => setSignup((s) => ({ ...s, password: e.target.value }))}
                        disabled={busy}
                        required
                      />
                      <button
                        type="button"
                        className={styles.iconButton}
                        onClick={() => setSignup((s) => ({ ...s, showPw: !s.showPw }))}
                        disabled={busy}
                        aria-label={signup.showPw ? "Hide password" : "Show password"}
                      >
                        <FontAwesomeIcon icon={signup.showPw ? faEyeSlash : faEye} />
                      </button>
                    </span>
                  </label>

                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={signup.agree}
                      onChange={(e) => setSignup((s) => ({ ...s, agree: e.target.checked }))}
                      disabled={busy}
                    />
                    <span>
                      I agree to the <button type="button" className={styles.linkBtnInline} disabled={busy}>terms</button>{" "}
                      and <button type="button" className={styles.linkBtnInline} disabled={busy}>privacy policy</button>.
                    </span>
                  </label>

                  <button className={styles.primaryBtn} type="submit" disabled={busy}>
                    <span>{modeLabel}</span>
                    <span className={styles.btnIcon} aria-hidden="true">
                      {busy ? <FontAwesomeIcon icon={faCircleNotch} spin /> : <FontAwesomeIcon icon={faArrowRight} />}
                    </span>
                  </button>

                  {toast && (
                    <div
                      className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}
                      role="status"
                      aria-live="polite"
                    >
                      <span className={styles.toastIcon} aria-hidden="true">
                        <FontAwesomeIcon icon={toast.type === "success" ? faCircleCheck : faCircleCheck} />
                      </span>
                      <span>{toast.message}</span>
                    </div>
                  )}

                  <div className={styles.switchRow}>
                    <span className={styles.muted}>Already have an account?</span>
                    <button
                      type="button"
                      className={styles.switchBtn}
                      onClick={() => {
                        setToast(null);
                        setMode("signin");
                      }}
                      disabled={busy}
                    >
                      Sign in <FontAwesomeIcon icon={faArrowRight} className={styles.inlineIcon} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right: Animated overlay */}
          <aside className={styles.overlayPane} aria-label="Panel information">
            <div className={styles.overlayInner}>
              <div className={styles.overlayContent}>
                <div className={styles.kicker}>Modern analytics</div>
                <h2 className={styles.overlayTitle}>
                  {mode === "signin" ? "New to Data Insights?" : "Welcome back!"}
                </h2>
                <p className={styles.overlayText}>
                  {mode === "signin"
                    ? "Create an account to upload datasets, build visualizations, and generate reports in minutes."
                    : "Sign in to access your datasets, dashboards, and saved reports securely."}
                </p>

                <ul className={styles.bullets}>
                  <li>
                    <span className={styles.bulletIcon} aria-hidden="true">
                      <FontAwesomeIcon icon={faCircleCheck} />
                    </span>
                    Clean, professional UI
                  </li>
                  <li>
                    <span className={styles.bulletIcon} aria-hidden="true">
                      <FontAwesomeIcon icon={faCircleCheck} />
                    </span>
                    Smooth panel transitions
                  </li>
                  <li>
                    <span className={styles.bulletIcon} aria-hidden="true">
                      <FontAwesomeIcon icon={faCircleCheck} />
                    </span>
                    Ready for API integration
                  </li>
                </ul>

                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => {
                    setToast(null);
                    setMode((m) => (m === "signin" ? "signup" : "signin"));
                  }}
                  disabled={busy}
                >
                  {mode === "signin" ? (
                    <>
                      Switch to Sign up <FontAwesomeIcon icon={faUserPlus} className={styles.inlineIcon} />
                    </>
                  ) : (
                    <>
                      Switch to Sign in <FontAwesomeIcon icon={faArrowRight} className={styles.inlineIcon} />
                    </>
                  )}
                </button>
              </div>

              <div className={styles.overlayBadge} aria-hidden="true">
                <div className={styles.badgeIcon}>
                  <FontAwesomeIcon icon={mode === "signin" ? faUserPlus : faUser} />
                </div>
                <div className={styles.badgeText}>
                  <div className={styles.badgeTitle}>{mode === "signin" ? "Create" : "Access"}</div>
                  <div className={styles.badgeSub}>your workspace</div>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <footer className={styles.footer}>
          <span>© {new Date().getFullYear()} Data Insights Dashboard</span>
          <span className={styles.footerDot} aria-hidden="true">
            •
          </span>
          <span className={styles.footerMuted}>Light theme • Primary #374151 • Accent #10B981</span>
        </footer>
      </main>
    </div>
  );
}

export default AuthPage;
