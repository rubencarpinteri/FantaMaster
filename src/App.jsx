import { useState, useEffect, useCallback, useRef } from "react";

const SB = "https://teghwxjemabihaqdnufp.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZ2h3eGplbWFiaWhhcWRudWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDk2NjUsImV4cCI6MjA4MDQyNTY2NX0.0roobrn4ey0Ub_AJqrnBSD0sr5DkDxlX5CplLaTreh4";

async function rpc(fn, params = {}) {
  const r = await fetch(`${SB}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function get(table, qs = "") {
  const r = await fetch(`${SB}/rest/v1/${table}?${qs}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}
function timeLeft(iso) {
  const d = new Date(iso) - Date.now();
  if (d <= 0) return "Scaduta";
  const h = Math.floor(d / 3600000), m = Math.floor((d % 3600000) / 60000);
  if (h > 48) return `${Math.floor(h/24)}g`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const COLORS = ["#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#8b5cf6","#ef4444","#14b8a6","#f97316","#84cc16"];

// ── UI atoms ──────────────────────────────────────────────
function Avatar({ name = "?", color = "#6366f1", size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: color, display: "flex", alignItems: "center",
      justifyContent: "center", fontWeight: 800,
      fontSize: size * 0.42, color: "#fff", flexShrink: 0,
      fontFamily: "'Syne', sans-serif",
    }}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

function Badge({ children, color = "gray" }) {
  const map = {
    gray:   { bg: "#1f2330", text: "#6b7280" },
    green:  { bg: "#052e16", text: "#22c55e" },
    yellow: { bg: "#1c1207", text: "#eab308" },
    red:    { bg: "#1f0a0a", text: "#ef4444" },
    blue:   { bg: "#0a1628", text: "#60a5fa" },
  };
  const c = map[color] || map.gray;
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.text}22`,
      borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 600,
    }}>
      {children}
    </span>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: "#111318", border: "1px solid #1e2235",
      borderRadius: 14, padding: 20, ...style,
    }}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, disabled, variant = "primary", style }) {
  const styles = {
    primary: { background: "#4f7fff", color: "#fff" },
    ghost:   { background: "transparent", color: "#6b7280", border: "1px solid #1e2235" },
    danger:  { background: "#1f0a0a", color: "#ef4444", border: "1px solid #ef444422" },
    success: { background: "#052e16", color: "#22c55e", border: "1px solid #22c55e22" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant], border: "none", borderRadius: 9, padding: "9px 18px",
      fontSize: 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1, transition: "opacity .15s",
      fontFamily: "'DM Sans', sans-serif", ...style,
    }}>
      {children}
    </button>
  );
}

// ── LOGIN ─────────────────────────────────────────────────
function Login({ onLogin }) {
  const [u, setU] = useState(""), [p, setP] = useState(""), [err, setErr] = useState(""), [loading, setLoading] = useState(false);
  async function submit() {
    setErr(""); setLoading(true);
    try {
      const r = await rpc("rpc_login", { p_username: u, p_password: p });
      if (r.ok) onLogin(r.user, r.token);
      else setErr(r.error);
    } catch { setErr("Errore di connessione"); }
    setLoading(false);
  }
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0b0f" }}>
      {/* grid bg */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(#1e223520 1px,transparent 1px),linear-gradient(90deg,#1e223520 1px,transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />
      <div style={{ position: "relative", background: "#111318", border: "1px solid #1e2235", borderRadius: 18, padding: "44px 36px 36px", width: 360, boxShadow: "0 32px 80px #00000066" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 13, background: "linear-gradient(135deg,#4f7fff,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 24 }}>⚽</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: "#e8eaf0", margin: 0 }}>FantaLeague</h1>
          <p style={{ color: "#555c77", fontSize: 13, marginTop: 4 }}>Piattaforma Pronostici</p>
        </div>
        {err && <div style={{ background: "#1f0a0a", border: "1px solid #ef444433", borderRadius: 8, color: "#ef4444", fontSize: 13, padding: "10px 14px", marginBottom: 14 }}>{err}</div>}
        {["Username","Password"].map((label, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "#555c77", marginBottom: 6 }}>{label}</label>
            <input
              type={i === 1 ? "password" : "text"}
              value={i === 0 ? u : p}
              onChange={e => i === 0 ? setU(e.target.value) : setP(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              style={{ width: "100%", background: "#0e1018", border: "1px solid #1e2235", borderRadius: 9, color: "#e8eaf0", fontFamily: "'DM Sans',sans-serif", fontSize: 15, padding: "11px 14px", outline: "none", boxSizing: "border-box" }}
              placeholder={i === 0 ? "username" : "••••••••"}
            />
          </div>
        ))}
        <Btn onClick={submit} disabled={loading} style={{ width: "100%", padding: 12, fontSize: 15, marginTop: 4 }}>
          {loading ? "Accesso…" : "Accedi"}
        </Btn>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────
function Dashboard({ user, token }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const [matchdays, scores, preds] = await Promise.all([
        get("matchdays", "order=number.asc"),
        get("scores", `user_id=eq.${user.id}`),
        get("predictions", `user_id=eq.${user.id}&order=submitted_at.desc&limit=5`),
      ]);
      const allScores = await get("scores");
      const lb = {};
      allScores.forEach(s => { lb[s.user_id] = (lb[s.user_id] || 0) + +s.points + +s.bonus; });
      const myTotal = scores.reduce((a, s) => a + +s.points + +s.bonus, 0);
      const rank = Object.values(lb).sort((a,b)=>b-a).findIndex(v => v === myTotal) + 1;
      const mdMap = Object.fromEntries(matchdays.map(m => [m.id, m]));
      const scoreMap = Object.fromEntries(scores.map(s => [s.matchday_id, s]));
      setData({ matchdays, myTotal, rank, scores, preds, mdMap, scoreMap,
        openMd: matchdays.find(m => m.status === "open") });
    }
    load().catch(console.error);
  }, [user.id]);

  if (!data) return <div style={{ color: "#555c77", padding: 40 }}>Caricamento…</div>;
  const avg = data.scores.length ? (data.myTotal / data.scores.length).toFixed(1) : "—";

  return (
    <div>
      {/* Welcome */}
      <div style={{ background: "linear-gradient(135deg,#0f1628,#0a1020)", border: "1px solid #1e2235", borderRadius: 14, padding: "24px 28px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: "#e8eaf0", margin: 0 }}>Ciao, {user.display_name}! 👋</h2>
          <p style={{ color: "#555c77", fontSize: 13, marginTop: 4 }}>
            {data.openMd ? `⚡ ${data.openMd.label} aperta — scadenza ${fmt(data.openMd.deadline)}` : "Nessuna giornata aperta al momento"}
          </p>
        </div>
        <Avatar name={user.display_name} color={user.avatar_color} size={48} />
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[["Punti Totali", data.myTotal.toFixed(1)], ["Media", avg], ["Posizione", data.rank ? `#${data.rank}` : "—"]].map(([l,v]) => (
          <Card key={l}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "#555c77", marginBottom: 6 }}>{l}</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#e8eaf0" }}>{v}</div>
          </Card>
        ))}
      </div>

      {/* Recent predictions */}
      <Card>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 14, color: "#e8eaf0" }}>📋 Ultimi Pronostici</div>
        {data.preds.length === 0
          ? <p style={{ color: "#555c77", fontSize: 13 }}>Nessun pronostico ancora</p>
          : data.preds.map(p => {
            const md = data.mdMap[p.matchday_id];
            const sc = data.scoreMap[p.matchday_id];
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1e2235" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#e8eaf0" }}>{md?.label}</div>
                  <div style={{ fontSize: 12, color: "#555c77", marginTop: 2 }}>{p.content.slice(0, 60)}{p.content.length > 60 ? "…" : ""}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#e8eaf0", fontFamily: "'Syne',sans-serif" }}>{sc ? (+sc.points + +sc.bonus).toFixed(1) : "—"}</div>
                  <div style={{ fontSize: 11, color: "#555c77" }}>{fmt(p.updated_at)}</div>
                </div>
              </div>
            );
          })}
      </Card>
    </div>
  );
}

