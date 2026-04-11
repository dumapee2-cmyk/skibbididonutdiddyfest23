import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

const px      = { fontFamily: "'Spencer', sans-serif" };
const serif   = { fontFamily: "'Spencer', serif" };
const bitter  = { fontFamily: "'Bitter Sour', cursive" };

/* ─── Scrapbook paper styles ─── */
type PaperStyle = "lined" | "grid" | "plain" | "yellow" | "pink";

const paperConfigs: Record<PaperStyle, { bg: string; lineColor: string; lines: boolean; grid: boolean }> = {
  lined:  { bg: "#0e1628", lineColor: "#1c2a44", lines: true,  grid: false },
  grid:   { bg: "#0c1422", lineColor: "#182038", lines: false, grid: true  },
  plain:  { bg: "#0d1525", lineColor: "",         lines: false, grid: false },
  yellow: { bg: "#0f1520", lineColor: "#1e2a30", lines: true,  grid: false },
  pink:   { bg: "#110f1e", lineColor: "#201830", lines: true,  grid: false },
};

const tapeColors = [
  "bg-[#3a5a3a]/55",
  "bg-[#4a3a4a]/55",
  "bg-[#3a4a5a]/55",
  "bg-[#4a4a3a]/55",
  "bg-[#3a3a5a]/55",
];

