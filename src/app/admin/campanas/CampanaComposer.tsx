"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Highlight from "@tiptap/extension-highlight";
import { Extension } from "@tiptap/core";
import { useActionState, useState, useCallback } from "react";
import { sendCampaignAction, type CampaignState } from "./actions";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough as StrikeIcon,
  Subscript as SubIcon,
  Superscript as SuperIcon,
  Heading2,
  List,
  Eraser,
} from "lucide-react";

// Extensiones TipTap personalizadas para soporte de tamaño de letra, transformaciones y efectos
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: any) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }: any) => {
          return chain().setMark("textStyle", { fontSize: null }).run();
        },
    } as any;
  },
});

const TextTransform = Extension.create({
  name: "textTransform",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textTransform: {
            default: null,
            parseHTML: (element) => element.style.textTransform,
            renderHTML: (attributes) => {
              if (!attributes.textTransform) {
                return {};
              }
              return {
                style: `text-transform: ${attributes.textTransform}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setTextTransform:
        (textTransform: string) =>
        ({ chain }: any) => {
          return chain().setMark("textStyle", { textTransform }).run();
        },
      unsetTextTransform:
        () =>
        ({ chain }: any) => {
          return chain().setMark("textStyle", { textTransform: null }).run();
        },
    } as any;
  },
});

const TextShadow = Extension.create({
  name: "textShadow",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textShadow: {
            default: null,
            parseHTML: (element) => element.style.textShadow,
            renderHTML: (attributes) => {
              if (!attributes.textShadow) {
                return {};
              }
              return {
                style: `text-shadow: ${attributes.textShadow}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setTextShadow:
        (textShadow: string) =>
        ({ chain }: any) => {
          return chain().setMark("textStyle", { textShadow }).run();
        },
      unsetTextShadow:
        () =>
        ({ chain }: any) => {
          return chain().setMark("textStyle", { textShadow: null }).run();
        },
    } as any;
  },
});

// Declaración de módulos de TypeScript para TipTap
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
    textTransform: {
      setTextTransform: (transform: string) => ReturnType;
      unsetTextTransform: () => ReturnType;
    };
    textShadow: {
      setTextShadow: (shadow: string) => ReturnType;
      unsetTextShadow: () => ReturnType;
    };
  }
}

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
  "p-1.5 rounded transition-colors hover:bg-neutral-200 disabled:opacity-40 text-neutral-700";

