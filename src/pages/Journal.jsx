import React, { useEffect, useMemo, useState } from "react";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  ExternalLink,
  Save,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useSupabaseTrades } from "../lib/useSupabaseTrades";
import {
  NeonParticles,
  FieldShell,
  ImageLightbox,
  TextAreaAuto,
  ReactiveNeonUnderline,
} from "../components/journal/JournalPieces";

/* -------------------------------------------------------------------------- */
/*                                JOURNAL PAGE                                */
/* -------------------------------------------------------------------------- */

export default function Journal() {
  const [user, setUser] = useState(null);
  const [tradesByDate, setTradesByDate] = useState({});
  const { trades, saveTrade, syncStatus } = useSupabaseTrades(user?.id);
  const [refetchFlag, setRefetchFlag] = useState(0);

  // form state
  const [date, setDate] = useState("");
  const [pair, setPair] = useState("");
  const [entryTime, setEntryTime] = useState("");
  const [exitTime, setExitTime] = useState("");
  const [balanceBefore, setBalanceBefore] = useState("");
  const [balanceAfter, setBalanceAfter] = useState("");
  const [amountRisked, setAmountRisked] = useState("");
  const [finalRR, setFinalRR] = useState("");
  const [confluences, setConfluences] = useState("");
  const [doneRight, setDoneRight] = useState("");
  const [doneWrong, setDoneWrong] = useState("");
  const [whatToDo, setWhatToDo] = useState("");

  // files / previews
  const [entryChartFile, setEntryChartFile] = useState(null);
  const [entryChartPreview, setEntryChartPreview] = useState(null);
  const [htfChartFile, setHtfChartFile] = useState(null);
  const [htfChartPreview, setHtfChartPreview] = useState(null);

  const [lightboxSrc, setLightboxSrc] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    fetchUser();
  }, []);

  // sync trades snapshot
  useEffect(() => {
    if (Object.keys(trades || {}).length > 0) {
      setTradesByDate(trades);
      localStorage.setItem("trades", JSON.stringify(trades));
    } else {
      const saved = localStorage.getItem("trades");
      if (saved) setTradesByDate(JSON.parse(saved));
    }
  }, [trades, refetchFlag]);

  // previews
  useEffect(() => {
    if (!entryChartFile) return setEntryChartPreview(null);
    const r = new FileReader();
    r.onload = () => setEntryChartPreview(r.result);
    r.readAsDataURL(entryChartFile);
  }, [entryChartFile]);

  useEffect(() => {
    if (!htfChartFile) return setHtfChartPreview(null);
    const r = new FileReader();
    r.onload = () => setHtfChartPreview(r.result);
    r.readAsDataURL(htfChartFile);
  }, [htfChartFile]);

  // math
  const pnl = useMemo(() => {
    const before = parseFloat(balanceBefore || 0);
    const after = parseFloat(balanceAfter || 0);
    return after - before;
  }, [balanceBefore, balanceAfter]);

  useEffect(() => {
    const risk = parseFloat(amountRisked || 0);
    if (risk > 0) setFinalRR((pnl / risk).toFixed(2));
    else setFinalRR("");
  }, [pnl, amountRisked]);

  const flatFeed = useMemo(
    () =>
      Object.entries(tradesByDate)
        .flatMap(([d, list]) =>
          Array.isArray(list) ? list.map((t) => ({ ...t, date: d })) : []
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [tradesByDate]
  );

  async function handleAddEntry() {
    if (!date || !pair) {
      alert("Please provide at least Date and Pair.");
      return;
    }
    const entry = {
      id: Date.now(),
      date,
      ticker: (pair || "").toUpperCase(),
      entry_time: entryTime || null,
      exit_time: exitTime || null,
      amount_risked: amountRisked ? Number(amountRisked) : null,
      balance_before: balanceBefore ? Number(balanceBefore) : null,
      balance_after: balanceAfter ? Number(balanceAfter) : null,
      pnl: Number((pnl || 0).toFixed(2)),
      final_rr: finalRR !== "" ? Number(finalRR) : null,
      confluences,
      done_right: doneRight,
      done_wrong: doneWrong,
      what_to_improve: whatToDo, // <-- Supabase column
      entry_chart: entryChartPreview || null,
      htf_chart: htfChartPreview || null,
    };

    const updated = { ...tradesByDate, [date]: [...(tradesByDate[date] || []), entry] };
    setTradesByDate(updated);
    localStorage.setItem("trades", JSON.stringify(updated));

    await saveTrade(entry);
    setRefetchFlag((f) => f + 1);

    // reset form
    setPair("");
    setEntryTime("");
    setExitTime("");
    setAmountRisked("");
    setBalanceBefore("");
    setBalanceAfter("");
    setConfluences("");
    setDoneRight("");
    setDoneWrong("");
    setWhatToDo("");
    setEntryChartFile(null);
    setHtfChartFile(null);
  }

  function handleDelete(dateKey, id) {
    const list = tradesByDate[dateKey] || [];
    const updatedList = list.filter((t) => t.id !== id);
    const updated = { ...tradesByDate };
    if (updatedList.length === 0) delete updated[dateKey];
    else updated[dateKey] = updatedList;
    setTradesByDate(updated);
    localStorage.setItem("trades", JSON.stringify(updated));
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white/70">
        Please log in to access your Journal.
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0b1220] pb-24 text-white/90 overflow-visible">
      <NeonParticles />

      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-white/5 bg-[#0b1220]/80 px-6 py-5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="group">
            <h1 className="text-2xl font-semibold">Journal</h1>
            <ReactiveNeonUnderline />
          </div>
          <div className="text-xs">
            {syncStatus === "syncing" && <span className="text-yellow-400">• syncing…</span>}
            {syncStatus === "synced" && <span className="text-emerald-400">• synced</span>}
            {syncStatus === "error" && <span className="text-red-400">• sync failed</span>}
          </div>
        </div>
      </div>

      {/* ------------------------------ FORM ------------------------------ */}
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="rounded-3xl border border-white/10 bg-[rgba(12,18,32,.6)] p-6 shadow-[0_0_40px_rgba(16,185,129,.06)]">
          {/* DATE + PAIR + TIMES */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <FieldShell label="Date" icon={<CalendarIcon size={16} className="text-emerald-300" />}>
              <div
                className="relative w-full cursor-pointer"
                onClick={(e) => e.currentTarget.querySelector("input")?.showPicker?.()}
              >
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl bg-transparent px-3 py-2 text-white/90 placeholder-white/40 outline-none border border-white/10 hover:border-emerald-400/40 cursor-pointer"
                />
              </div>
            </FieldShell>
            <FieldShell label="Pair" icon={<ImageIcon size={16} className="text-cyan-300" />}>
              <input
                value={pair}
                onChange={(e) => setPair(e.target.value.toUpperCase())}
                placeholder="AAPL / EURUSD"
                className="w-full rounded-xl bg-transparent px-3 py-2 text-white/90 placeholder-white/40 outline-none border border-white/10 hover:border-cyan-400/40"
              />
            </FieldShell>
            <FieldShell label="Entry Time" icon={<ClockIcon size={16} className="text-emerald-300" />}>
              <div
                className="relative w-full cursor-pointer"
                onClick={(e) => e.currentTarget.querySelector("input")?.showPicker?.()}
              >
                <input
                  type="time"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  className="w-full rounded-xl bg-transparent px-3 py-2 text-white/90 placeholder-white/40 outline-none border border-white/10 hover:border-emerald-400/40 cursor-pointer"
                />
              </div>
            </FieldShell>
            <FieldShell label="Exit Time" icon={<ClockIcon size={16} className="text-emerald-300" />}>
              <div
                className="relative w-full cursor-pointer"
                onClick={(e) => e.currentTarget.querySelector("input")?.showPicker?.()}
              >
                <input
                  type="time"
                  value={exitTime}
                  onChange={(e) => setExitTime(e.target.value)}
                  className="w-full rounded-xl bg-transparent px-3 py-2 text-white/90 placeholder-white/40 outline-none border border-white/10 hover:border-emerald-400/40 cursor-pointer"
                />
              </div>
            </FieldShell>
          </div>

          {/* BALANCES */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <FieldShell label="Balance Before ($)">
              <input
                type="number"
                value={balanceBefore}
                onChange={(e) => setBalanceBefore(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl bg-transparent px-3 py-2 text-white/90 placeholder-white/40 outline-none border border-white/10 hover:border-emerald-400/40"
              />
            </FieldShell>
            <FieldShell label="Balance After ($)">
              <input
                type="number"
                value={balanceAfter}
                onChange={(e) => setBalanceAfter(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl bg-transparent px-3 py-2 text-white/90 placeholder-white/40 outline-none border border-white/10 hover:border-emerald-400/40"
              />
            </FieldShell>
            <FieldShell label="Amount Risked ($)">
              <input
                type="number"
                value={amountRisked}
                onChange={(e) => setAmountRisked(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl bg-transparent px-3 py-2 text-white/90 placeholder-white/40 outline-none border border-white/10 hover:border-emerald-400/40"
              />
            </FieldShell>
            <FieldShell label="Auto R:R">
              <div className="px-3 py-2 text-emerald-300">
                {finalRR === "" ? "—" : finalRR}
              </div>
            </FieldShell>
          </div>

          {/* NOTES */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldShell label="Confluences">
              <TextAreaAuto
                value={confluences}
                onChange={setConfluences}
                placeholder="Confluences that led to the setup..."
              />
            </FieldShell>
            <FieldShell label="Done Right">
              <TextAreaAuto
                value={doneRight}
                onChange={setDoneRight}
                placeholder="What went well..."
              />
            </FieldShell>
            <FieldShell label="Done Wrong">
              <TextAreaAuto
                value={doneWrong}
                onChange={setDoneWrong}
                placeholder="What went wrong..."
              />
            </FieldShell>
            <FieldShell label="What to do differently">
              <TextAreaAuto
                value={whatToDo}
                onChange={setWhatToDo}
                placeholder="Improvements for next time..."
              />
            </FieldShell>
          </div>

          {/* ATTACHMENTS */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <FieldShell label="Entry Chart" icon={<Upload size={16} className="text-cyan-300" />}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEntryChartFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-white/80"
              />
              {entryChartPreview && (
                <button
                  type="button"
                  onClick={() => setLightboxSrc(entryChartPreview)}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-white/5 px-3 py-1.5 text-emerald-300 hover:bg-white/10"
                >
                  <ImageIcon size={16} /> Entry Chart <ExternalLink size={14} />
                </button>
              )}
            </FieldShell>
            <FieldShell label="HTF Chart" icon={<Upload size={16} className="text-cyan-300" />}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setHtfChartFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-white/80"
              />
              {htfChartPreview && (
                <button
                  type="button"
                  onClick={() => setLightboxSrc(htfChartPreview)}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-white/5 px-3 py-1.5 text-cyan-300 hover:bg-white/10"
                >
                  <ImageIcon size={16} /> HTF Chart <ExternalLink size={14} />
                </button>
              )}
            </FieldShell>
          </div>

          {/* SAVE BUTTON */}
          <div className="mt-6 hidden md:block">
            <button
              onClick={handleAddEntry}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/90 px-4 py-2 font-medium text-slate-900 shadow hover:bg-emerald-400"
            >
              Save Trade
            </button>
          </div>
        </div>

        {/* ----------------------------- FEED ----------------------------- */}
        <h2 className="mt-8 mb-3 text-lg font-semibold">Your Journal Entries</h2>
        {flatFeed.length === 0 ? (
          <p className="text-white/60">No journal entries yet.</p>
        ) : (
          <div className="space-y-4">
            {flatFeed.map((t) => {
              const isWin = Number(t.pnl) >= 0;
              return (
                <div
                  key={t.id}
                  className="rounded-2xl border border-white/10 bg-[rgba(12,18,32,.6)] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-white/60">{t.date}</p>
                      <h3 className="text-lg font-semibold">
                        {t.ticker}{" "}
                        <span className={isWin ? "text-emerald-400" : "text-red-400"}>
                          {isWin ? "+" : ""}
                          {Number(t.pnl).toFixed(2)}$
                        </span>
                        {t.amount_risked ? (
                          <span className="ml-3 text-xs text-white/60">
                            R:R <b>{Number(t.final_rr ?? 0).toFixed(2)}</b> (risked{" "}
                            {Number(t.amount_risked).toFixed(2)}$)
                          </span>
                        ) : null}
                      </h3>
                    </div>
                    <button
                      className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm"
                      onClick={() => handleDelete(t.date, t.id)}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>

                  {(t.confluences ||
                    t.done_right ||
                    t.done_wrong ||
                    t.what_to_improve ||
                    t.what_to_do ||
                    t.whatToDo) && (
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                      {t.confluences && <FeedBlock title="Confluences" text={t.confluences} />}
                      {t.done_right && <FeedBlock title="Done Right" text={t.done_right} />}
                      {t.done_wrong && <FeedBlock title="Done Wrong" text={t.done_wrong} />}
                      {(t.what_to_improve || t.what_to_do || t.whatToDo) && (
                        <FeedBlock
                          title="What to do differently"
                          text={t.what_to_improve || t.what_to_do || t.whatToDo}
                        />
                      )}
                    </div>
                  )}

                  {(t.entry_chart || t.htf_chart) && (
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {t.entry_chart && (
                        <button
                          type="button"
                          onClick={() => setLightboxSrc(t.entry_chart)}
                          className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-white/5 px-3 py-1.5 text-emerald-300 hover:bg-white/10"
                        >
                          <ImageIcon size={16} /> Entry Chart <ExternalLink size={14} />
                        </button>
                      )}
                      {t.htf_chart && (
                        <button
                          type="button"
                          onClick={() => setLightboxSrc(t.htf_chart)}
                          className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-white/5 px-3 py-1.5 text-cyan-300 hover:bg-white/10"
                        >
                          <ImageIcon size={16} /> HTF Chart <ExternalLink size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />

      {/* Floating Save (Mobile) */}
      <button
        onClick={handleAddEntry}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-emerald-500/90 px-5 py-3 text-slate-900 shadow-lg hover:bg-emerald-400 md:hidden transition-all duration-200"
      >
        <Save size={18} /> Save
      </button>
    </div>
  );
}

/* ------------------------- tiny feed block component ----------------------- */
function FeedBlock({ title, text }) {
  return (
    <div className="rounded-xl border border-white/10 p-3">
      <p className="text-xs font-semibold text-white/60">{title}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm">{text}</p>
    </div>
  );
}
