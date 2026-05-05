# Plan: Agenda para Peluquería Canina

> Documento de planificación para un nuevo proyecto independiente.
> Fecha de creación: 4 de mayo de 2026.

---

## Visión General

Un sistema con dos caras: **landing pública** (servicios, galería, contacto) y **panel privado** para la dueña (agenda, fichas de perros, clientes). Solo el dueño del negocio necesita login — los clientes no.

---

## Stack Recomendado (costo $0/mes)

| Capa          | Tecnología                                         | Costo              |
| ------------- | -------------------------------------------------- | ------------------ |
| Framework     | **Next.js 15** (App Router) + TypeScript           | Gratis             |
| Hosting       | **Vercel Hobby** (dominio propio, SSL incluido)    | **Gratis**         |
| Base de datos | **Neon** (PostgreSQL serverless)                   | **Gratis** (0.5GB) |
| ORM           | **Prisma**                                         | Gratis             |
| Autenticación | **NextAuth.js v5** (solo credentials)              | Gratis             |
| Estilos       | **Tailwind CSS 4** + **shadcn/ui** + Framer Motion | Gratis             |
| Imágenes      | **Cloudinary** (free tier: 25GB)                   | **Gratis**         |
| Dominio       | Ya lo tienen ✓                                     | $0                 |

**Total mensual: $0**

> Vercel Hobby soporta dominio personalizado, SSL automático y deployments ilimitados desde GitHub. Para un negocio pequeño es más que suficiente (100GB bandwidth/mes).

---

## Arquitectura de la Aplicación

### Cara Pública (sin login)

- `/` — Landing page con hero, servicios, galería, testimonios, CTA
- `/servicios` — Detalle de precios y servicios
- `/contacto` — Formulario + WhatsApp link
- `/reservar` — Formulario de solicitud de cita (sin cuenta)

### Panel Admin (con login)

- `/admin` — Dashboard: citas del día, métricas rápidas
- `/admin/agenda` — Vista calendario (semana/mes/día)
- `/admin/citas` — Lista de citas con filtros
- `/admin/perros` — Fichas de perros
- `/admin/clientes` — Información de dueños
- `/admin/servicios` — CRUD de servicios y precios

---

## Modelo de Datos (Prisma)

```prisma
model Owner {
  id           String        @id @default(cuid())
  name         String
  phone        String
  email        String?
  createdAt    DateTime      @default(now())
  dogs         Dog[]
}

model Dog {
  id           String        @id @default(cuid())
  name         String
  breed        String
  birthDate    DateTime?
  notes        String?       // alergias, comportamiento, temperamento
  photo        String?       // URL de Cloudinary
  ownerId      String
  owner        Owner         @relation(fields: [ownerId], references: [id])
  appointments Appointment[]
  attendances  Attendance[]
  createdAt    DateTime      @default(now())
}

model Appointment {
  id        String            @id @default(cuid())
  calComUid String?           @unique // Referencia al ID único de la reserva en Cal.com
  date      DateTime
  status    AppointmentStatus @default(PENDING)
  serviceId String
  service   Service           @relation(fields: [serviceId], references: [id])
  dogId     String
  dog       Dog               @relation(fields: [dogId], references: [id])
  notes     String?
  createdAt DateTime          @default(now())
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  DONE
  CANCELLED
}

model Attendance {
  id        String   @id @default(cuid())
  date      DateTime
  service   String
  notes     String?  // qué se hizo, observaciones post-atención
  photos    String[] // URLs de Cloudinary (antes/después)
  dogId     String
  dog       Dog      @relation(fields: [dogId], references: [id])
  createdAt DateTime @default(now())
}

model Service {
  id           String        @id @default(cuid())
  name         String
  price        Int           // CLP
  duration     Int           // minutos
  description  String?
  isActive     Boolean       @default(true)
  appointments Appointment[]
}

model AdminUser {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // hash bcryptjs
  name      String
  createdAt DateTime @default(now())
}
```

---

## Estrategia de Agenda: Cal.com Embed + Webhooks ✅ (Recomendada)

En lugar de construir y mantener un sistema de calendario desde cero (lo cual requiere lidiar con zonas horarias, disponibilidad concurrente, recordatorios por correo y sincronización de Google Calendar), utilizaremos **Cal.com** en su plan gratuito (SaaS cloud).

### Arquitectura del Flujo de Reservas:

1. **Frontend (Cara Pública):** La página `/reservar` utilizará `@calcom/embed-react` para cargar el widget de reservas incrustado en nuestra UI.
2. **Configuración de Cal.com:** Se configurarán los tipos de servicio (ej. Baño, Corte) y se agregarán campos personalizados obligatorios (Custom Fields): _Nombre del Perro_, _Raza_ y _Teléfono_.
3. **Backend & Webhooks:** Next.js expondrá una ruta de API (ej. `POST /api/webhooks/calcom`). Cal.com enviará los datos de la reserva apenas el cliente confirme o cancele una cita.
4. **Sincronización Local:** El webhook leerá los datos y creará/validará en nuestra BD (**Neon/Prisma**) el `Owner`, el `Dog` y finalmente el `Appointment` (marcado y sincronizado a través de `calComUid`).

