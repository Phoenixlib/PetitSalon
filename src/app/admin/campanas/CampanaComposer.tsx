"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useActionState, useState, useCallback } from "react";
import { sendCampaignAction, type CampaignState } from "./actions";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Props {
  clients: Client[];
}

const TOOLBAR_BTN =
  "px-2 py-1 rounded text-sm font-medium transition-colors hover:bg-gray-200 disabled:opacity-40";

const ACTIVE_BTN = "bg-gray-200";

export default function CampanaComposer({ clients }: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(clients.map((c) => c.id)),
  );

  // Keep HTML body in sync so hidden input is always current when form submits
  const [htmlBody, setHtmlBody] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: "Escribe tu mensaje aquí…" }),
    ],
    onUpdate: ({ editor }) => {
      setHtmlBody(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] px-4 py-3 focus:outline-none prose prose-sm max-w-none",
      },
    },
  });

  const initialState: CampaignState = {};
  const [state, formAction, isPending] = useActionState(
    sendCampaignAction,
    initialState,
  );

  const toggleAll = useCallback(() => {
    setSelected(
      selected.size === clients.length
        ? new Set()
        : new Set(clients.map((c) => c.id)),
    );
  }, [selected.size, clients]);

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center space-y-3">
        <span className="text-5xl">✅</span>
        <h2 className="text-xl font-bold text-emerald-800">
          ¡Campaña enviada!
        </h2>
        <p className="text-emerald-700 text-sm">
          <strong>{state.sent}</strong> correos enviados exitosamente.
          {(state.failed ?? 0) > 0 && (
            <> &nbsp;·&nbsp; <strong>{state.failed}</strong> fallaron.</>
          )}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-full px-6 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--primary)" }}
        >
          Nueva campaña
        </button>
      </div>
    );
  }

  return (
    // Use action={formAction} — React handles the transition correctly
    <form action={formAction} className="space-y-6">
      {/* Hidden inputs — set via state, not DOM manipulation */}
      <input type="hidden" name="htmlBody" value={htmlBody} readOnly />
      {Array.from(selected).map((id) => (
        <input key={id} type="hidden" name="recipientIds" value={id} readOnly />
      ))}

      {/* Asunto */}
      <div className="space-y-1">
        <label
          className="text-sm font-semibold"
          style={{ color: "var(--ps-text)" }}
        >
          Asunto del correo *
        </label>
        <input
          name="subject"
          type="text"
          required
          placeholder="Ej: ¡Promoción de primavera para tus peluditos! 🌸"
          className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: "var(--border)", color: "var(--ps-text)" }}
        />
        {state.errors?.subject && (
          <p className="text-red-500 text-xs">{state.errors.subject[0]}</p>
        )}
      </div>

      {/* Editor de texto enriquecido */}
      <div className="space-y-1">
        <label
          className="text-sm font-semibold"
          style={{ color: "var(--ps-text)" }}
        >
          Mensaje *
        </label>
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--border)" }}
        >
          {/* Toolbar */}
          <div
            className="flex flex-wrap gap-1 px-3 py-2 border-b"
            style={{
              backgroundColor: "var(--ps-lila-base)",
              borderColor: "var(--border)",
            }}
          >
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`${TOOLBAR_BTN} ${editor?.isActive("bold") ? ACTIVE_BTN : ""}`}
              title="Negrita"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`${TOOLBAR_BTN} ${editor?.isActive("italic") ? ACTIVE_BTN : ""}`}
              title="Cursiva"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={`${TOOLBAR_BTN} ${editor?.isActive("underline") ? ACTIVE_BTN : ""}`}
              title="Subrayado"
            >
              <u>S</u>
            </button>
            <span
              className="w-px mx-1 self-stretch"
              style={{ backgroundColor: "var(--border)" }}
            />
            <button
              type="button"
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={`${TOOLBAR_BTN} ${editor?.isActive("heading", { level: 2 }) ? ACTIVE_BTN : ""}`}
              title="Título"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`${TOOLBAR_BTN} ${editor?.isActive("bulletList") ? ACTIVE_BTN : ""}`}
              title="Lista"
            >
              ≡
            </button>
            <span
              className="w-px mx-1 self-stretch"
              style={{ backgroundColor: "var(--border)" }}
            />
            <span className="text-xs self-center text-gray-500 select-none">
              💡 Pega emojis directamente en el texto
            </span>
          </div>

          {/* Content area */}
          <div className="bg-white">
            <EditorContent editor={editor} />
          </div>
        </div>
        {state.errors?.htmlBody && (
          <p className="text-red-500 text-xs">{state.errors.htmlBody[0]}</p>
        )}
      </div>

      {/* Selector de destinatarios */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label
            className="text-sm font-semibold"
            style={{ color: "var(--ps-text)" }}
          >
            Destinatarios *
          </label>
          <span className="text-xs" style={{ color: "var(--ps-text-mid)" }}>
            {selected.size} de {clients.length} seleccionados
          </span>
        </div>

        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--border)" }}
        >
          {/* Seleccionar todos */}
          <label
            className="flex items-center gap-3 px-4 py-3 cursor-pointer border-b"
            style={{
              backgroundColor: "var(--ps-lila-base)",
              borderColor: "var(--border)",
            }}
          >
            <input
              type="checkbox"
              checked={selected.size === clients.length}
              onChange={toggleAll}
              className="w-4 h-4 rounded"
              style={{ accentColor: "var(--primary)" }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--ps-text)" }}
            >
              Seleccionar todos
            </span>
          </label>

          {/* Lista de clientes */}
          <div className="bg-white divide-y max-h-64 overflow-y-auto">
            {clients.map((client) => (
              <label
                key={client.id}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.has(client.id)}
                  onChange={() => toggleOne(client.id)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: "var(--primary)" }}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--ps-text)" }}
                  >
                    {client.name}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: "var(--ps-text-mid)" }}
                  >
                    {client.email}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {state.errors?.recipientIds && (
          <p className="text-red-500 text-xs">
            {state.errors.recipientIds[0]}
          </p>
        )}
      </div>

      {state.errors?._form && (
        <p className="text-red-500 text-sm text-center">
          {state.errors._form[0]}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || selected.size === 0}
        className="w-full rounded-full py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "var(--primary)" }}
      >
        {isPending
          ? `Enviando a ${selected.size} clientes…`
          : `Enviar campaña a ${selected.size} cliente${selected.size !== 1 ? "s" : ""} 📨`}
      </button>
    </form>
  );
}
