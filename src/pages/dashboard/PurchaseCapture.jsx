const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileUp,
  PenLine,
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

import { useEntityList } from "@/lib/useCollection";
import VoiceInputButton from "@/components/dashboard/VoiceInputButton";
import { useLanguage } from "@/lib/LanguageContext";

const UNITS = ["pcs", "kg", "gms", "ltr", "ml", "box", "dozen", "pkt"];
const today = () => new Date().toISOString().slice(0, 10);

const STEPS = ["method", "upload", "uploading", "processing", "form", "saving", "done"];

export default function PurchaseCapture() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { data: suppliers } = useEntityList("Supplier", { sort: "name" });

  const [step, setStep] = useState("method");
  const [billImage, setBillImage] = useState(null); // file_uri
  const [billPreview, setBillPreview] = useState(null); // object URL
  const [form, setForm] = useState({
    supplier_name: "",
    bill_number: "",
    purchase_date: today(),
    notes: "",
  });
  const [items, setItems] = useState([
    { product_name: "", quantity: 1, unit: "pcs", purchase_price: "" },
  ]);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState("");

  // Start in bill mode if requested; reset when the mode param changes
  useEffect(() => {
    setStep(params.get("mode") === "bill" ? "upload" : "method");
  }, [params]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onFile = async (file) => {
    if (!file) return;
    setStep("uploading");
    try {
      const { file_uri } = await db.integrations.Core.UploadPrivateFile({ file });
      setBillImage(file_uri);
      setBillPreview(URL.createObjectURL(file));
      setStep("processing");
      setTimeout(() => setStep("form"), 1800);
    } catch (e) {
      setError("Could not upload the bill. Please try again.");
      setStep("upload");
    }
  };

  const updateItem = (i, patch) =>
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const addItem = () =>
    setItems((arr) => [...arr, { product_name: "", quantity: 1, unit: "pcs", purchase_price: "" }]);
  const removeItem = (i) => setItems((arr) => arr.filter((_, idx) => idx !== i));

  const lineTotal = (it) =>
    (Number(it.quantity) || 0) * (Number(it.purchase_price) || 0);
  const total = items.reduce((s, it) => s + lineTotal(it), 0);

  const validItems = items.filter((it) => it.product_name.trim() && Number(it.quantity) > 0);

  const save = async () => {
    setError("");
    if (validItems.length === 0) {
      setError("Add at least one product with a name and quantity.");
      return;
    }
    setStep("saving");
    try {
      const supplierMatch = (suppliers || []).find(
        (s) => s.name.toLowerCase() === form.supplier_name.trim().toLowerCase()
      );
      const purchase = await db.entities.Purchase.create({
        supplier_name: form.supplier_name.trim(),
        supplier_id: supplierMatch?.id || "",
        bill_number: form.bill_number.trim(),
        bill_image_uri: billImage || "",
        purchase_date: form.purchase_date,
        notes: form.notes.trim(),
        total_amount: total,
        item_count: validItems.length,
        status: "confirmed",
      });
      await db.entities.PurchaseItem.bulkCreate(
        validItems.map((it) => ({
          purchase_id: purchase.id,
          product_name: it.product_name.trim(),
          quantity: Number(it.quantity),
          unit: it.unit,
          purchase_price: Number(it.purchase_price) || 0,
          line_total: lineTotal(it),
        }))
      );

      // Retain the purchase as a business memory (non-blocking).
      // The DB save already succeeded; a retain failure shows a soft warning, not an error.
      try {
        const dateStr = purchase.purchase_date
          ? new Date(purchase.purchase_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
          : "recently";
        const itemSummary = validItems
          .map((it) => `${Number(it.quantity)} ${it.unit} of ${it.product_name.trim()} at ₹${Number(it.purchase_price) || 0} per ${it.unit}`)
          .join(", ");
        const memoryText =
          `On ${dateStr}, the shop purchased ${itemSummary} from ${form.supplier_name.trim() || "a supplier"}` +
          ` for a total of ₹${total.toLocaleString()}.`;
        await db.functions.invoke("hindsightRetain", {
          content: memoryText,
          tags: ["purchase"],
        });
      } catch (retainErr) {
        // Non-blocking: the purchase was saved successfully.
        console.warn("Hindsight retain failed for purchase:", retainErr?.message);
      }

      setSaved({ purchase, items: validItems, total });
      setStep("done");
    } catch (e) {
      setError(e?.message || "Could not save the purchase. Please try again.");
      setStep("form");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#0B2D5B]"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <Stepper step={step} />

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>
      )}

      {step === "method" && (
        <MethodStep onBill={() => setStep("upload")} onManual={() => setStep("form")} />
      )}

      {step === "upload" && <UploadStep onFile={onFile} />}

      {step === "uploading" && (
        <CenterStatus icon={Loader2} spin title="Uploading your bill…" text="Securing your photo." />
      )}

      {step === "processing" && (
        <CenterStatus
          icon={Sparkles}
          title="Reading your bill…"
          text="Automatic extraction will be enabled once AI vision is connected. You can confirm the details next."
        />
      )}

      {(step === "form" || step === "saving") && (
        <FormStep
          form={form}
          setField={setField}
          items={items}
          updateItem={updateItem}
          addItem={addItem}
          removeItem={removeItem}
          lineTotal={lineTotal}
          total={total}
          billPreview={billPreview}
          suppliers={suppliers || []}
          lang={lang}
          saving={step === "saving"}
          onSave={save}
        />
      )}

      {step === "done" && saved && (
        <DoneStep saved={saved} onAnother={() => window.location.reload()} />
      )}
    </div>
  );
}