// ── PREDICTIONS ───────────────────────────────────────────
function Predictions({ user, token }) {
  const [matchdays, setMatchdays] = useState([]);
  const [selected, setSelected] = useState(null);
  const [pred, setPred] = useState(null);
  const [text, setText] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error | unsaved
  const [saveMsg, setSaveMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    get("matchdays", "order=number.asc").then(mds => {
      setMatchdays(mds);
      const open = mds.find(m => m.status === "open") || mds.slice().reverse().find(m => m.status !== "upcoming");
      if (open) selectMatchday(open, mds);
    });
  }, []);

  async function selectMatchday(md, mds = matchdays) {
    setSelected(md);
    setPred(null); setText(""); setOriginalText(""); setSaveState("idle"); setSaveMsg("");
    setLoading(true);
    try {
      const r = await get("predictions", `user_id=eq.${user.id}&matchday_id=eq.${md.id}`);
      const existing = r[0] || null;
      setPred(existing);
      setText(existing?.content || "");
      setOriginalText(existing?.content || "");
      setSaveState(existing ? "saved" : "idle");
      setSaveMsg(existing ? `Salvato · ${fmt(existing.updated_at)} · v${existing.version}` : "");
    } catch { setSaveState("error"); }
    setLoading(false);
  }

  async function save() {
    if (!selected || !text.trim()) return;
    setSaveState("saving"); setSaveMsg("Salvataggio…");
    try {
      const r = await rpc("rpc_save_prediction", { p_token: token, p_matchday_id: selected.id, p_content: text.trim() });
      if (r.ok) {
        setOriginalText(text.trim());
        setSaveState("saved");
        setSaveMsg(`Salvato · ${fmt(r.updated_at)} · v${r.version}`);
        setPred({ ...pred, content: text.trim(), version: r.version, updated_at: r.updated_at, submitted_at: pred?.submitted_at || r.submitted_at, id: r.id });
      } else {
        setSaveState("error"); setSaveMsg(r.error);
      }
    } catch {
      setSaveState("error"); setSaveMsg("Errore di rete — NON salvato");
    }
  }

  const locked = selected && (selected.status === "locked" || selected.status === "completed" || new Date() > new Date(selected.deadline));
  const dirty = text !== originalText;

  const statusColor = { idle: "#555c77", saving: "#eab308", saved: "#22c55e", error: "#ef4444", unsaved: "#f97316" };

  return (
    <div>
      {/* Matchday pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
        {matchdays.map(md => {
          const isSelected = selected?.id === md.id;
          const dotColor = { open: "#22c55e", upcoming: "#60a5fa", locked: "#eab308", completed: "#374151" }[md.status];
          return (
            <button key={md.id} onClick={() => selectMatchday(md)} style={{
              padding: "5px 13px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: isSelected ? "#4f7fff" : "#111318",
              color: isSelected ? "#fff" : "#6b7280",
              border: isSelected ? "1px solid #4f7fff" : "1px solid #1e2235",
              transition: "all .15s", display: "flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, display: "inline-block" }} />
              {md.number}
            </button>
          );
        })}
      </div>

      {selected && (
        <Card>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: "#e8eaf0" }}>{selected.label}</div>
              {!locked && <div style={{ fontSize: 12, color: "#eab308", marginTop: 2 }}>⏰ Scadenza: {fmt(selected.deadline)} ({timeLeft(selected.deadline)})</div>}
            </div>
            {locked
              ? <Badge color="gray">🔒 Bloccato</Badge>
              : <Badge color="green">✅ Aperta</Badge>}
          </div>

          {locked && (
            <div style={{ background: "#1f0a0a22", border: "1px solid #ef444422", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#ef444499" }}>
              Questa giornata è chiusa. Il pronostico non può essere modificato.
            </div>
          )}

          {/* Textarea */}
          <textarea
            value={text}
            onChange={e => { setText(e.target.value); setSaveState("unsaved"); setSaveMsg("Modifiche non salvate"); }}
            disabled={locked || loading}
            placeholder={"Scrivi il tuo pronostico qui…\n\nEs: Titolare Modulo 4-3-3\nPortiere: X\nDifensori: A B C D\n…"}
            style={{
              width: "100%", minHeight: 180, background: "#0e1018", border: "1px solid #1e2235",
              borderRadius: 10, color: "#e8eaf0", fontFamily: "'DM Sans',sans-serif", fontSize: 14,
              lineHeight: 1.7, padding: 14, resize: "vertical", outline: "none", boxSizing: "border-box",
              opacity: locked ? 0.6 : 1,
            }}
          />

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor[saveState], flexShrink: 0 }} />
              <span style={{ color: statusColor[saveState] }}>{saveMsg || "Nessuna modifica"}</span>
            </div>
            {!locked && (
              <Btn onClick={save} disabled={!dirty || saveState === "saving"}>
                {saveState === "saving" ? "⏳ Salvataggio…" : "💾 Salva"}
              </Btn>
            )}
          </div>

          {/* Audit */}
          {pred && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #1e2235", display: "flex", gap: 24, flexWrap: "wrap" }}>
              {[["Prima submission", fmt(pred.submitted_at)], ["Ultimo aggiornamento", fmt(pred.updated_at)], ["Versione", `v${pred.version}`]].map(([l,v]) => (
                <div key={l}>
                  <div style={{ fontSize: 10, color: "#555c77", textTransform: "uppercase", letterSpacing: ".08em" }}>{l}</div>
                  <div style={{ fontSize: 12, color: "#8b91a8", fontFamily: "'DM Mono',monospace", marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ── LEADERBOARD ───────────────────────────────────────────
function Leaderboard() {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    async function load() {
      const [users, scores] = await Promise.all([
        get("app_users", "is_admin=eq.false"),
        get("scores"),
      ]);
      const totals = {};
      const counts = {};
      scores.forEach(s => {
        totals[s.user_id] = (totals[s.user_id] || 0) + +s.points + +s.bonus;
        counts[s.user_id] = (counts[s.user_id] || 0) + 1;
      });
      const rows = users.map(u => ({
        ...u, total: totals[u.id] || 0, count: counts[u.id] || 0,
        avg: counts[u.id] ? (totals[u.id] / counts[u.id]).toFixed(1) : "—",
      })).sort((a, b) => b.total - a.total);
      setRows(rows);
    }
    load().catch(console.error);
  }, []);

  if (!rows) return <div style={{ color: "#555c77", padding: 40 }}>Caricamento…</div>;
  const medals = ["🥇","🥈","🥉"];

  return (
    <Card style={{ maxWidth: 560 }}>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#e8eaf0" }}>🏆 Classifica</div>
      {rows.map((u, i) => (
        <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < rows.length-1 ? "1px solid #1e2235" : "none" }}>
          <div style={{ width: 28, textAlign: "center", fontSize: i < 3 ? 20 : 15, fontFamily: "'Syne',sans-serif", fontWeight: 800, color: i < 3 ? undefined : "#555c77" }}>
            {i < 3 ? medals[i] : i+1}
          </div>
          <Avatar name={u.display_name} color={u.avatar_color} size={34} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#e8eaf0" }}>{u.display_name}</div>
            <div style={{ fontSize: 11, color: "#555c77" }}>avg {u.avg} · {u.count} giornate</div>
          </div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: "#e8eaf0" }}>{u.total.toFixed(1)}</div>
        </div>
      ))}
    </Card>
  );
}

