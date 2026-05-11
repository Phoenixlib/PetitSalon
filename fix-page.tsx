const fs = require('fs');
const path = 'src/app/admin/clientes/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace button with Link
code = code.replace(
  /<button className="text-\[var\(--primary\)] hover:underline font-medium text-xs">\s*Ver detalle\s*<\/button>/g,
  '<Link href={`/admin/clientes/${owner.id}`} className="text-[var(--primary)] hover:underline font-medium text-xs">\n                      Ver detalle →\n                    </Link>'
);

// Add searchParams to signature and search input
code = code.replace(
  'export default async function ClientesPage() {',
  `export default async function ClientesPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const q = searchParams.q?.trim() ?? "";`
);

code = code.replace(
  `  const owners = await prisma.owner.findMany({
    include: {`,
  `  const owners = await prisma.owner.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {`
);

code = code.replace(
  /<div className="flex items-center justify-between">\s*<h1 className="text-3xl font-bold tracking-tight">Clientes<\/h1>/,
  `<div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        
        <form method="GET" className="flex items-center relative mx-4 flex-1 max-w-md">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre, teléfono o email..."
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          <button type="submit" className="absolute right-3 text-neutral-400">
            🔍
          </button>
        </form>`
);

fs.writeFileSync(path, code);
console.log("page.tsx updated with Link and search form");
