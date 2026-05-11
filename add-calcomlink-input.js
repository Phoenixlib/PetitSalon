const fs = require('fs');
let code = fs.readFileSync('src/components/admin/ServiceModal.tsx', 'utf8');

const insertPoint = '<div className="flex justify-end gap-3 pt-1">';
const inputXml = `
          {/* Link de Cal.com */}
          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--ps-text)" }}
            >
              Enlace de Cal.com{" "}
              <span style={{ color: "var(--ps-text-mid)", fontWeight: 400 }}>
                (opcional)
              </span>
            </label>
            <input
              type="text"
              name="calComLink"
              defaultValue={service?.calComLink || ""}
              placeholder="Ej: pequeños/corte-perro-pequeno"
              className="w-full rounded-xl px-4 py-2.5 text-sm transition-shadow focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "#f9fafb",
                border: "1px solid var(--border)",
              }}
            />
            {state.errors && "calComLink" in state.errors && (
              <p className="text-xs text-red-500 mt-1">
                {(state.errors as any).calComLink?.[0]}
              </p>
            )}
            <p className="text-xs mt-1" style={{ color: "var(--ps-text-mid)" }}>
              Si se deja en blanco usará el link por defecto configurado.
            </p>
          </div>

          {state.errors?._form && (`;

code = code.replace('{state.errors?._form && (', inputXml);
fs.writeFileSync('src/components/admin/ServiceModal.tsx', code);