// ── CALENDARIO ────────────────────────────────────────────
function Calendario({ user }) {
  const [matchdays, setMatchdays] = useState([]);
  const [myPreds, setMyPreds] = useState({});
  useEffect(() => {
    Promise.all([
      get("matchdays", "order=number.asc"),
      get("predictions", `user_id=eq.${user.id}&select=matchday_id`),
    ]).then(([mds, preds]) => {
      setMatchdays(mds);
      setMyPreds(Object.fromEntries(preds.map(p => [p.matchday_id, true])));
    });
  }, []);

  const statusInfo = {
    upcoming:  { label: "In arrivo", color: "blue" },
    open:      { label: "Aperta",    color: "green" },
    locked:    { label: "Chiusa",    color: "yellow" },
    completed: { label: "Completata",color: "gray" },
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
      {matchdays.map(md => {
        const info = statusInfo[md.status] || statusInfo.upcoming;
        const hasPred = myPreds[md.id];
        return (
          <Card key={md.id} style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: "#e8eaf0" }}>{md.label}</div>
              <Badge color={info.color}>{info.label}</Badge>
            </div>
            <div style={{ fontSize: 12, color: "#555c77" }}>⏰ {fmt(md.deadline)}</div>
            {hasPred && <div style={{ fontSize: 12, color: "#22c55e", marginTop: 6 }}>✅ Pronostico inviato</div>}
          </Card>
        );
      })}
    </div>
  );
}

