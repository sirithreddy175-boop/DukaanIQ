const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from "react";
import { LogOut, Loader2, CheckCircle2, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/dashboard/PageHeader";

const inputCls =
  "w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-[#0F172A]">{label}</span>
      {children}
    </label>
  );
}

const SHOP_TYPES = ["Grocery / Kirana", "Electronics", "Mobile & Accessories", "Clothing", "Pharmacy", "Fruits & Vegetables", "General"];

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", owner_name: "", shop_type: "", address: "", phone: "", email: "", gstin: "", currency: "INR", notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [recordId, setRecordId] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    (async () => {
      try {
        const list = await db.entities.Business.filter({}, "-created_date", 1);
        if (list && list.length > 0) {
          const b = list[0];
          setRecordId(b.id);
          setForm({
            name: b.name || "", owner_name: b.owner_name || "", shop_type: b.shop_type || "",
            address: b.address || "", phone: b.phone || "", email: b.email || "",
            gstin: b.gstin || "", currency: b.currency || "INR", notes: b.notes || "",
          });
        } else {
          setForm((f) => ({ ...f, owner_name: user?.full_name || "" }));
        }
      } catch (e) {
        // ignore — allow empty form
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const save = async () => {
    setError("");
    if (!form.name.trim()) {
      setError("Shop name is required.");
      return;
    }
    setSaving(true);
    try {
      if (recordId) {
        await db.entities.Business.update(recordId, { ...form });
      } else {
        const created = await db.entities.Business.create({ ...form });
        setRecordId(created.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e?.message || "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout(false);
    navigate("/login", { replace: true });
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-[#94A3B8]" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Settings" subtitle="Your shop profile." />

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {saved && (
        <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700 flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4" /> Saved.
        </p>
      )}

      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B2D5B]/10">
            <Store className="h-5 w-5 text-[#0B2D5B]" />
          </span>
          <h3 className="text-sm font-semibold text-[#0F172A]">Shop details</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Shop name">
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Sri Lakshmi Stores" className={inputCls} />
          </Field>
          <Field label="Owner name">
            <input value={form.owner_name} onChange={(e) => set("owner_name", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Type of shop">
            <select value={form.shop_type} onChange={(e) => set("shop_type", e.target.value)} className={inputCls}>
              <option value="">Select…</option>
              {SHOP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="optional" className={inputCls} />
          </Field>
          <Field label="Email">
            <input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="optional" className={inputCls} />
          </Field>
          <Field label="GST / Tax ID">
            <input value={form.gstin} onChange={(e) => set("gstin", e.target.value)} placeholder="optional" className={inputCls} />
          </Field>
          <Field label="Currency">
            <input value={form.currency} onChange={(e) => set("currency", e.target.value)} className={inputCls} />
          </Field>
        </div>
        <Field label="Address">
          <textarea value={form.address} onChange={(e) => set("address", e.target.value)} rows={2} placeholder="optional" className={inputCls} />
        </Field>
      </div>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B2D5B] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#3B82F6] disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        {saving ? "Saving…" : "Save settings"}
      </button>

      <div className="mt-8 border-t border-[#E2E8F0] pt-6">
        <p className="text-sm font-semibold text-[#0F172A] mb-2">Account</p>
        <p className="text-xs text-[#64748B] mb-3">Signed in as {user?.email}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0B2D5B] hover:bg-[#F8FAFC]"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
}