function Stepper({ step }) {
  const idx = Math.max(0, STEPS.indexOf(step));
  const labels = ["Start", "Upload", "Process", "Review", "Save"];
  const activeIdx = step === "done" ? 5 : Math.min(idx, 4);
  return (
    <div className="mb-6 flex items-center gap-2">
      {labels.map((l, i) => (
        <div key={l} className="flex items-center gap-2 flex-1">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
              i <= activeIdx ? "bg-[#0B2D5B] text-white" : "bg-[#E2E8F0] text-[#64748B]"
            }`}
          >
            {i < activeIdx ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </span>
          <span className={`text-xs font-medium ${i <= activeIdx ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>
            {l}
          </span>
          {i < labels.length - 1 && <div className={`h-px flex-1 ${i < activeIdx ? "bg-[#0B2D5B]" : "bg-[#E2E8F0]"}`} />}
        </div>
      ))}
    </div>
  );
}

function MethodStep({ onBill, onManual }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <button
        type="button"
        onClick={onBill}
        className="group flex flex-col items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-6 text-left shadow-sm hover:border-[#6366F1]/50 hover:shadow-md transition-all"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3B82F6]/10">
          <FileUp className="h-6 w-6 text-[#3B82F6]" />
        </span>
        <span className="text-base font-semibold text-[#0F172A]">Upload a bill</span>
        <span className="text-sm text-[#64748B]">Take a photo or pick a wholesale bill image.</span>
      </button>
      <button
        type="button"
        onClick={onManual}
        className="group flex flex-col items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-6 text-left shadow-sm hover:border-[#6366F1]/50 hover:shadow-md transition-all"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6366F1]/10">
          <PenLine className="h-6 w-6 text-[#6366F1]" />
        </span>
        <span className="text-base font-semibold text-[#0F172A]">Enter manually</span>
        <span className="text-sm text-[#64748B]">Type the purchase details yourself.</span>
      </button>
    </div>
  );
}

