"use client";

import { useState, useActionState, startTransition, useEffect } from "react";
import { type FaqItem } from "@prisma/client";
import { ChevronDown, ChevronUp, Pencil, Trash2, Check, Plus, X } from "lucide-react";
import { 
  updateSiteConfigAction, 
  createFaqAction, 
  updateFaqAction, 
  deleteFaqAction, 
  toggleFaqAction, 
  reorderFaqAction,
  type FaqFormState
} from "./actions";

interface ContenidoClientProps {
  config: Record<string, string>;
  faqs: FaqItem[];
}

export default function ContenidoClient({ config, faqs: initialFaqs }: ContenidoClientProps) {
  const [tab, setTab] = useState<"about" | "faq" | "location" | "bank">("about");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex flex-col lg:flex-row border-b border-slate-200 overflow-x-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        <button
          onClick={() => setTab("about")}
          className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors text-left lg:text-center ${
            tab === "about"
              ? "bg-[var(--ps-lila-pale)] border-l-4 lg:border-l-0 lg:border-b-2 border-[var(--ps-lila)] text-[var(--ps-lila-deep)]"
              : "border-l-4 lg:border-l-0 lg:border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          Acerca de Nosotros
        </button>
        <button
          onClick={() => setTab("faq")}
          className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors text-left lg:text-center ${
            tab === "faq"
              ? "bg-[var(--ps-lila-pale)] border-l-4 lg:border-l-0 lg:border-b-2 border-[var(--ps-lila)] text-[var(--ps-lila-deep)]"
              : "border-l-4 lg:border-l-0 lg:border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          Preguntas Frecuentes
        </button>
        <button
          onClick={() => setTab("location")}
          className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors text-left lg:text-center ${
            tab === "location"
              ? "bg-[var(--ps-lila-pale)] border-l-4 lg:border-l-0 lg:border-b-2 border-[var(--ps-lila)] text-[var(--ps-lila-deep)]"
              : "border-l-4 lg:border-l-0 lg:border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          Cómo Llegar
        </button>
        <button
          onClick={() => setTab("bank")}
          className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors text-left lg:text-center ${
            tab === "bank"
              ? "bg-[var(--ps-lila-pale)] border-l-4 lg:border-l-0 lg:border-b-2 border-[var(--ps-lila)] text-[var(--ps-lila-deep)]"
              : "border-l-4 lg:border-l-0 lg:border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          Datos Bancarios
        </button>
      </div>

      <div className="p-4 lg:p-6 xl:p-8">
        {tab === "about" && <AboutTab config={config} />}
        {tab === "faq" && <FaqTab faqs={initialFaqs} />}
        {tab === "location" && <LocationTab config={config} />}
        {tab === "bank" && <BankTab config={config} />}
      </div>
    </div>
  );
}

function SaveButton({ isSaving, saved, disabled }: { isSaving: boolean; saved: boolean; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled || isSaving}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
        saved
          ? "bg-green-100 text-green-700"
          : disabled
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-[var(--ps-lila)] text-white hover:opacity-90"
      } disabled:opacity-50`}
    >
      {saved ? (
        <>
          <Check className="size-4" /> Guardado
        </>
      ) : isSaving ? (
        "Guardando..."
      ) : (
        "Guardar"
      )}
    </button>
  );
}

function ConfigField({ 
  label, 
  configKey, 
  initialValue, 
  type = "text", 
  multiline = false 
}: { 
  label: string; 
  configKey: string; 
  initialValue: string; 
  type?: string; 
  multiline?: boolean 
}) {
  const [value, setValue] = useState(initialValue);
  const [lastSavedValue, setLastSavedValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasChanged = value !== lastSavedValue;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!hasChanged) return;
    
    setIsSaving(true);
    const res = await updateSiteConfigAction(configKey, value);
    setIsSaving(false);
    if (res.success) {
      setLastSavedValue(value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      alert(res.error || "Error al guardar");
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
            className="flex-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ps-lila)] focus:border-transparent"
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ps-lila)] focus:border-transparent"
          />
        )}
        <SaveButton isSaving={isSaving} saved={saved} disabled={!hasChanged} />
      </div>
    </form>
  );
}

function ConfigToggle({ label, configKey, initialValue }: { label: string; configKey: string; initialValue: string }) {
  const [value, setValue] = useState(initialValue === "true");
  const [isSaving, setIsSaving] = useState(false);

  async function handleToggle() {
    const newValue = !value;
    setValue(newValue);
    setIsSaving(true);
    await updateSiteConfigAction(configKey, newValue ? "true" : "false");
    setIsSaving(false);
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button
        onClick={handleToggle}
        disabled={isSaving}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ps-lila)] focus:ring-offset-2 ${
          value ? "bg-[var(--ps-lila)]" : "bg-slate-200"
        } disabled:opacity-50`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function AboutTab({ config }: { config: Record<string, string> }) {
  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Texto Principal</h3>
        <ConfigField label="Acerca de nosotros" configKey="about_text" initialValue={config.about_text || ""} multiline />
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Contacto</h3>
        <ConfigField label="Número de WhatsApp (ej. 56937541863 sin el +)" configKey="whatsapp" initialValue={config.whatsapp || ""} />
        <ConfigField label="Correo Electrónico" configKey="email" initialValue={config.email || ""} type="email" />
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Opciones</h3>
        <ConfigToggle label="Estacionamiento Disponible" configKey="parking" initialValue={config.parking || "false"} />
      </div>
    </div>
  );
}

function LocationTab({ config }: { config: Record<string, string> }) {
  const address = config.address || "";
  const mapUrl = address ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed` : "";
  
  return (
    <div className="space-y-8 max-w-3xl">
      <ConfigField label="Dirección Física" configKey="address" initialValue={address} />
      
      <div className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-2">Vista previa del mapa generado automáticamente:</p>
          {mapUrl ? (
            <iframe
              src={mapUrl}
              className="w-full h-[300px] border-0 rounded-lg"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          ) : (
            <div className="h-[300px] flex items-center justify-center bg-slate-100 rounded-lg text-slate-400">
              No hay dirección configurada
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FaqTab({ faqs }: { faqs: FaqItem[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [faqToDelete, setFaqToDelete] = useState<FaqItem | null>(null);

  async function handleMove(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= faqs.length) return;
    
    const newFaqs = [...faqs];
    const temp = newFaqs[index];
    newFaqs[index] = newFaqs[newIndex];
    newFaqs[newIndex] = temp;
    
    startTransition(() => {
      reorderFaqAction(newFaqs.map(f => f.id));
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Preguntas Frecuentes</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--ps-lila)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-colors"
        >
          <Plus className="size-4" /> Nueva Pregunta
        </button>
      </div>

      {isAdding && (
        <CreateFaqForm 
          onCancel={() => setIsAdding(false)} 
          onSuccess={() => setIsAdding(false)} 
        />
      )}

      <div className="space-y-3">
        {faqs.length === 0 ? (
          <p className="text-slate-500 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No hay preguntas frecuentes configuradas.
          </p>
        ) : (
          faqs.map((faq, index) => (
            <div key={faq.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4 shadow-sm relative">
              <div className="flex flex-col sm:flex-row gap-4 items-start w-full">
                <div className="flex-1 min-w-0 w-full">
                  {editingId === faq.id ? (
                    <EditFaqForm faq={faq} onCancel={() => setEditingId(null)} />
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-semibold text-slate-800" title={faq.question}>{faq.question}</h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${faq.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                          {faq.isActive ? 'Visible' : 'Oculto'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 whitespace-pre-line break-words">{faq.answer}</p>
                    </>
                  )}
                </div>
              </div>

              {editingId !== faq.id && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0}
                      className="p-1.5 bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md disabled:opacity-30 transition-colors"
                      title="Subir"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button 
                      onClick={() => handleMove(index, 1)}
                      disabled={index === faqs.length - 1}
                      className="p-1.5 bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md disabled:opacity-30 transition-colors"
                      title="Bajar"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        startTransition(() => {
                          toggleFaqAction(faq.id, !faq.isActive);
                        });
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors rounded-lg ${faq.isActive ? 'text-slate-600 bg-slate-100 hover:bg-slate-200' : 'text-green-700 bg-green-50 hover:bg-green-100'}`}
                    >
                      {faq.isActive ? <><X className="size-3.5" /> Ocultar</> : <><Check className="size-3.5" /> Mostrar</>}
                    </button>
                    <button
                      onClick={() => setEditingId(faq.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--ps-lila)] bg-[var(--ps-lila-pale)] hover:bg-[var(--ps-lila-light)] transition-colors rounded-lg"
                    >
                      <Pencil className="size-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => setFaqToDelete(faq)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors rounded-lg ml-1"
                    >
                      <Trash2 className="size-3.5" /> Borrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmDeleteModal
        open={faqToDelete !== null}
        title="¿Eliminar pregunta frecuente?"
        message={faqToDelete ? `¿Estás seguro de que quieres eliminar la pregunta "${faqToDelete.question}"? Esta acción no se puede deshacer.` : ""}
        onConfirm={() => {
          if (faqToDelete) {
            startTransition(() => {
              deleteFaqAction(faqToDelete.id);
            });
            setFaqToDelete(null);
          }
        }}
        onCancel={() => setFaqToDelete(null)}
        confirmText="Sí, eliminar"
        cancelText="No, cancelar"
      />
    </div>
  );
}