const ACTIVE_BTN = "bg-neutral-250 font-bold text-purple-700 bg-purple-100";

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
      TextStyle,
      Color,
      FontFamily,
      Subscript,
      Superscript,
      Highlight.configure({ multicolor: true }),
      FontSize,
      TextTransform,
      TextShadow,
      Placeholder.configure({ placeholder: "Escribe tu mensaje aquí…" }),
    ],
    onUpdate: ({ editor }) => {
      setHtmlBody(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[300px] px-6 py-4 focus:outline-none prose prose-sm max-w-none shadow-inner rounded-b-xl border-t-0 border-neutral-200",
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
          className="rounded-xl border overflow-hidden bg-neutral-50 shadow-sm"
          style={{ borderColor: "var(--border)" }}
        >
          {/* Toolbar */}
          <div
            className="flex flex-col gap-2 p-3 border-b bg-neutral-100"
            style={{
              borderColor: "var(--border)",
            }}
          >
            {/* Fila 1: Estilos Básicos */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`${TOOLBAR_BTN} ${editor?.isActive("bold") ? ACTIVE_BTN : ""}`}
                title="Negrita (Ctrl+B)"
              >
                <BoldIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`${TOOLBAR_BTN} ${editor?.isActive("italic") ? ACTIVE_BTN : ""}`}
                title="Cursiva (Ctrl+I)"
              >
                <ItalicIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                className={`${TOOLBAR_BTN} ${editor?.isActive("underline") ? ACTIVE_BTN : ""}`}
                title="Subrayado (Ctrl+U)"
              >
                <UnderlineIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                className={`${TOOLBAR_BTN} ${editor?.isActive("strike") ? ACTIVE_BTN : ""}`}
                title="Tachado"
              >
                <StrikeIcon className="w-4 h-4" />
              </button>

              <span className="w-px h-5 bg-neutral-300 mx-1" />

              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleSubscript().run()}
                className={`${TOOLBAR_BTN} ${editor?.isActive("subscript") ? ACTIVE_BTN : ""}`}
                title="Subíndice"
              >
                <SubIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleSuperscript().run()}
                className={`${TOOLBAR_BTN} ${editor?.isActive("superscript") ? ACTIVE_BTN : ""}`}
                title="Superíndice"
              >
                <SuperIcon className="w-4 h-4" />
              </button>

              <span className="w-px h-5 bg-neutral-300 mx-1" />

              <button
                type="button"
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={`${TOOLBAR_BTN} ${editor?.isActive("heading", { level: 2 }) ? ACTIVE_BTN : ""}`}
                title="Título H2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`${TOOLBAR_BTN} ${editor?.isActive("bulletList") ? ACTIVE_BTN : ""}`}
                title="Lista"
              >
                <List className="w-4 h-4" />
              </button>

              <span className="w-px h-5 bg-neutral-300 mx-1" />

              <button
                type="button"
                onClick={() => {
                  editor?.chain().focus()
                    .unsetBold()
                    .unsetItalic()
                    .unsetUnderline()
                    .unsetStrike()
                    .unsetFontFamily()
                    .unsetFontSize()
                    .unsetColor()
                    .unsetHighlight()
                    .unsetTextTransform()
                    .unsetTextShadow()
                    .run();
                }}
                className="px-2 py-1 rounded text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-1 border border-transparent hover:border-red-200"
                title="Limpiar todo el formato seleccionado"
              >
                <Eraser className="w-3.5 h-3.5" /> Limpiar
              </button>
            </div>

            {/* Fila 2: Apariencia, Colores y Efectos Avanzados */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Familia de fuente */}
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    editor?.chain().focus().setFontFamily(val).run();
                  } else {
                    editor?.chain().focus().unsetFontFamily().run();
                  }
                }}
                className="bg-white border border-neutral-300 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[var(--primary)] focus:outline-none text-neutral-700 font-medium"
              >
                <option value="">Fuente: Predeterminada</option>
                <option value="Georgia, serif">Georgia (Elegante)</option>
                <option value="Courier New, monospace">Courier New (Monospacio)</option>
                <option value="system-ui, -apple-system, sans-serif">Moderno (System)</option>
                <option value="Trebuchet MS, sans-serif">Trebuchet MS (Redonda)</option>
              </select>

              {/* Tamaño de fuente */}
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    editor?.chain().focus().setFontSize(val).run();
                  } else {
                    editor?.chain().focus().unsetFontSize().run();
                  }
                }}
                className="bg-white border border-neutral-300 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[var(--primary)] focus:outline-none text-neutral-700 font-medium"
              >
                <option value="">Tamaño: Predeterminado</option>
                <option value="12px">12px (Chico)</option>
                <option value="14px">14px (Mediano)</option>
                <option value="16px">16px (Normal)</option>
                <option value="18px">18px (Grande)</option>
                <option value="20px">20px (Muy Grande)</option>
                <option value="24px">24px (Subtítulo)</option>
                <option value="30px">30px (Título)</option>
                <option value="36px">36px (Gigante)</option>
              </select>

              {/* Color de Texto */}
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    editor?.chain().focus().setColor(val).run();
                  } else {
                    editor?.chain().focus().unsetColor().run();
                  }
                }}
                className="bg-white border border-neutral-300 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[var(--primary)] focus:outline-none text-neutral-700 font-medium"
              >
                <option value="">Color: Predeterminado</option>
                <option value="#000000">Negro</option>
                <option value="#4b5563">Gris Oscuro</option>
                <option value="#c17b5c">Petit Salon Marrón</option>
                <option value="#7c3aed">Lila Primario</option>
                <option value="#ef4444">Rojo Intenso</option>
                <option value="#f97316">Naranja Cálido</option>
                <option value="#10b981">Verde Vital</option>
                <option value="#3b82f6">Azul Eléctrico</option>
                <option value="#ec4899">Rosa Chicle</option>
              </select>

              {/* Resaltado / Fondo */}
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    editor?.chain().focus().setHighlight({ color: val }).run();
                  } else {
                    editor?.chain().focus().unsetHighlight().run();
                  }
                }}
                className="bg-white border border-neutral-300 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[var(--primary)] focus:outline-none text-neutral-700 font-medium"
              >
                <option value="">Fondo: Sin resaltar</option>
                <option value="#fef08a">Resaltar Amarillo</option>
                <option value="#bbf7d0">Resaltar Verde</option>
                <option value="#bfdbfe">Resaltar Azul</option>
                <option value="#e9d5ff">Resaltar Lila</option>
                <option value="#fbcfe8">Resaltar Rosa</option>
              </select>

              {/* Mayúsculas/Minúsculas */}
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    editor?.chain().focus().setTextTransform(val).run();
                  } else {
                    editor?.chain().focus().unsetTextTransform().run();
                  }
                }}
                className="bg-white border border-neutral-300 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[var(--primary)] focus:outline-none text-neutral-700 font-medium"
              >
                <option value="">Caja: Normal</option>
                <option value="uppercase">MAYÚSCULAS</option>
                <option value="lowercase">minúsculas</option>
                <option value="capitalize">Capitalizar Palabras</option>
              </select>

              {/* Efectos Avanzados (Sombra/Contorno) */}
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    editor?.chain().focus().setTextShadow(val).run();
                  } else {
                    editor?.chain().focus().unsetTextShadow().run();
                  }
                }}
                className="bg-white border border-neutral-300 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[var(--primary)] focus:outline-none text-neutral-700 font-medium"
              >
                <option value="">Efectos: Ninguno</option>
                <option value="1px 1px 2px rgba(0,0,0,0.15)">Sombra Suave</option>
                <option value="3px 3px 0px rgba(193,123,92,0.3)">Sombra Retro</option>
                <option value="0 0 5px rgba(124,58,237,0.6)">Neón Resplandor Lila</option>
                <option value="0 0 5px rgba(193,123,92,0.6)">Neón Resplandor Marrón</option>
                <option value="1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000">Contorno Negro</option>
              </select>
            </div>
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