function UploadStep({ onFile }) {
  return (
    <label className="block cursor-pointer">
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-white px-6 py-14 text-center hover:border-[#6366F1]/60 hover:bg-[#F8FAFC] transition-colors">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3B82F6]/10 mb-4">
          <Camera className="h-7 w-7 text-[#3B82F6]" />
        </span>
        <p className="text-base font-semibold text-[#0F172A]">Take or upload a photo of the bill</p>
        <p className="mt-1 text-sm text-[#64748B]">JPG or PNG. We'll store it securely with your records.</p>
        <span className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-[#0B2D5B] px-4 py-2 text-sm font-semibold text-white">
          <ImageIcon className="h-4 w-4" /> Choose photo
        </span>
      </div>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </label>
  );
}

function CenterStatus({ icon: Icon, title, text, spin }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white px-6 py-14 text-center"
    >
      <Icon className={`h-10 w-10 text-[#6366F1] mb-4 ${spin ? "animate-spin" : ""}`} />
      <p className="text-base font-semibold text-[#0F172A]">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm text-[#64748B]">{text}</p>
    </motion.div>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-[#0F172A]">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[#94A3B8]">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition";

function FormStep({
  form, setField, items, updateItem, addItem, removeItem, lineTotal, total,
  billPreview, suppliers, lang, saving, onSave,
}) {
  return (
    <div className="space-y-6">
      {billPreview && (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-3">
          <img src={billPreview} alt="Bill" className="max-h-48 mx-auto rounded-lg" />
        </div>
      )}

      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[#0F172A]">Purchase details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Supplier">
            <div className="relative">
              <input
                list="supplier-list"
                value={form.supplier_name}
                onChange={(e) => setField("supplier_name", e.target.value)}
                placeholder="e.g. Sri Lakshmi Wholesale"
                className={inputCls}
              />
              <datalist id="supplier-list">
                {suppliers.map((s) => <option key={s.id} value={s.name} />)}
              </datalist>
            </div>
          </Field>
          <Field label="Bill number">
            <input
              value={form.bill_number}
              onChange={(e) => setField("bill_number", e.target.value)}
              placeholder="optional"
              className={inputCls}
            />
          </Field>
          <Field label="Purchase date">
            <input
              type="date"
              value={form.purchase_date}
              onChange={(e) => setField("purchase_date", e.target.value)}
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
          <h3 className="text-sm font-semibold text-[#0F172A]">Products in this purchase</h3>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1 rounded-lg bg-[#6366F1]/10 px-2.5 py-1.5 text-xs font-semibold text-[#6366F1] hover:bg-[#6366F1]/20"
          >
            <Plus className="h-3.5 w-3.5" /> Add item
          </button>
        </div>

        <div className="space-y-3">
          {items.map((it, i) => (
            <div key={i} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-12 gap-2">
                  <div className="col-span-2 sm:col-span-5">
                    <div className="flex items-center gap-1">
                      <input
                        value={it.product_name}
                        onChange={(e) => updateItem(i, { product_name: e.target.value })}
                        placeholder="Product name"
                        className={inputCls}
                      />
                      <VoiceInputButton
                        onTranscript={(t) => updateItem(i, { product_name: t })}
                        lang={lang}
                      />
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
                    value={it.purchase_price}
                    onChange={(e) => updateItem(i, { purchase_price: e.target.value })}
                    placeholder="Price / unit"
                    className={`${inputCls} sm:col-span-3`}
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
        onClick={onSave}
        disabled={saving}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B2D5B] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#3B82F6] disabled:opacity-60 transition-colors"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        {saving ? "Saving…" : "Confirm & Save Purchase"}
      </button>
    </div>
  );
}

function DoneStep({ saved, onAnother }) {
  const { purchase, items, total } = saved;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6366F1]/10 mb-4">
        <CheckCircle2 className="h-8 w-8 text-[#6366F1]" />
      </div>
      <h2 className="text-lg font-bold text-[#0F172A]">Purchase saved</h2>
      <p className="mt-1 text-sm text-[#64748B]">Your business memory just grew.</p>

      <div className="mt-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 text-left">
        <div className="flex justify-between text-sm">
          <span className="text-[#64748B]">Supplier</span>
          <span className="font-medium text-[#0F172A]">{purchase.supplier_name || "—"}</span>
        </div>
        <div className="flex justify-between text-sm mt-1.5">
          <span className="text-[#64748B]">Date</span>
          <span className="font-medium text-[#0F172A]">
            {purchase.purchase_date ? new Date(purchase.purchase_date).toLocaleDateString() : "—"}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1.5">
          <span className="text-[#64748B]">Items</span>
          <span className="font-medium text-[#0F172A]">{items.length}</span>
        </div>
        <div className="flex justify-between text-sm mt-1.5">
          <span className="text-[#64748B]">Total</span>
          <span className="font-bold text-[#0F172A]">₹{Number(total).toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
        <Link
          to="/app/purchases"
          className="inline-flex items-center justify-center rounded-lg bg-[#0B2D5B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3B82F6] transition-colors"
        >
          View purchases
        </Link>
        <button
          type="button"
          onClick={onAnother}
          className="inline-flex items-center justify-center rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-sm font-semibold text-[#0B2D5B] hover:bg-[#F8FAFC]"
        >
          Add another
        </button>
      </div>
    </motion.div>
  );
}