function CreateFaqForm({ onCancel, onSuccess }: { onCancel: () => void; onSuccess: () => void }) {
  const initialState: FaqFormState = {};
  const [state, action, isPending] = useActionState(createFaqAction, initialState);

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        onSuccess();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.success, onSuccess]);

  return (
    <form action={action} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium text-slate-800">Agregar Pregunta</h4>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X className="size-5" />
        </button>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Pregunta</label>
        <input 
          name="question" 
          required 
          maxLength={500}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ps-lila)] focus:border-transparent" 
        />
        {state.errors?.question && <p className="text-red-500 text-xs mt-1">{state.errors.question[0]}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Respuesta</label>
        <textarea 
          name="answer" 
          required 
          rows={3}
          maxLength={2000}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ps-lila)] focus:border-transparent" 
        />
        {state.errors?.answer && <p className="text-red-500 text-xs mt-1">{state.errors.answer[0]}</p>}
      </div>

      {state.errors?._form && <p className="text-red-500 text-sm">{state.errors._form[0]}</p>}
      {state.success && <p className="text-green-600 text-sm font-medium">✓ ¡Pregunta creada con éxito!</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium bg-[var(--ps-lila)] text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar Pregunta"}
        </button>
      </div>
    </form>
  );
}

function EditFaqForm({ faq, onCancel }: { faq: FaqItem; onCancel: () => void }) {
  const updateActionWithId = updateFaqAction.bind(null, faq.id);
  const initialState: FaqFormState = {};
  const [state, action, isPending] = useActionState(updateActionWithId, initialState);

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        onCancel();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.success, onCancel]);

  return (
    <form action={action} className="space-y-3">
      <div>
        <input 
          name="question" 
          defaultValue={faq.question}
          required 
          maxLength={500}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ps-lila)] focus:border-transparent" 
        />
        {state.errors?.question && <p className="text-red-500 text-xs mt-1">{state.errors.question[0]}</p>}
      </div>
      <div>
        <textarea 
          name="answer" 
          defaultValue={faq.answer}
          required 
          rows={3}
          maxLength={2000}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ps-lila)] focus:border-transparent" 
        />
        {state.errors?.answer && <p className="text-red-500 text-xs mt-1">{state.errors.answer[0]}</p>}
      </div>
      
      {state.errors?._form && <p className="text-red-500 text-sm">{state.errors._form[0]}</p>}
      {state.success && <p className="text-green-600 text-sm font-medium">✓ ¡Cambios guardados con éxito!</p>}

      <div className="flex gap-2 mt-2">
        <button 
          type="submit" 
          disabled={isPending}
          className="px-3 py-1.5 text-xs font-medium bg-[var(--ps-lila)] text-white rounded-md hover:opacity-90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar Cambios"}
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

