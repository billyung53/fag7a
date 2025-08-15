import { useState, useRef } from "react";
import "./admin.css";

// Minimal Admin page: 4-digit OTP auth, Full Dump console logging, Logout.
const API_BASE = "http://localhost:3001";

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("adminOtpAuthed") === "true"
  );
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [dumpLoading, setDumpLoading] = useState(false);
  const inputsRef = useRef([]);
  const [data, setData] = useState(null);

  const individualCodes = () => {
    const codes = data?.referal_usage?.data.map((entry) => entry.code) || [];
    const uniqueCodes = [...new Set(codes)];
    const codeCounts = codes.reduce((acc, code) => {
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {});
    console.log("Unique Codes:", uniqueCodes);
    console.log("Code Counts:", codeCounts);
  };

  

  console.log(individualCodes());

  const handleDigitChange = (i, val) => {
    if (!/^[0-9]?$/.test(val)) return; // only digit or empty
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 3) inputsRef.current[i + 1]?.focus();
    if (otpError) setOtpError("");
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0)
      inputsRef.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) inputsRef.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 3) inputsRef.current[i + 1]?.focus();
    if (e.key === "Enter") attemptAuth();
  };

  const attemptAuth = async () => {
    const code = digits.join("");
    if (code.length !== 4) {
      setOtpError("Enter 4 digits");
      return;
    }
    try {
      const resp = await fetch(`${API_BASE}/admin/otp`);
      if (!resp.ok) throw new Error("OTP endpoint error");
      const json = await resp.json();
      if (String(json?.otp) === code) {
        setAuthed(true);
        sessionStorage.setItem("adminOtpAuthed", "true");
        setOtpError("");
        fetchFullDump(); // auto fetch once
      } else setOtpError("Incorrect code");
    } catch (e) {
      setOtpError(e.message || "Validation failed");
    }
  };

  const fetchFullDump = async () => {
    setDumpLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/admin/full-dump`);
      if (!resp.ok) throw new Error("full-dump failed");
      const dump = await resp.json();
      setData(dump);
      console.log("[ADMIN] Full dump:", dump);
    } catch (err) {
      console.log("[ADMIN] Full dump error:", err.message || err);
    } finally {
      setDumpLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminOtpAuthed");
    setAuthed(false);
    setDigits(["", "", "", ""]);
    setOtpError("");
  };

  if (!authed)
    return (
      <div style={styles.authWrap}>
        <div style={styles.authCard}>
          <h1 style={styles.authTitle}>Enter 4-Digit Code</h1>
          <div style={styles.digitsRow}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                style={{
                  ...styles.digitInput,
                  borderColor: otpError ? "#ef4444" : "#30363d",
                }}
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) =>
                  handleDigitChange(i, e.target.value.replace(/\D/g, ""))
                }
                onKeyDown={(e) => handleKeyDown(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>
          {otpError && <div style={styles.otpError}>{otpError}</div>}
          <button
            onClick={attemptAuth}
            disabled={digits.some((d) => !d)}
            style={styles.unlockBtn}
          >
            Unlock
          </button>
          <p style={styles.hint}>Code required to view admin data</p>
        </div>
      </div>
    );

  return (
    <div style={styles.page}>
      <div style={styles.actions}>
        <button
          onClick={fetchFullDump}
          disabled={dumpLoading}
          style={styles.dumpButton}
        >
          {dumpLoading ? "Dumping..." : "Full Dump"}
        </button>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div>
        <h1>Welcome 5o5a Admin</h1>

        <div className="row">
          <div className="value">
            <h3 className="value-title">Referal Codes</h3>
            <h1 className="value-count">
              {data ? JSON.stringify(data?.referal?.count) : "X"}
            </h1>
          </div>

          <div className="value">
            <h3 className="value-title">Total Referal Usage</h3>
            <h1 className="value-count">
              {data ? JSON.stringify(data?.referal_usage?.count) : "X"}
            </h1>
          </div>

          <div className="value">
            <h3 className="value-title">Total Referal Usage</h3>
          </div>
        </div>

        <div className="row">
          <div className="value">
            <h3 className="value-title">Total Categories</h3>
            <h1 className="value-count">
              {data ? JSON.stringify(data?.categories?.count) : "X"}
            </h1>
          </div>

          <div className="value">
            <h3 className="value-title">Total Categories</h3>
            <h1 className="value-count">
              {data ? JSON.stringify(data?.categories?.count) : "X"}
            </h1>
          </div>
        </div>

        <p>
          {data ? JSON.stringify(data?.categories?.count) : "No data available"}
        </p>
      </div>
    </div>
  );
}

const styles = {
  authWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    fontFamily: "system-ui, Arial, sans-serif",
    padding: "2rem",
  },
  authCard: {
    background: "#181b20",
    border: "1px solid #262c35",
    borderRadius: 18,
    padding: "2.2rem 2rem 2rem",
    width: "100%",
    maxWidth: 360,
    boxShadow: "0 8px 28px -8px rgba(0,0,0,0.55)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 22,
    color: "#fff",
  },
  authTitle: {
    margin: 0,
    fontSize: "1.45rem",
    fontWeight: 600,
    letterSpacing: ".5px",
  },
  digitsRow: { display: "flex", gap: 14 },
  digitInput: {
    width: 56,
    height: 64,
    textAlign: "center",
    fontSize: "1.8rem",
    fontWeight: 600,
    background: "#0f1113",
    border: "2px solid #30363d",
    borderRadius: 14,
    color: "#fff",
    outline: "none",
    transition: "all .15s",
  },
  otpError: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: -10,
    alignSelf: "center",
  },
  unlockBtn: {
    marginTop: 4,
    background: "#000",
    border: "none",
    color: "#fff",
    fontWeight: 600,
    letterSpacing: ".5px",
    padding: "12px 20px",
    borderRadius: 12,
    cursor: "pointer",
    width: "100%",
    fontSize: 15,
  },
  hint: { margin: 0, marginTop: 4, opacity: 0.45, fontSize: 12 },
  page: {
    fontFamily: "system-ui, Arial, sans-serif",
    color: "#1a1a1a",
    minHeight: "100vh",
    lineHeight: 1.4,
    padding: "2rem",
  },
  actions: { display: "flex", gap: 12, marginBottom: 20 },
  dumpButton: {
    background: "#111",
    border: "1px solid #222",
    color: "#fff",
    padding: "10px 18px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    borderRadius: 8,
  },
  logoutButton: {
    background: "#ef4444",
    border: "none",
    color: "#fff",
    padding: "10px 18px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    borderRadius: 8,
  },
};
