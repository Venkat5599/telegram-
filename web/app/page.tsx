import { TELEGRAM_DEEPLINK, API_BASE } from "@/lib/config";
import { Reveal } from "./reveal";

// Always render fresh — this is a live stats page; judges must see current data.
export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const res = await fetch(`${API_BASE}/score`, { cache: "no-store" });
    if (!res.ok) throw new Error("bad");
    return (await res.json()) as {
      accuracy: string;
      wins: number;
      total: number;
      live: number;
    };
  } catch {
    return { accuracy: "—", wins: 0, total: 0, live: 0 };
  }
}

const CHAPTERS = [
  {
    n: "01",
    t: "Proprietary data",
    d: "We run our own Mantle indexer — decoding RWA & LST flows (mETH, fBTC, MI4, USDY) wallet by wallet. Data others can't pull from an API.",
  },
  {
    n: "02",
    t: "Novel signals",
    d: "Smart-money rotation between protocols, mint/redeem divergence, first-touch bridge capital. Each one written in plain English with a confidence score.",
  },
  {
    n: "03",
    t: "Verifiable on-chain",
    d: "Every signal is committed to Mantle before its outcome. The track record resolves on-chain — provable alpha, not marketing.",
  },
  {
    n: "04",
    t: "Telegram-native",
    d: "No app, no signup. One tap opens the bot. Type /alpha and the Mantle economy reads itself to you.",
  },
];

