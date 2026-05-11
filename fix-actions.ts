import { writeFileSync, readFileSync } from 'fs';

const path = 'src/app/admin/clientes/actions.ts';
let code = readFileSync(path, 'utf8');

if (!code.includes('requireAdmin')) {
  // Add requireAdmin import and function
  const imports = `import { auth } from "@/auth";\n`;
  const requireAdminFn = `\nasync function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
}\n\n`;

  code = code.replace('import { prisma }', imports + 'import { prisma }');
  code = code.replace('export async function createClientWithDog', requireAdminFn + 'export async function createClientWithDog');
  
  // Actually inject requireAdmin call inside the function
  code = code.replace(
    'export async function createClientWithDog(formData: FormData) {',
    'export async function createClientWithDog(formData: FormData) {\n  await requireAdmin();'
  );

  writeFileSync(path, code);
  console.log("actions.ts fixed with requireAdmin");
} else {
  console.log("actions.ts already has requireAdmin");
}