// ── ADMIN ─────────────────────────────────────────────────
function Admin({ token }) {
  const [tab, setTab] = useState("submissions");
  const [users, setUsers] = useState([]);
  const [matchdays, setMatchdays] = useState([]);
  const [preds, setPreds] = useState([]);
  const [scores, setScores] = useState({});
  const [filterMd, setFilterMd] = useState("");
  // create user form
  const [nu, setNu] = useState({ username:"", password:"", display_name:"", color: COLORS[Math.floor(Math.random()*COLORS.length)], admin: false });
  const [msg, setMsg] = useState("");

  async function load() {
    const [u, mds, pr, sc] = await Promise.all([
      get("app_users", "order=created_at.asc"),
      get("matchdays", "order=number.asc"),
      get("predictions", "order=submitted_at.desc&limit=300"),
      get("scores"),
    ]);
    setUsers(u); setMatchdays(mds); setPreds(pr);
    const scMap = {};
    sc.forEach(s => { scMap[`${s.user_id}_${s.matchday_id}`] = s; });
    setScores(scMap);
  }

  useEffect(() => { load(); }, []);

  const userMap = Object.fromEntries(users.map(u => [u.id, u]));
  const mdMap = Object.fromEntries(matchdays.map(m => [m.id, m]));
  const filteredPreds = filterMd ? preds.filter(p => p.matchday_id === filterMd) : preds;
  const nonAdmins = users.filter(u => !u.is_admin);

  async function setMdStatus(mdId, status) {
    await rpc("rpc_set_matchday", { p_token: token, p_matchday_id: mdId, p_status: status });
    load();
  }

  async function createUser() {
    setMsg("");
    const r = await rpc("rpc_create_user", { p_token: token, p_username: nu.username, p_password: nu.password, p_display_name: nu.display_name, p_color: nu.color, p_admin: nu.admin });
    setMsg(r.ok ? `✅ Utente "${nu.display_name}" creato` : `❌ ${r.error}`);
    if (r.ok) { setNu({ username:"",password:"",display_name:"",color:COLORS[Math.floor(Math.random()*COLORS.length)],admin:false }); load(); }
  }

  async function saveScore(userId, mdId, points, bonus) {
    await rpc("rpc_upsert_score", { p_token: token, p_user_id: userId, p_matchday_id: mdId, p_points: +points, p_bonus: +bonus });
    load();
  }

  const tabs = [["submissions","📋 Submissions"],["scores","🎯 Punteggi"],["users","👥 Utenti"],["matchdays","📅 Giornate"]];

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, background: "#111318", border: "1px solid #1e2235", borderRadius: 10, padding: 4, marginBottom: 20, width: "fit-content" }}>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "7px 16px", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer",
            border: "none", background: tab === id ? "#1a1f2e" : "transparent",
            color: tab === id ? "#e8eaf0" : "#555c77", fontFamily: "'DM Sans',sans-serif",
          }}>{label}</button>
        ))}
      </div>

      {/* SUBMISSIONS */}
      {tab === "submissions" && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: "#e8eaf0" }}>Tutti i Pronostici</div>
            <select value={filterMd} onChange={e => setFilterMd(e.target.value)} style={{ marginLeft: "auto", background: "#0e1018", border: "1px solid #1e2235", borderRadius: 8, color: "#e8eaf0", padding: "6px 10px", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
              <option value="">Tutte le giornate</option>
              {matchdays.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["Utente","Giornata","Pronostico","Inviato","Aggiornato","Ver.","Stato"].map(h => (
                  <th key={h} style={{ textAlign: "left", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "#555c77", padding: "8px 12px", borderBottom: "1px solid #1e2235" }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filteredPreds.map(p => {
                  const u = userMap[p.user_id]; const md = mdMap[p.matchday_id];
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid #1e2235" }}>
                      <td style={{ padding: "11px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {u && <Avatar name={u.display_name} color={u.avatar_color} size={24} />}
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>{u?.display_name || "—"}</span>
                        </div>
                      </td>
                      <td style={{ padding: "11px 12px", fontSize: 13, color: "#8b91a8" }}>{md?.label}</td>
                      <td style={{ padding: "11px 12px", fontSize: 12, color: "#6b7280", maxWidth: 260 }}>
                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.content}</div>
                      </td>
                      <td style={{ padding: "11px 12px", fontSize: 11, color: "#555c77", fontFamily: "'DM Mono',monospace" }}>{fmt(p.submitted_at)}</td>
                      <td style={{ padding: "11px 12px", fontSize: 11, color: "#555c77", fontFamily: "'DM Mono',monospace" }}>{fmt(p.updated_at)}</td>
                      <td style={{ padding: "11px 12px" }}><span style={{ fontSize: 11, color: "#555c77", background: "#1e2235", borderRadius: 4, padding: "2px 6px", fontFamily: "'DM Mono',monospace" }}>v{p.version}</span></td>
                      <td style={{ padding: "11px 12px" }}><Badge color={p.is_locked ? "gray" : "green"}>{p.is_locked ? "🔒" : "✅"}</Badge></td>
                    </tr>
                  );
                })}
                {filteredPreds.length === 0 && <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#555c77", fontSize: 13 }}>Nessun pronostico</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SCORES */}
      {tab === "scores" && (
        <Card>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: "#e8eaf0", marginBottom: 16 }}>Inserisci Punteggi</div>
          {matchdays.filter(m => m.status === "locked" || m.status === "completed").map(md => (
            <div key={md.id} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#8b91a8", marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid #1e2235" }}>{md.label}</div>
              {nonAdmins.map(u => {
                const sc = scores[`${u.id}_${md.id}`];
                const [pts, setPts] = useState(sc?.points || "");
                const [bon, setBon] = useState(sc?.bonus || "");
                return (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #1e223530" }}>
                    <Avatar name={u.display_name} color={u.avatar_color} size={28} />
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>{u.display_name}</span>
                    {[["Punti", pts, setPts],["Bonus", bon, setBon]].map(([l,v,set]) => (
                      <div key={l}>
                        <div style={{ fontSize: 10, color: "#555c77", marginBottom: 3 }}>{l}</div>
                        <input type="number" value={v} onChange={e => set(e.target.value)} step="0.5"
                          style={{ width: 70, background: "#0e1018", border: "1px solid #1e2235", borderRadius: 7, color: "#e8eaf0", padding: "6px 10px", fontSize: 13, textAlign: "center", outline: "none", fontFamily: "'DM Mono',monospace" }} />
                      </div>
                    ))}
                    <Btn onClick={() => saveScore(u.id, md.id, pts, bon)} variant="success" style={{ padding: "7px 14px" }}>Salva</Btn>
                  </div>
                );
              })}
            </div>
          ))}
          {matchdays.filter(m => m.status === "locked" || m.status === "completed").length === 0 &&
            <p style={{ color: "#555c77", fontSize: 13 }}>Nessuna giornata chiusa ancora</p>}
        </Card>
      )}

      {/* USERS */}
      {tab === "users" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: "#e8eaf0", marginBottom: 14 }}>➕ Crea Utente</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[["Username", "username", "text"], ["Nome", "display_name", "text"], ["Password", "password", "password"]].map(([l, k, t]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "#555c77", marginBottom: 5 }}>{l}</div>
                  <input type={t} value={nu[k]} onChange={e => setNu({...nu, [k]: e.target.value})}
                    style={{ width: "100%", background: "#0e1018", border: "1px solid #1e2235", borderRadius: 8, color: "#e8eaf0", padding: "9px 12px", fontSize: 14, outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "#555c77", marginBottom: 5 }}>Colore</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {COLORS.map(c => (
                    <div key={c} onClick={() => setNu({...nu, color: c})} style={{ width: 24, height: 24, borderRadius: 6, background: c, cursor: "pointer", border: nu.color === c ? "2px solid #fff" : "2px solid transparent" }} />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#8b91a8", cursor: "pointer" }}>
                <input type="checkbox" checked={nu.admin} onChange={e => setNu({...nu, admin: e.target.checked})} /> Admin
              </label>
              <Btn onClick={createUser} style={{ marginLeft: "auto" }}>Crea</Btn>
            </div>
            {msg && <div style={{ marginTop: 12, fontSize: 13, color: msg.startsWith("✅") ? "#22c55e" : "#ef4444" }}>{msg}</div>}
          </Card>

          <Card>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: "#e8eaf0", marginBottom: 14 }}>👥 Utenti ({users.length})</div>
            {users.map(u => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1e2235" }}>
                <Avatar name={u.display_name} color={u.avatar_color} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#e8eaf0" }}>{u.display_name}</div>
                  <div style={{ fontSize: 12, color: "#555c77", fontFamily: "'DM Mono',monospace" }}>@{u.username}</div>
                </div>
                {u.is_admin && <Badge color="red">Admin</Badge>}
                <Btn variant="ghost" style={{ padding: "5px 12px", fontSize: 12 }} onClick={async () => {
                  const pw = prompt(`Nuova password per ${u.display_name}:`);
                  if (pw) { const r = await rpc("rpc_set_password", { p_token: token, p_target_id: u.id, p_new_password: pw }); alert(r.ok ? "✅ Password aggiornata" : r.error); }
                }}>🔑</Btn>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* MATCHDAYS */}
      {tab === "matchdays" && (
        <Card>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: "#e8eaf0", marginBottom: 14 }}>📅 Gestione Giornate</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Giornata","Stato","Scadenza","Azioni"].map(h => (
                <th key={h} style={{ textAlign: "left", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "#555c77", padding: "8px 12px", borderBottom: "1px solid #1e2235" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {matchdays.map(md => {
                const bc = { upcoming:"blue", open:"green", locked:"yellow", completed:"gray" }[md.status];
                return (
                  <tr key={md.id} style={{ borderBottom: "1px solid #1e2235" }}>
                    <td style={{ padding: "11px 12px", fontWeight: 600, fontSize: 13, color: "#e8eaf0" }}>{md.label}</td>
                    <td style={{ padding: "11px 12px" }}><Badge color={bc}>{md.status}</Badge></td>
                    <td style={{ padding: "11px 12px", fontSize: 12, color: "#555c77", fontFamily: "'DM Mono',monospace" }}>{fmt(md.deadline)}</td>
                    <td style={{ padding: "11px 12px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {md.status !== "open" && md.status !== "completed" && <Btn variant="success" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => setMdStatus(md.id, "open")}>Apri</Btn>}
                        {md.status === "open" && <Btn variant="ghost" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => setMdStatus(md.id, "locked")}>Chiudi</Btn>}
                        {md.status === "locked" && <Btn variant="ghost" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => setMdStatus(md.id, "completed")}>Completa</Btn>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

// ── PROFILO ───────────────────────────────────────────────
function Profilo({ user, token }) {
  const [pw, setPw] = useState(""), [msg, setMsg] = useState("");
  const [stats, setStats] = useState(null);
  useEffect(() => {
    Promise.all([
      get("predictions", `user_id=eq.${user.id}&select=id`),
      get("scores", `user_id=eq.${user.id}`),
    ]).then(([preds, scores]) => {
      const total = scores.reduce((a,s) => a + +s.points + +s.bonus, 0);
      setStats({ preds: preds.length, total });
    });
  }, []);
  async function changePw() {
    if (pw.length < 6) { setMsg("❌ Minimo 6 caratteri"); return; }
    const r = await rpc("rpc_set_password", { p_token: token, p_target_id: user.id, p_new_password: pw });
    setMsg(r.ok ? "✅ Password aggiornata" : `❌ ${r.error}`);
    if (r.ok) setPw("");
  }
  return (
    <div style={{ maxWidth: 480 }}>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <Avatar name={user.display_name} color={user.avatar_color} size={56} />
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#e8eaf0" }}>{user.display_name}</div>
            <div style={{ fontSize: 13, color: "#555c77", fontFamily: "'DM Mono',monospace", marginTop: 2 }}>@{user.username}</div>
          </div>
        </div>
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[["Pronostici", stats.preds], ["Punti Totali", stats.total.toFixed(1)]].map(([l,v]) => (
              <div key={l} style={{ background: "#0e1018", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, color: "#555c77", textTransform: "uppercase", letterSpacing: ".08em" }}>{l}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#e8eaf0", marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: "#e8eaf0", marginBottom: 14 }}>🔑 Cambia Password</div>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Nuova password…"
          style={{ width: "100%", background: "#0e1018", border: "1px solid #1e2235", borderRadius: 8, color: "#e8eaf0", padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif", marginBottom: 12 }} />
        <Btn onClick={changePw}>Aggiorna</Btn>
        {msg && <div style={{ marginTop: 10, fontSize: 13, color: msg.startsWith("✅") ? "#22c55e" : "#ef4444" }}>{msg}</div>}
      </Card>
    </div>
  );
}

// ── APP SHELL ─────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("fl_tok");
    if (t) {
      rpc("rpc_verify", { p_token: t }).then(r => {
        if (r.ok) { setUser(r.user); setToken(t); }
        setReady(true);
      }).catch(() => setReady(true));
    } else setReady(true);
  }, []);

  function onLogin(u, t) { setUser(u); setToken(t); localStorage.setItem("fl_tok", t); setPage("dashboard"); }
  function logout() { rpc("rpc_logout", { p_token: token }).catch(() => {}); setUser(null); setToken(null); localStorage.removeItem("fl_tok"); }

  if (!ready) return <div style={{ minHeight: "100vh", background: "#0a0b0f", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #1e2235", borderTopColor: "#4f7fff", animation: "spin .7s linear infinite" }} /></div>;
  if (!user) return <Login onLogin={onLogin} />;

  const navItems = [
    ["dashboard", "🏠", "Dashboard"],
    ["predictions", "✏️", "Pronostici"],
    ["leaderboard", "🏆", "Classifica"],
    ["calendario", "📅", "Calendario"],
    ["profilo", "👤", "Profilo"],
    ...(user.is_admin ? [["admin", "⚙️", "Admin"]] : []),
  ];

  const pageMap = {
    dashboard: <Dashboard user={user} token={token} />,
    predictions: <Predictions user={user} token={token} />,
    leaderboard: <Leaderboard />,
    calendario: <Calendario user={user} />,
    profilo: <Profilo user={user} token={token} />,
    admin: <Admin token={token} />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0b0f" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono&display=swap'); @keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'DM Sans', sans-serif; }`}</style>

      {/* Sidebar */}
      <nav style={{ width: 220, background: "#0d0f16", borderRight: "1px solid #1e2235", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, padding: "16px 0", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 16px 20px", borderBottom: "1px solid #1e2235", marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#4f7fff,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⚽</div>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: "#e8eaf0" }}>FantaLeague</span>
        </div>
        {navItems.map(([id, icon, label]) => (
          <button key={id} onClick={() => setPage(id)} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", margin: "1px 8px",
            borderRadius: 9, border: "none", cursor: "pointer", textAlign: "left",
            background: page === id ? "#1a1f2e" : "transparent",
            color: page === id ? "#e8eaf0" : "#555c77",
            fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans',sans-serif", transition: "all .15s",
          }}>
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{icon}</span> {label}
          </button>
        ))}
        <div style={{ marginTop: "auto", padding: "12px 8px 0", borderTop: "1px solid #1e2235" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#111318", borderRadius: 9 }}>
            <Avatar name={user.display_name} color={user.avatar_color} size={28} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e8eaf0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.display_name}</div>
              <div style={{ fontSize: 10, color: "#555c77" }}>{user.is_admin ? "Admin" : "Partecipante"}</div>
            </div>
            <button onClick={logout} style={{ background: "none", border: "none", color: "#555c77", cursor: "pointer", fontSize: 16, padding: 2 }} title="Esci">↩</button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main style={{ marginLeft: 220, flex: 1, padding: 28, minHeight: "100vh" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#e8eaf0" }}>
            {navItems.find(([id]) => id === page)?.[2]}
          </h2>
        </div>
        {pageMap[page]}
      </main>
    </div>
  );
}