export default async function Home() {
  const stats = await getStats();

  return (
    <main className="relative">
      {/* fluid island nav */}
      <nav className="fixed inset-x-0 top-5 z-40 flex justify-center px-4">
        <div className="flex items-center gap-5 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 backdrop-blur-2xl">
          <span className="font-display text-sm font-semibold tracking-tight">
            <span style={{ color: "var(--acid)" }}>◆</span> VERITAS
          </span>
          <span className="hidden text-[11px] text-white/40 sm:inline">
            <span className="live-dot" style={{ color: "var(--acid)" }}>
              ●
            </span>{" "}
            indexing Mantle
          </span>
          <a
            href={TELEGRAM_DEEPLINK}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold text-black transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04] active:scale-95"
          >
            Launch
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative mesh gridlines min-h-[100dvh] overflow-hidden">
        <div className="mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-center px-6 pt-28">
          <Reveal delay={0.1} immediate>
            <span className="inline-block rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/60">
              Mantle Turing Test · AI Alpha &amp; Data
            </span>
          </Reveal>

          <Reveal delay={0.25} y={60} immediate>
            <h1 className="font-display mt-7 text-[15vw] font-semibold uppercase leading-[0.84] tracking-[-0.03em] sm:text-[12vw] lg:text-[9.5rem]">
              Verifiable
              <br />
              <span style={{ color: "var(--acid)" }}>Alpha</span>
            </h1>
          </Reveal>

          <Reveal delay={0.5} immediate className="mt-8 max-w-xl">
            <p className="text-base leading-relaxed text-white/55">
              The Nansen for Mantle&apos;s RWA &amp; LST economy. Proprietary
              on-chain intelligence — every signal committed to the chain{" "}
              <em className="text-white/80">before</em> the outcome. A track
              record that can&apos;t be faked.
            </p>
          </Reveal>

          {/* THE button — button-in-button, opens Telegram */}
          <Reveal delay={0.65} immediate className="mt-10">
            <a
              href={TELEGRAM_DEEPLINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-4 rounded-full bg-[var(--acid)] py-3 pl-7 pr-3 text-black transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="font-display text-lg font-semibold">
                Open Veritas in Telegram
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/15 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:-translate-y-[2px] group-hover:scale-105">
                <TelegramGlyph />
              </span>
            </a>
            <p className="mt-3 text-xs text-white/40">
              One tap → start the bot → type{" "}
              <code style={{ color: "var(--acid)" }}>/alpha</code>
            </p>
          </Reveal>
        </div>

        {/* scrolling ticker */}
        <div className="absolute bottom-0 w-full overflow-hidden border-t border-white/5 py-3">
          <div className="marquee flex w-max gap-10 whitespace-nowrap text-xs uppercase tracking-[0.3em] text-white/25">
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k} className="flex gap-10">
                <span>mETH flows</span><span>·</span>
                <span>smart-money rotation</span><span>·</span>
                <span>on-chain proof</span><span>·</span>
                <span>fBTC mint/redeem</span><span>·</span>
                <span>bridge intelligence</span><span>·</span>
                <span>verifiable alpha</span><span>·</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE PROOF — double bezel */}
      <section className="mx-auto max-w-6xl px-6 py-28">
        <Reveal>
          <p className="font-display text-sm uppercase tracking-[0.25em] text-white/40">
            Live · resolved on-chain
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-2">
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[calc(2rem-0.5rem)] sm:grid-cols-3">
              <Stat label="Verified accuracy" value={`${stats.accuracy}%`} accent />
              <Stat label="Signals resolved" value={`${stats.total}`} />
              <Stat label="Live now" value={`${stats.live}`} />
            </div>
          </div>
        </Reveal>
      </section>

      {/* CHAPTERS — editorial numbered reveal */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        {CHAPTERS.map((c, i) => (
          <Reveal key={c.n} delay={0.05}>
            <div className="grid grid-cols-1 gap-6 border-t border-white/10 py-14 md:grid-cols-12 md:items-baseline">
              <div
                className="font-display text-sm md:col-span-2"
                style={{ color: "var(--acid)" }}
              >
                {c.n}
              </div>
              <h2 className="font-display text-4xl font-semibold tracking-tight md:col-span-5 lg:text-5xl">
                {c.t}
              </h2>
              <p className="text-white/55 md:col-span-5">{c.d}</p>
            </div>
          </Reveal>
        ))}
      </section>

      {/* CLOSING CTA */}
      <section className="relative mesh overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 py-40 text-center">
          <Reveal>
            <h2 className="font-display text-[12vw] font-semibold uppercase leading-[0.85] tracking-[-0.03em] lg:text-8xl">
              Read the
              <br />
              <span style={{ color: "var(--acid)" }}>chain</span> yourself
            </h2>
          </Reveal>
          <Reveal delay={0.2} className="mt-12">
            <a
              href={TELEGRAM_DEEPLINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-4 rounded-full bg-[var(--acid)] py-4 pl-8 pr-4 text-black transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="font-display text-xl font-semibold">
                Launch the bot
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/15 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:-translate-y-[2px] group-hover:scale-105">
                <TelegramGlyph />
              </span>
            </a>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-xs text-white/40 sm:flex-row sm:justify-between">
          <span>Veritas · built on Mantle · verifiable smart-money intel</span>
          <a href={TELEGRAM_DEEPLINK} className="hover:text-[var(--acid)]">
            @Subheeksh_bot ↗
          </a>
        </div>
      </footer>
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-black/40 px-6 py-10 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
      <div
        className="font-display text-5xl font-semibold tracking-tight"
        style={accent ? { color: "var(--acid)" } : { color: "#fff" }}
      >
        {value}
      </div>
      <div className="mt-2 text-xs uppercase tracking-[0.15em] text-white/40">
        {label}
      </div>
    </div>
  );
}

function TelegramGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21.94 4.3 18.7 19.6c-.24 1.08-.88 1.35-1.78.84l-4.92-3.63-2.37 2.28c-.26.26-.48.48-.99.48l.35-5.02L18.1 6.1c.4-.35-.09-.55-.62-.2L6.43 13.06l-4.85-1.52c-1.05-.33-1.07-1.05.22-1.55l18.95-7.3c.88-.32 1.65.2 1.19 1.61Z" />
    </svg>
  );
}