function Tape({ position, colorClass, rotation }: { position: string; colorClass: string; rotation: string }) {
  return (
    <div
      className={`absolute ${colorClass} h-[22px] w-[70px] sm:w-[90px] z-10 shadow-sm`}
      style={{
        ...posToStyle(position),
        transform: `rotate(${rotation})`,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='none'/%3E%3Cpath d='M0 0L4 4M4 0L0 4' stroke='%23ffffff' stroke-width='0.5' opacity='0.15'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

function posToStyle(pos: string): React.CSSProperties {
  switch (pos) {
    case "tl": return { top: -8, left: 12 };
    case "tr": return { top: -8, right: 12 };
    case "bl": return { bottom: -8, left: 16 };
    case "br": return { bottom: -8, right: 16 };
    default:   return {};
  }
}

function NotebookHoles() {
  return (
    <div className="absolute left-3 top-0 bottom-0 flex flex-col justify-evenly pointer-events-none">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="w-3 h-3 rounded-full bg-black/40 shadow-inner ring-1 ring-white/5" />
      ))}
    </div>
  );
}

// Each paper gets a unique turbulence seed and frequency for varied torn edges
const tornMaskParams = [
  { seed: 3,  freq: "0.022 0.012", scale: 20 },
  { seed: 11, freq: "0.018 0.010", scale: 24 },
  { seed: 17, freq: "0.028 0.014", scale: 18 },
  { seed: 23, freq: "0.020 0.011", scale: 22 },
  { seed: 31, freq: "0.025 0.013", scale: 20 },
];

function makeTornMask(seed: number, freq: string, scale: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><filter id="t" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="5" seed="${seed}" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/></filter><rect x="${scale}" y="${scale}" width="${800 - scale * 2}" height="${600 - scale * 2}" fill="white" filter="url(#t)"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const wrinklePatterns = [
  [{ angle: 135, pos: 35 }, { angle: 40, pos: 72 }, { angle: 160, pos: 18 }],
  [{ angle: 110, pos: 55 }, { angle: 25, pos: 30 }, { angle: 145, pos: 80 }],
  [{ angle: 150, pos: 42 }, { angle: 60, pos: 65 }, { angle: 10, pos: 22 }],
  [{ angle: 120, pos: 28 }, { angle: 50, pos: 78 }, { angle: 170, pos: 52 }],
  [{ angle: 140, pos: 60 }, { angle: 30, pos: 40 }, { angle: 100, pos: 85 }],
];

function ScrapPaper({ children, index = 0, className = "" }: { children: React.ReactNode; index?: number; className?: string }) {
  const rotation = ["-1.2deg", "0.8deg", "-0.6deg", "1.1deg", "-0.9deg"][index % 5];
  const styles: PaperStyle[] = ["lined", "grid", "pink", "yellow", "lined"];
  const style = styles[index % styles.length];
  const config = paperConfigs[style];
  const hasHoles = style === "lined" || style === "yellow";
  const { seed, freq, scale } = tornMaskParams[index % 5];
  const tornMask = makeTornMask(seed, freq, scale);
  const tapePositions = [
    [{ pos: "tl", rot: "-18deg" }, { pos: "br", rot: "15deg" }],
    [{ pos: "tr", rot: "22deg" }, { pos: "bl", rot: "-20deg" }],
    [{ pos: "tl", rot: "-25deg" }, { pos: "tr", rot: "18deg" }],
    [{ pos: "bl", rot: "-15deg" }, { pos: "tr", rot: "20deg" }],
    [{ pos: "tl", rot: "-20deg" }, { pos: "br", rot: "22deg" }],
  ][index % 5];

  const linesBg = config.lines
    ? `repeating-linear-gradient(transparent, transparent 27px, ${config.lineColor} 27px, ${config.lineColor} 28px)`
    : config.grid
    ? `repeating-linear-gradient(${config.lineColor} 0 1px, transparent 1px 28px), repeating-linear-gradient(90deg, ${config.lineColor} 0 1px, transparent 1px 28px)`
    : "";
  const marginLine = config.lines
    ? `linear-gradient(90deg, transparent 38px, #5a2a2a 38px, #5a2a2a 39px, transparent 39px)`
    : "";
  const combinedBg = [linesBg, marginLine].filter(Boolean).join(", ");

  return (
    <div className={`relative ${className}`} style={{ transform: `rotate(${rotation})` }}>
      {tapePositions.map((t, i) => (
        <Tape key={i} position={t.pos} colorClass={tapeColors[(index + i) % tapeColors.length]} rotation={t.rot} />
      ))}
      <div
        className="relative shadow-[0_8px_40px_rgba(0,0,0,0.7),0_2px_8px_rgba(0,0,0,0.4),0_20px_60px_rgba(0,0,0,0.3)]"
        style={{
          backgroundColor: config.bg,
          backgroundImage: combinedBg || undefined,
          maskImage: tornMask,
          WebkitMaskImage: tornMask,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
        }}
      >
        {hasHoles && <NotebookHoles />}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
        {wrinklePatterns[index % wrinklePatterns.length].map((w, i) => (
          <div key={i} className="absolute pointer-events-none" style={{ inset: 0, background: `linear-gradient(${w.angle}deg, transparent ${w.pos - 2}%, rgba(255,255,255,0.04) ${w.pos - 0.5}%, rgba(0,0,0,0.12) ${w.pos}%, rgba(255,255,255,0.03) ${w.pos + 0.5}%, transparent ${w.pos + 2}%)` }} />
        ))}
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.35), inset 0 0 80px rgba(0,0,0,0.15)" }} />
        {(index === 1 || index === 4) && (
          <div className="absolute pointer-events-none rounded-full" style={{ width: index === 1 ? 80 : 60, height: index === 1 ? 80 : 60, right: index === 1 ? 30 : "auto", left: index === 4 ? 40 : "auto", bottom: index === 1 ? 20 : "auto", top: index === 4 ? 15 : "auto", border: "2px solid rgba(90,60,30,0.08)", background: "radial-gradient(circle, transparent 60%, rgba(90,60,30,0.04) 70%, transparent 80%)" }} />
        )}
        {(index === 0 || index === 3) && (
          <div className="absolute pointer-events-none" style={{ ...(index === 0 ? { bottom: 0, right: 0 } : { top: 0, right: 0 }), width: 28, height: 28, background: `linear-gradient(${index === 0 ? 225 : 315}deg, rgba(255,255,255,0.04) 50%, rgba(0,0,0,0.1) 50%)` }} />
        )}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='w'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.015' numOctaves='3' seed='${index * 7}' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23w)'/%3E%3C/svg%3E")` }} />
        <div className={`relative ${hasHoles ? "pl-12 sm:pl-14" : "pl-8 sm:pl-12"} pr-8 sm:pr-12 py-8 sm:py-12 text-white`}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── FAQ accordion ─── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.08]">
      <button onClick={() => setOpen(!open)} className="w-full py-4 sm:py-5 flex items-center justify-between text-left gap-4">
        <span className="text-white/60 text-[13px] sm:text-[14px] leading-relaxed" style={serif}>{q}</span>
        <span className="text-[#f748b1]/50 text-[11px] shrink-0 transition-transform duration-300" style={{ transform: open ? "rotate(180deg)" : "none" }}>▼</span>
      </button>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? "200px" : "0", opacity: open ? 1 : 0 }}>
        <p className="text-white/30 text-[12px] sm:text-[13px] leading-relaxed pb-5" style={serif}>{a}</p>
      </div>
    </div>
  );
}

/* ═══ Lobby components ═══ */
type LobbyState = "landing" | "creating" | "lobby" | "pending";

