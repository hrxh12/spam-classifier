import { FormEvent, ReactNode, useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { classify, getHistory, getStats, Prediction, Stats } from "./api";

const navItems = [["/", "Classifier"], ["/history", "History"], ["/stats", "Stats"]];

function Layout() {
  return <div className="min-h-screen bg-[#f7f4ec] text-[#18302b]">
    <header className="border-b border-[#d8d4c7] bg-[#f7f4ec]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <NavLink to="/" className="font-display text-xl font-semibold tracking-tight">signal<span className="text-[#e56648]">/</span>check</NavLink>
        <nav className="flex gap-1 rounded-full border border-[#d8d4c7] bg-white/50 p-1 text-sm">
          {navItems.map(([path, label]) => <NavLink key={path} to={path} className={({ isActive }) => `rounded-full px-3 py-1.5 transition ${isActive ? "bg-[#18302b] text-white" : "text-[#63736d] hover:text-[#18302b]"}`}>{label}</NavLink>)}
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-5 py-12"><Routes><Route path="/" element={<Classifier />} /><Route path="/history" element={<History />} /><Route path="/stats" element={<StatsPage />} /></Routes></main>
  </div>;
}

function ErrorMessage({ error }: { error: string }) { return <div className="mt-4 rounded-lg border border-[#e8b9ad] bg-[#fff0eb] px-4 py-3 text-sm text-[#a6412b]">{error}</div>; }
function Result({ result }: { result: Prediction }) {
  const spam = result.prediction === "SPAM";
  return <div className={`mt-8 rounded-2xl border p-6 ${spam ? "border-[#efb7a8] bg-[#fff0eb]" : "border-[#afd1bd] bg-[#eff8f0]"}`}>
    <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#63736d]">Verdict</p><h2 className={`mt-2 font-display text-4xl ${spam ? "text-[#c64b32]" : "text-[#31734a]"}`}>{result.prediction}</h2></div><div className="text-right"><p className="text-xs uppercase tracking-wider text-[#63736d]">Confidence</p><p className="mt-1 text-2xl font-semibold">{result.confidence == null ? "--" : `${(result.confidence * 100).toFixed(1)}%`}</p></div></div>
    <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/10"><div className={`h-full rounded-full ${spam ? "bg-[#e56648]" : "bg-[#4c9a67]"}`} style={{ width: `${(result.confidence || 0) * 100}%` }} /></div>
  </div>;
}
function Classifier() {
  const [message, setMessage] = useState(""); const [result, setResult] = useState<Prediction | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); if (!message.trim()) return setError("Write a message before checking it."); setLoading(true); setError(""); setResult(null); try { setResult(await classify(message)); } catch (e) { setError(e instanceof Error ? e.message : "Unable to reach the classifier."); } finally { setLoading(false); } }
  return <section className="mx-auto max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#e56648]">Public message screening</p><h1 className="mt-4 max-w-2xl font-display text-5xl leading-[1.05] tracking-tight sm:text-7xl">Know what your inbox is really saying.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-[#63736d]">Paste a message and get a fast, transparent signal from the trained spam classifier.</p>
    <form onSubmit={submit} className="mt-10"><label htmlFor="message" className="mb-2 block text-sm font-semibold">Message to check</label><textarea id="message" value={message} onChange={e => setMessage(e.target.value)} placeholder="Congratulations! You have won a free prize..." rows={6} className="w-full resize-y rounded-2xl border border-[#d8d4c7] bg-white p-5 text-base outline-none transition placeholder:text-[#a3aaa3] focus:border-[#e56648] focus:ring-4 focus:ring-[#e56648]/10" /><div className="mt-4 flex items-center justify-between gap-4"><span className="text-sm text-[#63736d]">{message.length} characters</span><button disabled={loading} className="rounded-full bg-[#e56648] px-6 py-3 font-semibold text-white transition hover:bg-[#c64b32] disabled:cursor-wait disabled:opacity-60">{loading ? "Checking..." : "Check message"}</button></div></form>{error && <ErrorMessage error={error} />}{result && <Result result={result} />}</section>;
}

function Filter({ value, onChange }: { value: string; onChange: (value: string) => void }) { return <select value={value} onChange={e => onChange(e.target.value)} className="rounded-full border border-[#d8d4c7] bg-white px-4 py-2 text-sm outline-none focus:border-[#e56648]"><option value="">All messages</option><option value="SPAM">Spam only</option><option value="NOT SPAM">Not spam only</option></select>; }
function History() {
  const [items, setItems] = useState<Prediction[]>([]); const [page, setPage] = useState(1); const [pages, setPages] = useState(1); const [filter, setFilter] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); getHistory(page, filter).then(data => { setItems(data.items); setPages(data.pages); setError(""); }).catch(e => setError(e.message)).finally(() => setLoading(false)); }, [page, filter]);
  function changeFilter(value: string) { setFilter(value); setPage(1); }
  return <section><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#e56648]">Shared feed</p><h1 className="mt-3 font-display text-5xl tracking-tight">Recent checks</h1></div><Filter value={filter} onChange={changeFilter} /></div>{error && <ErrorMessage error={error} />}<div className="mt-8 overflow-hidden rounded-2xl border border-[#d8d4c7] bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-[#e7e3d8] bg-[#fbfaf6] text-xs uppercase tracking-wider text-[#63736d]"><tr><th className="px-5 py-4">Message</th><th className="px-5 py-4">Result</th><th className="px-5 py-4">Confidence</th><th className="px-5 py-4">Checked</th></tr></thead><tbody className="divide-y divide-[#eeeae0]">{loading ? <tr><td colSpan={4} className="px-5 py-12 text-center text-[#63736d]">Loading history...</td></tr> : items.length === 0 ? <tr><td colSpan={4} className="px-5 py-12 text-center text-[#63736d]">No predictions yet.</td></tr> : items.map(item => <tr key={item.id}><td className="max-w-sm truncate px-5 py-4 font-medium">{item.message}</td><td className={`px-5 py-4 font-bold ${item.prediction === "SPAM" ? "text-[#c64b32]" : "text-[#31734a]"}`}>{item.prediction}</td><td className="px-5 py-4 text-[#63736d]">{item.confidence == null ? "--" : `${(item.confidence * 100).toFixed(1)}%`}</td><td className="px-5 py-4 text-[#63736d]">{item.created_at ? new Date(item.created_at).toLocaleString() : "--"}</td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-[#e7e3d8] px-5 py-4 text-sm text-[#63736d]"><span>Page {page} of {Math.max(pages, 1)}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-full border px-3 py-1.5 disabled:opacity-40">Previous</button><button disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded-full border px-3 py-1.5 disabled:opacity-40">Next</button></div></div></div></section>;
}

