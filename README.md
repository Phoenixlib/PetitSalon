# 🐾 Petitsalon — Gestión Integral de Peluquería Canina

Bienvenido al repositorio de **Petitsalon**, una plataforma moderna diseñada para la gestión eficiente de una peluquería canina. El sistema combina una landing page pública atractiva y dinámica para clientes, junto con un potente panel administrativo privado para la dueña del negocio.

---

## 🚀 Visión General del Sistema

La plataforma está diseñada con una arquitectura de dos caras:

1. **Landing Pública (Sin Autenticación):** Vitrina elegante que muestra servicios, galería de trabajos, reseñas, y facilita el agendamiento y contacto directo. Los clientes no necesitan crear cuenta.
2. **Panel de Administración (Privado):** Herramienta exclusiva para la administración del negocio. Permite gestionar citas (vía FullCalendar), llevar el historial clínico y estético de las mascotas, administrar clientes, editar servicios, enviar campañas de email, moderar reseñas y modificar el contenido del sitio web.

---

## 🛠️ Stack Tecnológico

El proyecto está construido priorizando rendimiento, developer experience y costo cero de infraestructura ($0/mes) mediante el uso estratégico de plataformas serverless.

| Capa | Tecnología |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) + TypeScript |
| **Hosting** | Vercel Hobby |
| **Base de Datos** | Neon (PostgreSQL Serverless) con `@neondatabase/serverless` |
| **ORM** | Prisma 6 |
| **Autenticación** | NextAuth.js v5 (Auth.js) - Credentials |
| **Estilos & UI** | Tailwind CSS 4, shadcn/ui, Framer Motion |
| **Imágenes** | Cloudinary (Subida directa desde el browser) |
| **Reservas & Calendario** | Cal.com (Embed + Webhooks) y FullCalendar |
| **Formularios & Validaciones** | react-hook-form, Zod |
| **Emailing** | Nodemailer (Campañas) y TipTap (Editor WYSIWYG) |

---

## 🗺️ Arquitectura de Rutas

### Cara Pública `(public)`
- `/` - Landing page: Hero, servicios destacados, galería, reseñas, FAQ.
- `/servicios` - Detalle completo de precios y servicios.
- `/contacto` - Formulario de contacto y link directo a WhatsApp.
- `/reservar` - Embed de reservas con Cal.com y datos bancarios para abono.
- `/resena/[token]` - Formulario de evaluación post-atención (acceso único por token).

### Panel de Administración `/admin`
- `/admin` - Dashboard principal y métricas.
- `/admin/agenda` - Vista de calendario interactiva (FullCalendar).
- `/admin/citas` - Listado y gestión de estados de citas.
- `/admin/perros` - Fichas caninas (historial, edad, notas de comportamiento).
- `/admin/clientes` - Base de datos de dueños.
- `/admin/servicios` - CRUD de servicios y categorías (drag & drop).
- `/admin/galeria` - Gestión de fotos.
- `/admin/resenas` - Tablero Kanban para moderar reseñas (Pendiente → Aprobada/Rechazada).
- `/admin/campanas` - Creación y envío masivo de correos (editor TipTap).
- `/admin/contenido` - Gestión dinámica del sitio web (Contacto, FAQ, Mapa, Cuentas Bancarias).

---

## ⚙️ Variables de Entorno

Para ejecutar este proyecto, copia el archivo `.env.example` a `.env` o `.env.local` y configura las siguientes variables obligatorias:

```env
# Base de datos (Neon PostgreSQL)
DATABASE_URL="postgres://user:pass@ep-host.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=10"
DIRECT_URL="postgres://user:pass@ep-host.region.aws.neon.tech/neondb?sslmode=require"

# Autenticación
NEXTAUTH_SECRET="tu_secreto_super_seguro"

# Cal.com
CALCOM_WEBHOOK_SECRET="secreto_hmac_webhook"
NEXT_PUBLIC_CALCOM_LINK="usuario/tipo-evento"

# Cloudinary
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"

# Nodemailer (Campañas)
EMAIL_HOST="smtp.tuhost.com"
EMAIL_PORT="465"
EMAIL_USER="tu_correo"
EMAIL_PASS="tu_contraseña"
```

---

## 📦 Instalación y Desarrollo Local

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd petitsalon
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar Prisma y Base de Datos:**
   Asegúrate de que tus credenciales de base de datos estén listas en `.env`.
   ```bash
   npx prisma generate
   npx prisma db push
   # Opcional: npx prisma db seed (si cuentas con un archivo de seeding)
   ```

4. **Iniciar el servidor:**
   ```bash
   npm run dev
   ```

El proyecto estará corriendo en `http://localhost:3000`.

---

## 🛑 Reglas Innegociables y Buenas Prácticas

Todo el código que se integre a este proyecto debe regirse por las siguientes directrices (Documentadas a fondo en `SKILL.md`):

1. **Production-First:** Cero errores TypeScript o ESLint (`npm run build` debe pasar en verde).
2. **Mobile-First Estricto:** La UI del panel de administración está pensada primero para visualización en celular. Se prefieren *Cards* en lugar de tablas horizontales.
3. **Variables de Entorno seguras:** Utilizar siempre validación con `Zod` (ubicado en `src/env.ts`). Nunca leer `process.env` directamente en los componentes.
4. **Server Actions vs API Routes:** Utilizar Server Actions (`"use server"`) y `useActionState` para mutaciones desde el panel administrativo. Los Route Handlers (`/api/...`) se reservan para webhooks y endpoints públicos.
5. **No Hydration Mismatch:** Manejar correctamente fechas y zonas horarias (`America/Santiago`) desde el cliente.
6. **Manejo de Imágenes:** Todas las imágenes se redimensionan en el cliente vía Canvas (si superan 1600px) y se suben *directamente* a Cloudinary mediante URL firmada. El servidor Next.js **nunca** debe procesar o almacenar binarios.
7. **Type-Safety End-to-End:** Prohibido usar `any`.
8. **Tokens CSS:** Los estilos deben utilizar las variables definidas (`var(--primary)`, `var(--secondary)`, etc.). No forzar clases de colores (e.g. `bg-blue-500`) en la UI.

---

## 🎨 Identidad Visual

El diseño utiliza una identidad vibrante y moderna basada en tokens CSS:

- **Primario (`--primary`):** Azul Cian Vibrante (`#42c2ed`)
- **Secundario (`--secondary`):** Magenta (`#e91e63`)
- **Acento (`--accent`):** Amarillo Intenso (`#faa61a`)
- **Pasteles de fondo:** Tonos suaves (Cyan, Pink, Peach, Yellow) para tarjetas y fondos ligeros.
- **Tipografías:** *Playfair Display* (Títulos) e *Inter* (Cuerpo).

---

## 🧪 Pruebas (Testing)

El sistema soporta distintos flujos de testing mediante **Playwright**:
- E2E Testing (Page Object Model).
- API Testing.
- Visual Regression Testing.
- Accessibility Auditing (WCAG).

*(Ver carpeta `.agents/skills` para mayor documentación sobre los comandos)*

---

Desarrollado para asegurar el bienestar, organización y cariño hacia las mascotas. 🐶✂️