**Beneficios Clave:**

- **Costo Inteligente:** $0/mes manteniendo un nivel Enterprise.
- **Correos y Notificaciones:** Cal.com gestiona automáticamente los recordatorios por email e invitaciones para el calendario del cliente y la dueña de la peluquería.
- **Ahorro de Desarrollo:** Ganamos al menos 40% de tiempo al delegar la compleja interfaz de selección de slots y fechas.
- **Integridad de Datos:** Gracias al Webhook, el panel de `/admin` local todavía retiene métricas de negocios, perfiles de mascotas y el rico historial veterinario en nuestra propia base de datos Postgres.

**Conclusión: Opción A.** El valor del producto está en la integración entre agenda + fichas de perros + historial de atenciones. Eso no lo ofrece ningún servicio externo gratuito.

---

## Buenas Prácticas a Implementar desde el Inicio

Tomadas del proyecto Puentes de Bienestar:

- **Production-first:** `npm run build` verde antes de cualquier deploy. Cero errores de TypeScript ni ESLint.
- **Zod** para validar variables de entorno en `src/env.js` — nunca usar `process.env` directamente.
- **Mobile-first** con Tailwind — diseñar para pantallas pequeñas primero.
- **`"use client"` solo en hojas interactivas** (formularios, calendario, botones con estado).
- **tRPC** para comunicación type-safe entre servidor y cliente (o Route Handlers simples si se prefiere stack más liviano).
- **Zero warnings** antes de cada commit — sin imports ni variables sin usar.
- **Nunca concatenar strings para clases de Tailwind** (ej: evitar `` `bg-${color}-500` ``). Usar nombres completos o mapeos de objetos estáticos para que el compilador no las elimine en producción.
- **Evitar hydration mismatch:** cuidado con fechas/zonas horarias entre servidor y cliente.

---

## Diseño: Identidad Visual

Para una peluquería canina profesional y llamativa:

- **Paleta sugerida:** Terracota cálido + blanco roto + verde salvia
  - Transmite cuidado, calidez y conexión con la naturaleza
  - Alternativa: Lila suave + blanco + dorado (más premium)
- **Tipografía:** Serif amigable para títulos (`Playfair Display`) + sans-serif limpia para cuerpo (`Inter`)
- **Elementos visuales:** Ilustraciones lineales de perros, fotos reales de calidad, transiciones suaves con Framer Motion
- **Mobile-first:** Hero con CTA de WhatsApp o botón de reserva bien visible en móvil
- **Secciones landing:** Hero → Servicios → Galería (fotos antes/después) → Testimonios → CTA de contacto

---

## Roadmap Sugerido

### Fase 1 — MVP (~2 semanas)

- [ ] Setup: Next.js 15 + Neon + Prisma + NextAuth.js v5
- [ ] Landing pública (hero, servicios, contacto)
- [ ] Login admin (un solo usuario, credentials)
- [ ] CRUD clientes + fichas de perros
- [ ] Agenda básica con FullCalendar
- [ ] Deploy en Vercel con dominio propio

### Fase 2 (~1 semana)

- [ ] Fichas de atención completadas con fotos (Cloudinary)
- [ ] Historial de atenciones por perro
- [ ] Notificaciones por WhatsApp (link directo o Twilio free tier)

### Fase 3 — Opcional / Futuro

- [ ] Formulario de solicitud de cita desde la web pública
- [ ] Recordatorios automáticos por correo o WhatsApp
- [ ] Estadísticas y reportes básicos (clientes nuevos, ingresos)
- [ ] Galería de fotos editable desde el admin

---

## Variables de Entorno Requeridas

```env
# Base de datos (Neon)
DATABASE_URL=""

# Auth (NextAuth.js)
NEXTAUTH_URL=""
NEXTAUTH_SECRET=""

# Cloudinary (imágenes)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# App
NEXT_PUBLIC_APP_URL=""
NEXT_PUBLIC_WHATSAPP_NUMBER=""  # Número para el botón de WhatsApp
```

---

## Punto de Venta del Producto

Lo que hace valioso este sistema para la clienta:

1. **Todo en uno:** agenda + historial del perro + info del cliente en un solo lugar
2. **Sin apps de terceros** que cobren mensualidad
3. **Diseño que vende** — la landing puede atraer clientes nuevos desde Google
4. **$0/mes de operación**, solo el dominio (que ya tiene)
5. **Desde el celular** — puede gestionar todo desde su smartphone
6. **Historial real:** sabe exactamente qué se hizo en cada visita, alergias, temperamento del perro

---

## Comandos de Referencia (inicio de proyecto)

```bash
# Crear proyecto
pnpm create t3-app@latest

# O desde cero con Next.js
npx create-next-app@latest nombre-proyecto --typescript --tailwind --app

# Agregar shadcn/ui
npx shadcn@latest init

# Agregar FullCalendar
pnpm add @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction

# Agregar Cloudinary
pnpm add next-cloudinary
```