function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null); const [error, setError] = useState("");
  useEffect(() => { getStats().then(setStats).catch(e => setError(e.message)); }, []);
  if (error) return <ErrorMessage error={error} />; if (!stats) return <p className="text-[#63736d]">Loading statistics...</p>;
  const ratio = [{ name: "Spam", value: stats.spam }, { name: "Not spam", value: stats.not_spam }];
  return <section><p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#e56648]">The bigger picture</p><h1 className="mt-3 font-display text-5xl tracking-tight">Signal, over time.</h1><div className="mt-8 grid gap-4 sm:grid-cols-3"><Metric label="Total checked" value={stats.total} /><Metric label="Spam share" value={`${stats.spam_percentage}%`} accent="text-[#c64b32]" /><Metric label="Not spam share" value={`${stats.not_spam_percentage}%`} accent="text-[#31734a]" /></div><div className="mt-6 grid gap-6 lg:grid-cols-2"><Chart title="Spam vs not spam"><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={ratio} dataKey="value" nameKey="name" innerRadius={72} outerRadius={104} paddingAngle={4}>{ratio.map((entry, index) => <Cell key={entry.name} fill={index === 0 ? "#e56648" : "#4c9a67"} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></Chart><Chart title="Prediction volume"><ResponsiveContainer width="100%" height={280}><BarChart data={stats.volume_over_time}><XAxis dataKey="date" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="count" fill="#18302b" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Chart></div></section>;
}
function Metric({ label, value, accent = "" }: { label: string; value: string | number; accent?: string }) { return <div className="rounded-2xl border border-[#d8d4c7] bg-white p-5"><p className="text-sm text-[#63736d]">{label}</p><p className={`mt-3 font-display text-4xl ${accent}`}>{value}</p></div>; }
function Chart({ title, children }: { title: string; children: ReactNode }) { return <div className="rounded-2xl border border-[#d8d4c7] bg-white p-5"><h2 className="font-semibold">{title}</h2><div className="mt-4">{children}</div></div>; }

export default Layout;
