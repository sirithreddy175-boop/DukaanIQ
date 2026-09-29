const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useMemo, useState } from "react";
import { Plus, Search, Package, Trash2, X, Loader2, CheckCircle2 } from "lucide-react";

import { useEntityList } from "@/lib/useCollection";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import VoiceInputButton from "@/components/dashboard/VoiceInputButton";
import { useLanguage } from "@/lib/LanguageContext";

const UNITS = ["pcs", "kg", "gms", "ltr", "ml", "box", "dozen", "pkt"];
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

export default function Products() {
  const { data, loading, refetch } = useEntityList("Product", { sort: "name" });
  const suppliers = useEntityList("Supplier", { sort: "name" });
  const { lang } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const categories = useMemo(() => {
    const set = new Set((data || []).map((p) => p.category).filter(Boolean));
    return Array.from(set);
  }, [data]);

  const filtered = useMemo(() => {
    return (data || []).filter((p) => {
      const q = query.trim().toLowerCase();
      const matchQ = !q || p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
      const matchC = !category || p.category === category;
      return matchQ && matchC;
    });
  }, [data, query, category]);

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader title="Products" subtitle="Your stock and prices.">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B2D5B] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#3B82F6] transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </PageHeader>

      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className={`${inputCls} pl-9`}
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`${inputCls} sm:w-48`}
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-white border border-[#E2E8F0] animate-pulse" />)}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Add your first product so you can track stock and prices across purchases and sales."
          action={
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B2D5B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3B82F6] transition-colors"
            >
              <Plus className="h-4 w-4" /> Add your first product
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[#64748B] py-8 text-center">No products match your search.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right hidden sm:table-cell">Purchase ₹</th>
                <th className="px-4 py-3 text-right">Selling ₹</th>
                <th className="px-4 py-3 hidden md:table-cell">Supplier</th>
                <th className="px-2 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#0F172A]">{p.name}</p>
                    {p.category && <p className="text-xs text-[#94A3B8]">{p.category}</p>}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#0F172A]">
                    {Number(p.quantity || 0)} <span className="text-xs text-[#94A3B8]">{p.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell text-[#64748B]">
                    {p.purchase_price != null ? `₹${Number(p.purchase_price)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#0F172A]">
                    {p.selling_price != null ? `₹${Number(p.selling_price)}` : "—"}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-[#64748B]">{p.supplier_name || "—"}</td>
                  <td className="px-2 py-3 text-right">
                    <DeleteButton id={p.id} onDone={refetch} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <AddProductModal
          suppliers={suppliers.data || []}
          lang={lang}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function DeleteButton({ id, onDone }) {
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    if (!confirm("Delete this product?")) return;
    setBusy(true);
    try {
      await db.entities.Product.delete(id);
      onDone();
    } finally {
      setBusy(false);
    }
  };
  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      title="Delete product"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function AddProductModal({ suppliers, lang, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: 0,
    unit: "pcs",
    purchase_price: "",
    selling_price: "",
    supplier_id: "",
    supplier_name: "",
    low_stock_threshold: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSupplier = (name) => {
    const match = suppliers.find((s) => s.name === name);
    set("supplier_name", name);
    if (match) set("supplier_id", match.id);
  };

  const save = async () => {
    setError("");
    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }
    setSaving(true);
    try {
      await db.entities.Product.create({
        name: form.name.trim(),
        category: form.category.trim(),
        quantity: Number(form.quantity) || 0,
        unit: form.unit,
        purchase_price: form.purchase_price === "" ? null : Number(form.purchase_price),
        selling_price: form.selling_price === "" ? null : Number(form.selling_price),
        supplier_id: form.supplier_id,
        supplier_name: form.supplier_name,
        low_stock_threshold: form.low_stock_threshold === "" ? null : Number(form.low_stock_threshold),
        notes: form.notes,
      });
      onSaved();
    } catch (e) {
      setError(e?.message || "Could not save the product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-[#0B2D5B]/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-white p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#0F172A]">Add product</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F8FAFC]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="space-y-4">
          <Field label="Product name">
            <div className="flex items-center gap-1">
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Aashirvaad Atta 5kg" className={inputCls} />
              <VoiceInputButton onTranscript={(t) => set("name", t)} lang={lang} />
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="e.g. Grocery" className={inputCls} />
            </Field>
            <Field label="Unit">
              <select value={form.unit} onChange={(e) => set("unit", e.target.value)} className={inputCls}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Current quantity">
              <input type="number" min="0" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Low stock alert at">
              <input type="number" min="0" placeholder="optional" onChange={(e) => set("low_stock_threshold", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Purchase price ₹">
              <input type="number" min="0" step="0.01" value={form.purchase_price} onChange={(e) => set("purchase_price", e.target.value)} placeholder="0" className={inputCls} />
            </Field>
            <Field label="Selling price ₹">
              <input type="number" min="0" step="0.01" value={form.selling_price} onChange={(e) => set("selling_price", e.target.value)} placeholder="0" className={inputCls} />
            </Field>
          </div>
          <Field label="Supplier">
            <input list="prod-supplier-list" value={form.supplier_name} onChange={(e) => onSupplier(e.target.value)} placeholder="optional" className={inputCls} />
            <datalist id="prod-supplier-list">
              {suppliers.map((s) => <option key={s.id} value={s.name} />)}
            </datalist>
          </Field>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B2D5B] px-4 py-3 text-sm font-semibold text-white hover:bg-[#3B82F6] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {saving ? "Saving…" : "Save product"}
          </button>
          <button type="button" onClick={onClose} className="rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm font-semibold text-[#0B2D5B] hover:bg-[#F8FAFC]">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}