interface ConfirmDeleteModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

function ConfirmDeleteModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
}: ConfirmDeleteModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onCancel}
      />

      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl z-10 border border-slate-100 transform scale-100 transition-all duration-300"
      >
        <div className="flex items-center gap-3 mb-4 text-red-600">
          <div className="p-2 bg-red-50 rounded-full">
            <Trash2 className="size-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {title}
          </h3>
        </div>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function BankTab({ config }: { config: Record<string, string> }) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Datos de Transferencia Bancaria</h3>
        <p className="text-sm text-slate-500 mb-6">
          Estos datos se mostrarán a los clientes al finalizar el agendamiento para que realicen la transferencia del abono de la reserva.
        </p>
      </div>

      <div className="space-y-4">
        <ConfigField
          label="Nombre del Titular"
          configKey="bank_owner_name"
          initialValue={config.bank_owner_name || ""}
        />
        <ConfigField
          label="RUT"
          configKey="bank_rut"
          initialValue={config.bank_rut || ""}
        />
        <ConfigField
          label="Banco"
          configKey="bank_name"
          initialValue={config.bank_name || ""}
        />
        <ConfigField
          label="Tipo de Cuenta (ej: Corriente, Vista, Ahorro)"
          configKey="bank_account_type"
          initialValue={config.bank_account_type || ""}
        />
        <ConfigField
          label="Número de Cuenta"
          configKey="bank_account_number"
          initialValue={config.bank_account_number || ""}
        />
        <ConfigField
          label="Correo Electrónico (para comprobantes)"
          configKey="bank_email"
          initialValue={config.bank_email || ""}
        />
      </div>
    </div>
  );
}

