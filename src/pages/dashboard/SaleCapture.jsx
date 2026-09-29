const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Trash2, ArrowLeft, CheckCircle2, Loader2, Tag } from "lucide-react";

import { useEntityList } from "@/lib/useCollection";
import VoiceInputButton from "@/components/dashboard/VoiceInputButton";
import { useLanguage } from "@/lib/LanguageContext";

const UNITS = ["pcs", "kg", "gms", "ltr", "ml", "box", "dozen", "pkt"];
const today = () => new Date().toISOString().slice(0, 10);

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

export default function SaleCapture() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { data: products } = useEntityList("Product", { sort: "name" });

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    sale_date: today(),
    notes: "",
  });
  const [items, setItems] = useState([
    { product_name: "", quantity: 1, unit: "pcs", selling_price: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState("");

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const updateItem = (i, patch) =>
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const addItem = () =>
    setItems((arr) => [...arr, { product_name: "", quantity: 1, unit: "pcs", selling_price: "" }]);
  const removeItem = (i) => setItems((arr) => arr.filter((_, idx) => idx !== i));

  const lineTotal = (it) => (Number(it.quantity) || 0) * (Number(it.selling_price) || 0);
  const total = items.reduce((s, it) => s + lineTotal(it), 0);
  const validItems = items.filter((it) => it.product_name.trim() && Number(it.quantity) > 0);

  const save = async () => {
    setError("");
    if (validItems.length === 0) {
      setError("Add at least one product with a name and quantity.");
      return;
    }
    setSaving(true);
    try {
      const sale = await db.entities.Sale.create({
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        sale_date: form.sale_date,
        notes: form.notes.trim(),
        total_amount: total,
        item_count: validItems.length,
      });
      await db.entities.SaleItem.bulkCreate(
        validItems.map((it) => {
          const match = (products || []).find(
            (p) => p.name.toLowerCase() === it.product_name.trim().toLowerCase()
          );
          return {
            sale_id: sale.id,
            product_id: match?.id || "",
            product_name: it.product_name.trim(),
            quantity: Number(it.quantity),
            selling_price: Number(it.selling_price) || 0,
            line_total: lineTotal(it),
          };
        })
      );

      // Retain the sale as a business memory (non-blocking).
      // The DB save already succeeded; a retain failure shows a soft warning, not an error.
      try {
        const dateStr = sale.sale_date
          ? new Date(sale.sale_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
          : "recently";
        const itemSummary = validItems
          .map((it) => `${Number(it.quantity)} ${it.unit || "pcs"} of ${it.product_name.trim()}`)
          .join(", ");
        const customerPart = form.customer_name.trim() ? ` to ${form.customer_name.trim()}` : "";
        const memoryText =
          `On ${dateStr}, the shop sold ${itemSummary}${customerPart} for a total of ₹${total.toLocaleString()}.`;
        await db.functions.invoke("hindsightRetain", {
          content: memoryText,
          tags: ["sale"],
        });
      } catch (retainErr) {
        // Non-blocking: the sale was saved successfully.
        console.warn("Hindsight retain failed for sale:", retainErr?.message);
      }

      setSaved({ sale, items: validItems, total });
    } catch (e) {
      setError(e?.message || "Could not save the sale. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    const { sale, items, total } = saved;
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F59E0B]/10 mb-4">
            <CheckCircle2 className="h-8 w-8 text-[#F59E0B]" />
          </div>
          <h2 className="text-lg font-bold text-[#0F172A]">Sale recorded</h2>
          <p className="mt-1 text-sm text-[#64748B]">Nice work — that's another entry for your business memory.</p>
          <div className="mt-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 text-left">
            <Row label="Customer" value={sale.customer_name || "Walk-in"} />
            <Row label="Date" value={sale.sale_date ? new Date(sale.sale_date).toLocaleDateString() : "—"} />
            <Row label="Items" value={items.length} />
            <Row label="Total" value={`₹${Number(total).toLocaleString()}`} bold />
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <Link to="/app/sales" className="inline-flex items-center justify-center rounded-lg bg-[#0B2D5B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3B82F6]">
              View sales
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-sm font-semibold text-[#0B2D5B] hover:bg-[#F8FAFC]"
            >
              Record another
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#0B2D5B]"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center gap-2 mb-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F59E0B]/10">
          <Tag className="h-5 w-5 text-[#F59E0B]" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Record a sale</h1>
          <p className="text-sm text-[#64748B]">What did you sell today?</p>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>
      )}

      <div className="space-y-6">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[#0F172A]">Sale details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Customer name">
              <div className="flex items-center gap-1">
                <input
                  value={form.customer_name}
                  onChange={(e) => setField("customer_name", e.target.value)}
                  placeholder="optional"
                  className={inputCls}
                />
                <VoiceInputButton onTranscript={(t) => setField("customer_name", t)} lang={lang} />
              </div>
            </Field>
            <Field label="Customer phone">
              <input
                value={form.customer_phone}
                onChange={(e) => setField("customer_phone", e.target.value)}
                placeholder="optional"
                className={inputCls}
              />
            </Field>
            <Field label="Sale date">
              <input
                type="date"
                value={form.sale_date}
                onChange={(e) => setField("sale_date", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Notes">
              <input
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder="optional"
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#0F172A]">Items sold</h3>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1 rounded-lg bg-[#F59E0B]/10 px-2.5 py-1.5 text-xs font-semibold text-[#F59E0B] hover:bg-[#F59E0B]/20"
            >
              <Plus className="h-3.5 w-3.5" /> Add item
            </button>
          </div>
          <div className="space-y-3">
            {items.map((it, i) => (
              <div key={i} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-12 gap-2">
                    <div className="col-span-2 sm:col-span-6">
                      <div className="flex items-center gap-1">
                        <input
                          list="product-list"
                          value={it.product_name}
                          onChange={(e) => updateItem(i, { product_name: e.target.value })}
                          placeholder="Product name"
                          className={inputCls}
                        />
                        <datalist id="product-list">
                          {products.map((p) => <option key={p.id} value={p.name} />)}
                        </datalist>
                        <VoiceInputButton onTranscript={(t) => updateItem(i, { product_name: t })} lang={lang} />
                      </div>
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={it.quantity}
                      onChange={(e) => updateItem(i, { quantity: e.target.value })}
                      placeholder="Qty"
                      className={`${inputCls} sm:col-span-2`}
                    />
                    <select
                      value={it.unit}
                      onChange={(e) => updateItem(i, { unit: e.target.value })}
                      className={`${inputCls} sm:col-span-2`}
                    >
                      {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={it.selling_price}
                      onChange={(e) => updateItem(i, { selling_price: e.target.value })}
                      placeholder="Price / unit"
                      className={`${inputCls} sm:col-span-2`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="rounded-lg p-2 text-[#94A3B8] hover:bg-red-50 hover:text-red-600"
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-right text-xs font-medium text-[#64748B]">
                  Line total: ₹{lineTotal(it).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[#E2E8F0] pt-4">
            <span className="text-sm font-medium text-[#64748B]">Total</span>
            <span className="text-lg font-bold text-[#0F172A]">₹{total.toLocaleString()}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B2D5B] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#3B82F6] disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {saving ? "Saving…" : "Save Sale"}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between text-sm mt-1.5 first:mt-0">
      <span className="text-[#64748B]">{label}</span>
      <span className={bold ? "font-bold text-[#0F172A]" : "font-medium text-[#0F172A]"}>{value}</span>
    </div>
  );
}