function useCountdown() {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    function getNext() {
      const now = new Date();
      const pst = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
      const day = pst.getDay();
      let daysUntil = (4 - day + 7) % 7;
      if (daysUntil === 0 && pst.getHours() >= 19) daysUntil = 7;
      const target = new Date(pst);
      target.setDate(pst.getDate() + daysUntil);
      target.setHours(19, 0, 0, 0);
      return target.getTime() - pst.getTime();
    }
    const tick = () => {
      const ms = getNext();
      const s = Math.floor(ms / 1000);
      setTime({ d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/* Ditto-style countdown digit */
function CountdownDigit({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-1">
        {str.split("").map((ch, i) => (
          <div key={i} className="w-[28px] sm:w-[44px] h-[36px] sm:h-[56px] bg-[#2D3A4E] border-2 border-[#f748b1]/30 flex items-center justify-center"
            style={{ boxShadow: "0 0 8px #f748b115" }}>
            <span className="text-[16px] sm:text-[28px] tabular-nums countdown-glow" style={px}>{ch}</span>
          </div>
        ))}
      </div>
      <span className="text-[6px] sm:text-[7px] text-[#64748b] mt-1.5 uppercase tracking-widest" style={px}>{label}</span>
    </div>
  );
}

/* Clean slot card for inside ScrapPaper */
function SlotCard({ label, name, filled, color, onClick }: {
  label: string; name?: string | null; filled: boolean; color: string; onClick?: () => void;
}) {
  const isClickable = !filled && !!onClick;
  return (
    <div
      className={`flex flex-col items-center gap-2 w-[80px] sm:w-[100px] ${isClickable ? "cursor-pointer group" : ""}`}
      onClick={() => !filled && onClick?.()}
    >
      <div
        className={`w-full aspect-square flex items-center justify-center border transition-all duration-300 ${
          isClickable
            ? "border-[#f748b1]/40 bg-[#f748b1]/[0.05] group-hover:bg-[#f748b1]/[0.12] group-hover:border-[#f748b1]/70"
            : filled
            ? "bg-black/[0.12]"
            : "border-white/[0.08] bg-black/[0.08]"
        }`}
        style={{
          ...(filled ? { borderColor: `${color}55`, boxShadow: `0 0 16px ${color}25` } : {}),
          ...(isClickable ? { boxShadow: "0 0 20px rgba(247,72,177,0.18), 0 0 40px rgba(247,72,177,0.06)" } : {}),
        }}
      >
        {filled ? (
          <span className="text-[24px] sm:text-[28px]">{color === "#ec4899" ? "👩" : "🧑"}</span>
        ) : isClickable ? (
          <span className="text-[13px] sm:text-[14px] text-[#f748b1]/60 group-hover:text-[#f748b1] transition-colors font-bold" style={px}>claim</span>
        ) : (
          <span className="text-[20px] sm:text-[24px] text-white/[0.1]">?</span>
        )}
      </div>
      <span className="text-[8px] sm:text-[9px] text-center" style={{ ...px, color: filled ? `${color}cc` : isClickable ? "rgba(247,72,177,0.6)" : "rgba(255,255,255,0.2)" }}>
        {filled ? (name || label) : label}
      </span>
      {filled && (
        <div className="px-2 py-0.5 text-[6px] uppercase tracking-wider text-white/35 bg-white/[0.06]" style={px}>in</div>
      )}
    </div>
  );
}

/* ═══ Page ═══ */
export function BlindDatePage() {
  const navigate = useNavigate();
  const countdown = useCountdown();

  const [view, setView] = useState<LobbyState>("landing");
  const [lobbyCode, setLobbyCode] = useState("");
  const [mySide, setMySide] = useState<"guy" | "girl">("guy");
  const [, setMyName] = useState("");
  const [creating] = useState(false);
  const [slots, setSlots] = useState<{ label: string; name: string | null; filled: boolean; side: "guy" | "girl" }[]>([]);
  const [pendingSignup, setPendingSignup] = useState<{ name: string; code: string; gender: string } | null>(null);
  const [createData, setCreateData] = useState({ name: "", phone: "", role: "" as "guy" | "girl" | "" });
  const [createError, setCreateError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("ditto-user");
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (user.name && user.teamCode) {
          setMyName(user.name);
          setLobbyCode(user.teamCode);
          setView("lobby");
          setSlots([
            { label: "YOU", name: user.name, filled: true, side: "guy" },
            { label: "FRIEND", name: null, filled: false, side: "guy" },
            { label: "???", name: null, filled: false, side: "girl" },
            { label: "???", name: null, filled: false, side: "girl" },
          ]);
          return;
        }
      } catch { /* ignore */ }
    }
    const pending = localStorage.getItem("ditto-pending-signup");
    if (pending) {
      try {
        const data = JSON.parse(pending);
        if (data.name && data.code) {
          setPendingSignup(data);
          setMyName(data.name);
        }
      } catch { /* ignore */ }
    }
  }, []);

  const handleCreate = () => {
    const { name, phone, role } = createData;
    if (!name.trim() || !phone.trim()) { setCreateError("enter your name and phone"); return; }
    if (!role) { setCreateError("are you a guy or girl?"); return; }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const otherSide = role === "guy" ? "girl" : "guy";
    setLobbyCode(code);
    setMySide(role);
    setMyName(name.trim());
    setSlots([
      { label: "YOU", name: name.trim(), filled: true, side: role },
      { label: "FRIEND", name: null, filled: false, side: role },
      { label: "???", name: null, filled: false, side: otherSide },
      { label: "???", name: null, filled: false, side: otherSide },
    ]);
    setView("lobby");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/party/${lobbyCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fmt = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  };

  const inputClass = "w-full px-4 py-3 border border-white/10 bg-black/20 text-white text-[12px] placeholder:text-white/20 focus:outline-none focus:border-white/25 transition";

  return (
    <div className="min-h-screen relative" style={px}>

      {/* SVG filters */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="rough">
            <feTurbulence type="fractalNoise" baseFrequency="0.065" numOctaves="3" seed="8" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Ditto screen effects */}
      <div className="screen-vignette" />

      {/* Background — fixed, covers full page */}
      <div className="fixed inset-0 z-0">
        <img src="/la-night-clean.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: "blur(10px)", transform: "scale(1.04)" }} />
        <div className="absolute inset-0" style={{ background: "rgba(8,14,30,0.55)" }} />
      </div>

      {/* Copied toast */}
      {copied && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-fade-up">
          <div className="px-5 py-3 border-4 border-[#00e436] bg-[#2B3548]">
            <p className="text-[#00e436] text-[9px] sm:text-[11px] uppercase tracking-widest" style={px}>INVITE LINK COPIED!</p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <button
            onClick={() => { setView("landing"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <img src="/ditto-logo-white.webp" alt="Ditto" className="h-5 sm:h-6" />
          </button>
          <div className="flex items-center gap-2">
            {lobbyCode && (
              <>
                <span className="text-[#ffec27] text-[8px] sm:text-[10px] tracking-wider" style={px}>{lobbyCode}</span>
                <div className="w-2 h-2 bg-[#00e436] animate-pulse" />
              </>
            )}
            <button
              onClick={() => navigate("/signin")}
              className="inline-flex items-center justify-center h-9 px-4 text-white text-[13px] rounded-full transition-all hover:bg-white/20"
              style={{ background: "rgba(255,255,255,0.1)", boxShadow: "0 0 15px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.1)" }}
            >
              Log In
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center justify-center h-9 px-4 text-[#f748b1] text-[13px] font-semibold rounded-full transition-all hover:opacity-90 active:scale-[0.97]"
              style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 0 20px rgba(247,72,177,0.25)" }}
            >
              Join Now
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-4 sm:px-6 py-20">

        <div className="relative z-10 stagger-in w-full max-w-4xl mx-auto">

          {/* Headline */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-[52px] sm:text-[85px] lg:text-[110px] leading-none tracking-[0.02em] text-[#f748b1]" style={bitter}>
              double the date
            </h1>
            <p className="mt-3 sm:mt-4 text-white text-[18px] sm:text-[28px] lg:text-[34px] leading-[1.3]" style={serif}>
              every thursday
            </p>
            <p className="mt-2 sm:mt-3 text-[#ffec27]/80 text-[11px] sm:text-[14px] tracking-wide" style={px}>
              you + your friend{" "}
              <span className="text-[#f748b1]" style={bitter}>×</span>
              {" "}a mystery duo
            </p>
          </div>

          {/* Lobby — in ScrapPaper */}
          <div className="max-w-2xl mx-auto">

            {view === "landing" && (
              <ScrapPaper index={3}>
                {/* Mobile: 2×2 grid (guy/girl per row). Desktop: horizontal [your duo] x [mystery duo] */}

                {/* Desktop layout */}
                <div className="hidden sm:flex items-start justify-center gap-6">
                  <div className="text-center flex-1">
                    <p className="text-[#6366f1] text-[11px] mb-3 uppercase tracking-wider font-bold" style={px}>your duo</p>
                    <div className="flex justify-center gap-4">
                      {pendingSignup ? (
                        <div className="flex flex-col items-center gap-2 w-[100px] cursor-pointer"
                          onClick={() => navigate(`/signup?code=${pendingSignup.code}`)}>
                          <div className="w-full aspect-square border border-yellow-400/40 bg-black/10 flex items-center justify-center">
                            <span className="text-[22px]">✓</span>
                          </div>
                          <span className="text-[8px] text-yellow-600" style={px}>{pendingSignup.name.split(" ")[0]}</span>
                          <span className="text-[6px] text-yellow-700/70 uppercase tracking-wider" style={px}>sign up</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 w-[100px] cursor-pointer group"
                          onClick={() => navigate("/signup")}>
                          <div className="w-full aspect-square border border-[#ec4899]/30 bg-black/10 flex items-center justify-center group-hover:border-[#ec4899]/60 transition-colors">
                            <span className="text-[22px] text-[#ec4899]/50 group-hover:text-[#ec4899] transition-colors">▶</span>
                          </div>
                          <span className="text-[8px] text-[#ec4899]/70 font-bold" style={px}>sign up</span>
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-2 w-[100px]">
                        <div className="w-full aspect-square border border-white/[0.07] bg-black/[0.06] flex items-center justify-center">
                          <span className="text-[24px] text-white/[0.1]">+</span>
                        </div>
                        <span className="text-[8px] text-white/25" style={px}>friend</span>
                      </div>
                    </div>
                  </div>
                  <div className="self-center pt-6 px-1">
                    <span className="text-[28px] text-[#f748b1]/50 italic" style={bitter}>x</span>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-[#ec4899] text-[11px] mb-3 uppercase tracking-wider font-bold" style={px}>mystery duo</p>
                    <div className="flex justify-center gap-4">
                      {[1, 2].map(i => (
                        <div key={i} className="flex flex-col items-center gap-2 w-[100px]">
                          <div className="w-full aspect-square border border-[#ec4899]/15 bg-black/[0.06] flex items-center justify-center">
                            <span className="text-[26px] text-[#ec4899]/20">?</span>
                          </div>
                          <span className="text-[8px] text-white/20" style={px}>???</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile layout: 2×2 grid */}
                <div className="sm:hidden">
                  <div className="grid grid-cols-2 gap-x-4 mb-3">
                    <p className="text-[#6366f1] text-[9px] uppercase tracking-wider font-bold text-center" style={px}>your duo</p>
                    <p className="text-[#ec4899] text-[9px] uppercase tracking-wider font-bold text-center" style={px}>mystery duo</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4 justify-items-center">
                    {pendingSignup ? (
                      <div className="flex flex-col items-center gap-2 w-[80px] cursor-pointer"
                        onClick={() => navigate(`/signup?code=${pendingSignup.code}`)}>
                        <div className="w-full aspect-square border border-yellow-400/40 bg-black/10 flex items-center justify-center">
                          <span className="text-[22px]">✓</span>
                        </div>
                        <span className="text-[8px] text-yellow-600" style={px}>{pendingSignup.name.split(" ")[0]}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 w-[80px] cursor-pointer group"
                        onClick={() => navigate("/signup")}>
                        <div className="w-full aspect-square border border-[#ec4899]/30 bg-black/10 flex items-center justify-center group-hover:border-[#ec4899]/60 transition-colors">
                          <span className="text-[18px] text-[#ec4899]/50 group-hover:text-[#ec4899] transition-colors">▶</span>
                        </div>
                        <span className="text-[8px] text-[#ec4899]/70 font-bold" style={px}>sign up</span>
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-2 w-[80px]">
                      <div className="w-full aspect-square border border-[#ec4899]/15 bg-black/[0.06] flex items-center justify-center">
                        <span className="text-[22px] text-[#ec4899]/20">?</span>
                      </div>
                      <span className="text-[8px] text-white/20" style={px}>???</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-[80px]">
                      <div className="w-full aspect-square border border-white/[0.07] bg-black/[0.06] flex items-center justify-center">
                        <span className="text-[20px] text-white/[0.1]">+</span>
                      </div>
                      <span className="text-[8px] text-white/25" style={px}>+ friend</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-[80px]">
                      <div className="w-full aspect-square border border-[#ec4899]/15 bg-black/[0.06] flex items-center justify-center">
                        <span className="text-[22px] text-[#ec4899]/20">?</span>
                      </div>
                      <span className="text-[8px] text-white/20" style={px}>???</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/[0.07] text-center">
                  {pendingSignup ? (
                    <>
                      <p className="text-white/35 text-[11px]" style={serif}>sign up to finish your registration</p>
                      <p className="text-[18px] tracking-[0.3em] text-yellow-500/60 font-mono select-all mt-1">{pendingSignup.code}</p>
                    </>
                  ) : (
                    <p className="text-white/50 text-[12px] sm:text-[14px] leading-relaxed" style={serif}>
                      grab a friend.{" "}
                      <span className="text-[#f748b1]">claim your spot before thursday.</span>
                    </p>
                  )}
                </div>
              </ScrapPaper>
            )}

            {view === "creating" && (
              <ScrapPaper index={3}>
                <h2 className="text-[16px] sm:text-[20px] text-white mb-1 text-center" style={serif}>start a lobby</h2>
                <p className="text-white/30 text-[11px] mb-6 text-center" style={serif}>enter your info to create a party</p>
                <div className="space-y-3">
                  <input type="text" value={createData.name} onChange={e => setCreateData(d => ({ ...d, name: e.target.value }))} placeholder="name" className={inputClass} style={px} />
                  <input type="tel" value={createData.phone} onChange={e => setCreateData(d => ({ ...d, phone: fmt(e.target.value) }))} placeholder="phone" className={inputClass} style={px} />
                  <div className="flex gap-2">
                    {(["guy", "girl"] as const).map(role => (
                      <button key={role} onClick={() => setCreateData(d => ({ ...d, role }))}
                        className="flex-1 py-3 text-[11px] border transition"
                        style={{
                          ...px,
                          borderColor: createData.role === role ? (role === "guy" ? "#6366f1" : "#ec4899") : "rgba(255,255,255,0.1)",
                          background: createData.role === role ? (role === "guy" ? "rgba(99,102,241,0.15)" : "rgba(236,72,153,0.15)") : "transparent",
                          color: createData.role === role ? (role === "guy" ? "#818cf8" : "#f472b6") : "rgba(255,255,255,0.35)",
                        }}>
                        {role}
                      </button>
                    ))}
                  </div>
                  {createError && <p className="text-[11px] text-red-400/70 text-center" style={px}>{createError}</p>}
                  <button onClick={handleCreate} disabled={creating}
                    className="w-full py-3 border border-[#f748b1]/40 text-[#f748b1]/80 text-[11px] hover:bg-[#f748b1]/10 transition disabled:opacity-40"
                    style={px}>
                    {creating ? "loading..." : "create party"}
                  </button>
                  <button onClick={() => setView("landing")} className="w-full py-2 text-white/20 text-[10px] hover:text-white/35 transition" style={px}>back</button>
                </div>
              </ScrapPaper>
            )}

            {view === "lobby" && (
              <>
                <ScrapPaper index={3}>
                  {/* Desktop: horizontal [your duo] x [mystery duo] */}
                  <div className="hidden sm:flex items-start justify-center gap-6">
                    <div className="text-center flex-1">
                      <p className="text-[11px] mb-3 uppercase tracking-wider font-bold" style={{ ...px, color: mySide === "guy" ? "#818cf8" : "#ec4899" }}>your duo</p>
                      <div className="flex justify-center gap-4">
                        {slots.filter(s => s.side === mySide).map((s, i) => (
                          <SlotCard key={i} label={s.label} name={s.name} filled={s.filled}
                            color={mySide === "guy" ? "#818cf8" : "#ec4899"} onClick={!s.filled ? copyLink : undefined} />
                        ))}
                      </div>
                    </div>
                    <div className="self-center pt-6 px-1">
                      <span className="text-[28px] text-[#f748b1]/50 italic" style={bitter}>x</span>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-white/30 text-[11px] mb-3 uppercase tracking-wider font-bold" style={px}>mystery duo</p>
                      <div className="flex justify-center gap-4">
                        {slots.filter(s => s.side !== mySide).map((s, i) => (
                          <SlotCard key={i} label={s.label} name={s.name} filled={s.filled}
                            color={mySide === "guy" ? "#ec4899" : "#818cf8"} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mobile: 2×2 grid */}
                  <div className="sm:hidden">
                    <div className="grid grid-cols-2 gap-x-4 mb-3">
                      <p className="text-[9px] uppercase tracking-wider font-bold text-center" style={{ ...px, color: mySide === "guy" ? "#818cf8" : "#ec4899" }}>your duo</p>
                      <p className="text-white/30 text-[9px] uppercase tracking-wider font-bold text-center" style={px}>mystery duo</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4 justify-items-center">
                      {slots.filter(s => s.side === mySide).map((s, i) => {
                        const ms = slots.filter(ms => ms.side !== mySide)[i];
                        return [
                          <SlotCard key={`my-${i}`} label={s.label} name={s.name} filled={s.filled}
                            color={mySide === "guy" ? "#818cf8" : "#ec4899"} onClick={!s.filled ? copyLink : undefined} />,
                          ms ? <SlotCard key={`m-${i}`} label={ms.label} name={ms.name} filled={ms.filled}
                            color={mySide === "guy" ? "#ec4899" : "#818cf8"} /> : <div key={`empty-${i}`} />,
                        ];
                      })}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/[0.07] text-center">
                    {slots.find(s => s.side === mySide && !s.filled)
                      ? <p className="text-white/30 text-[12px]" style={serif}>invite your friend — <span className="text-[#ffec27]/60">we'll match you thursday.</span></p>
                      : <p className="text-white/40 text-[12px]" style={serif}>duo complete — waiting for the thursday drop</p>}
                  </div>
                </ScrapPaper>

                <div className="mt-6 text-center">
                  <p className="text-[#64748b] text-[7px] sm:text-[8px] mb-2 uppercase tracking-widest" style={px}>send this to your friend</p>
                  <p className="text-[20px] sm:text-[28px] tracking-[0.35em] text-[#6366f1] select-all mb-3 font-mono">{lobbyCode}</p>
                  <button onClick={copyLink}
                    className="px-6 py-3 border-4 border-[#ffec27] bg-[#ffec27] text-[#111827] text-[9px] sm:text-[11px] hover:bg-white hover:border-white active:translate-y-[1px] transition-none"
                    style={{ boxShadow: "4px 4px 0 #a38a1a", ...px }}>
                    {copied ? "COPIED!" : "COPY INVITE LINK"}
                  </button>
                </div>
              </>
            )}

            {view === "pending" && pendingSignup && (
              <ScrapPaper index={3}>
                <p className="text-white/35 text-[12px] mb-3 text-center" style={serif}>sign up to finish your registration</p>
                <p className="text-[20px] sm:text-[24px] tracking-[0.3em] text-yellow-500/60 font-mono select-all text-center mb-6">{pendingSignup.code}</p>
                <div className="text-center">
                  <button onClick={() => navigate(`/signup?code=${pendingSignup.code}`)}
                    className="inline-flex items-center px-8 py-3 bg-white hover:bg-white/90 transition rounded-full">
                    <span className="text-black text-[13px] font-semibold" style={px}>Complete Sign Up →</span>
                  </button>
                </div>
              </ScrapPaper>
            )}

          </div>

          {/* Countdown */}
          <div className="mt-7 sm:mt-10">
            <p className="text-white/30 text-[9px] sm:text-[10px] text-center uppercase tracking-[0.3em] mb-3" style={px}>next drop in</p>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <CountdownDigit value={countdown.d} label="days" />
              <span className="text-[#f748b1] text-[14px] sm:text-[22px] self-start mt-1 animate-pulse">:</span>
              <CountdownDigit value={countdown.h} label="hrs" />
              <span className="text-[#f748b1] text-[14px] sm:text-[22px] self-start mt-1 animate-pulse">:</span>
              <CountdownDigit value={countdown.m} label="min" />
              <span className="text-[#f748b1] text-[14px] sm:text-[22px] self-start mt-1 animate-pulse">:</span>
              <CountdownDigit value={countdown.s} label="sec" />
            </div>
            <p className="mt-2.5 text-[#ffec27]/40 text-[7px] sm:text-[8px] text-center uppercase tracking-widest" style={px}>thursday 7 pm pst · new matches every week</p>
          </div>

        </div>
      </section>

      {/* ─── Scroll sections ─── */}
      <div className="relative">

        {/* Marquee */}
        <div className="border-y border-white/[0.04] py-3 overflow-hidden" style={{ background: "rgba(8,14,30,0.6)" }}>
          <div className="flex whitespace-nowrap animate-[marquee_18s_linear_infinite]">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="text-white/[0.1] text-[11px] uppercase tracking-[0.2em] mx-6" style={px}>
                double dates only &nbsp;✦&nbsp; no apps &nbsp;✦&nbsp; every thursday &nbsp;✦&nbsp; bring a friend &nbsp;✦&nbsp; get matched
              </span>
            ))}
          </div>
        </div>

        {/* ─── How to play ─── */}
        <motion.section
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="relative py-20 sm:py-32 px-5 sm:px-6"
          style={{
            backgroundImage: "url(/shadows.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}>
          {/* Dark tint overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(8,14,30,0.88), rgba(8,14,30,0.72), rgba(8,14,30,0.88))" }} />
          <div className="relative z-10">
          <ScrapPaper index={0} className="max-w-4xl mx-auto">
            <h2 className="text-center text-[22px] sm:text-[36px] font-bold text-white mb-2" style={serif}>how to play</h2>
            <p className="text-center text-[9px] sm:text-[10px] mb-14 sm:mb-20 tracking-[0.3em] text-[#f748b1]/60 uppercase" style={px}>— select stage —</p>
            <div className="space-y-12 sm:space-y-20">
              {[
                { n: "01", title: "sign up", desc: "fill out the form and invite a friend as your duo", color: "#f748b1", img: "/dinner.jpg" },
                { n: "02", title: "invite your duo", desc: "forward the invite link to your friend", color: "#818cf8", img: "/happy.jpg" },
                { n: "03", title: "the thursday drop", desc: "we match your duo with another duo every thursday at 7 PM", color: "#fde047", img: "/japanesedinner.jpg" },
                { n: "04", title: "show up", desc: "4 people, 1 night. zero awkwardness.", color: "#4ade80", img: null },
              ].map((step, i) => (
                <div key={step.n} className={`flex flex-col sm:flex-row items-center gap-6 sm:gap-14 ${i % 2 === 1 ? "sm:flex-row-reverse" : ""}`}>
                  {step.img && (
                    <div className="shrink-0 w-[110px] h-[110px] sm:w-[180px] sm:h-[180px] overflow-hidden" style={{ border: `2px solid ${step.color}55` }}>
                      <img src={step.img} alt={step.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-3 mb-2 sm:mb-3">
                      <span className="text-[28px] sm:text-[40px] font-bold tabular-nums" style={{ color: step.color, ...px }}>{step.n}</span>
                      <div className="h-px flex-1 hidden sm:block" style={{ background: `${step.color}30` }} />
                    </div>
                    <h3 className="text-[17px] sm:text-[24px] font-semibold text-white mb-2" style={serif}>{step.title}</h3>
                    <p className="text-white/40 text-[13px] sm:text-[15px] leading-relaxed" style={serif}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrapPaper>
          </div>
        </motion.section>

        {/* ─── FAQ + CTA on griffith.jpg fixed bg ─── */}
        <div className="relative"
          style={{
            backgroundImage: "url(/griffith.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(8,14,30,0.85), rgba(8,14,30,0.7), rgba(8,14,30,0.88))" }} />

          {/* ─── FAQ ─── */}
          <motion.section
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="relative z-10 py-14 sm:py-24 px-5 sm:px-6">
            <ScrapPaper index={4} className="max-w-2xl mx-auto">
              <p className="text-[20px] text-white/30 mb-8" style={{ fontFamily: "Caveat, cursive" }}>FAQ</p>
              <FaqItem q="How does it work?" a="You and a friend sign up as a duo. Every Thursday we match your duo with another duo and plan the double date — all through this platform." />
              <FaqItem q="Do I need an app?" a="No. Everything happens right here on this website." />
              <FaqItem q="Do I need a teammate?" a="Yes — grab a friend and sign up together. That's the whole point." />
              <FaqItem q="What if we don't like our match?" a="Reply 'no'. Both duos go back in the pool for next week." />
              <FaqItem q="Is it free?" a="Yes." />
            </ScrapPaper>
          </motion.section>

          {/* ─── CTA ─── */}
          <motion.section
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="relative z-10 py-20 sm:py-32 px-5 sm:px-6 text-center">
          <ScrapPaper index={2} className="max-w-4xl mx-auto">

            <div className="flex items-end justify-center gap-4 sm:gap-6 mb-10 sm:mb-14">
              <div className="shrink-0" style={{ transform: "rotate(-6deg) translateY(8px)" }}>
                <div className="bg-white p-2 pb-6" style={{ width: 100, boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
                  <img src="/happy.jpg" alt="" className="w-full object-cover" style={{ height: 82, display: "block" }} />
                </div>
              </div>
              <div className="shrink-0 relative" style={{ transform: "rotate(2deg)" }}>
                <div className="bg-white p-2 pb-7" style={{ width: 130, boxShadow: "0 12px 40px rgba(0,0,0,0.7)" }}>
                  <img src="/dinner.jpg" alt="" className="w-full object-cover" style={{ height: 108, display: "block" }} />
                </div>
                <svg className="absolute -right-5 -bottom-4 w-9 h-9" viewBox="0 0 40 38" fill="none" style={{ transform: "rotate(-8deg)" }}>
                  <path d="M20 34 C18 31, 6 24, 4 17 C2 11, 5 5, 10 4 C13 3, 17 5, 20 9 C23 5, 27 3, 30 4 C35 5, 38 11, 36 17 C34 24, 22 31, 20 34 Z"
                    stroke="#f748b1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
                    style={{ filter: "url(#rough)" }} />
                </svg>
              </div>
              <div className="shrink-0" style={{ transform: "rotate(7deg) translateY(6px)" }}>
                <div className="bg-white p-2 pb-6" style={{ width: 100, boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
                  <img src="/couple.jpg" alt="" className="w-full object-cover" style={{ height: 82, display: "block" }} />
                </div>
              </div>
            </div>

            <p className="text-[26px] sm:text-[40px] lg:text-[52px] text-white font-light leading-[1.2]" style={serif}>
              you don't swipe.<br />
              <span style={{ background: "linear-gradient(90deg, #f748b1, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                you squad up.
              </span>
            </p>

            <div className="mt-8 sm:mt-12">
              <button
                onClick={() => navigate("/signup")}
                className="inline-flex items-center px-8 sm:px-10 py-3.5 sm:py-4 bg-white hover:bg-gray-100 active:scale-[0.98] transition-transform"
                style={{ borderRadius: "50px", boxShadow: "0 0 40px rgba(247,72,177,0.3), 0 0 80px rgba(139,92,246,0.15)" }}
              >
                <span className="text-[#111827] text-[14px] sm:text-[16px] font-bold" style={px}>Sign Up →</span>
              </button>
            </div>

          </ScrapPaper>
          </motion.section>

        </div>{/* end griffith bg */}

        {/* Footer */}
        <footer className="relative border-t border-white/[0.06]">
          <img src="/griffith.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: "blur(18px)", transform: "scale(1.06)" }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(8,14,30,0.88)" }} />
          <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6 pt-16 sm:pt-20 pb-12 sm:pb-16">

            {/* Top row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10 sm:gap-0 mb-14 sm:mb-16">

              {/* Brand */}
              <div>
                <img src="/ditto-logo-white.webp" alt="Ditto" className="h-6 sm:h-7 mb-3 opacity-80" />
                <p className="text-white/35 text-[12px] sm:text-[13px] max-w-[220px] leading-relaxed" style={serif}>
                  blind double dates, every thursday. no apps, no swiping.
                </p>
              </div>

              {/* CTA */}
              <div className="flex flex-col items-start sm:items-end gap-3">
                <p className="text-white/40 text-[11px] sm:text-[12px]" style={serif}>ready to double up?</p>
                <button
                  onClick={() => navigate("/signup")}
                  className="inline-flex items-center px-7 py-3 bg-white hover:bg-gray-100 active:scale-[0.98] transition-transform"
                  style={{ borderRadius: "50px", boxShadow: "0 0 30px rgba(247,72,177,0.25)" }}
                >
                  <span className="text-[#111827] text-[13px] font-bold" style={px}>Sign Up →</span>
                </button>
              </div>
            </div>

            {/* Links row */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 mb-12">
              {[
                { label: "how it works", action: () => document.querySelector(".how-section")?.scrollIntoView({ behavior: "smooth" }) },
                { label: "faq", action: () => document.querySelector(".faq-section")?.scrollIntoView({ behavior: "smooth" }) },
                { label: "sign in", action: () => navigate("/signin") },
                { label: "sign up", action: () => navigate("/signup") },
              ].map(l => (
                <button key={l.label} onClick={l.action}
                  className="text-white/25 hover:text-white/60 text-[11px] sm:text-[12px] uppercase tracking-widest transition-colors"
                  style={px}>
                  {l.label}
                </button>
              ))}
            </div>

            {/* Bottom */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-6 border-t border-white/[0.05]">
              <p className="text-white/15 text-[10px]" style={px}>© 2026 ditto. all rights reserved.</p>
              <p className="text-white/10 text-[9px] uppercase tracking-widest" style={px}>every thursday · 7 pm pst</p>
            </div>

          </div>
        </footer>

      </div>
    </div>
  );
}
