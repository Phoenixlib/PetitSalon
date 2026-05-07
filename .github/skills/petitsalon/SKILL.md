---
name: petitsalon
description: "Reglas fundamentales del proyecto Petitsalon (peluquería canina). Consultar SIEMPRE antes de programar cualquier feature, ruta, componente o modelo. Cubre stack, arquitectura, modelos de datos, diseño e identidad visual, buenas prácticas y roadmap."
argument-hint: "Consultar reglas antes de implementar"
---

# Petitsalon — Reglas Fundamentales del Proyecto

## Descripción del Sistema

Dos caras:

- **Landing pública** (servicios, galería, contacto, solicitud de cita) — sin login
- **Panel admin privado** (agenda, fichas de perros, clientes, servicios) — solo la dueña del negocio hace login

Los clientes NO tienen cuenta. El login es solo para la administradora.

---

## Stack Obligatorio

| Capa          | Tecnología                                         |
| ------------- | -------------------------------------------------- |
| Framework     | **Next.js 15** con App Router + TypeScript         |
| Hosting       | **Vercel Hobby** (dominio propio, SSL incluido)    |
| Base de datos | **Neon** (PostgreSQL serverless)                   |
| ORM           | **Prisma**                                         |
| Autenticación | **NextAuth.js v5** — solo `credentials`            |
| Estilos       | **Tailwind CSS 4** + **shadcn/ui** + Framer Motion |
| Imágenes      | **Cloudinary** (free tier: 25 GB)                  |
| Calendario    | **Cal.com** (embed gratuito) + Webhook Prisma      |

**Costo total: $0/mes.** No introducir servicios de pago sin aprobación explícita.

---

## Arquitectura de Rutas

### Cara Pública (sin autenticación)

| Ruta         | Contenido                                           |
| ------------ | --------------------------------------------------- |
| `/`          | Landing: hero, servicios, galería, testimonios, CTA |
| `/servicios` | Detalle de precios y servicios                      |
| `/contacto`  | Formulario + link de WhatsApp                       |
| `/reservar`  | Formulario de solicitud de cita (sin cuenta)        |

### Panel Admin (requiere login)

| Ruta               | Contenido                                  |
| ------------------ | ------------------------------------------ |
| `/admin`           | Dashboard: citas del día, métricas rápidas |
| `/admin/agenda`    | Vista calendario (semana / mes / día)      |
| `/admin/citas`     | Lista de citas con filtros                 |
| `/admin/perros`    | Fichas de perros                           |
| `/admin/clientes`  | Información de dueños                      |
| `/admin/servicios` | CRUD de servicios y precios                |

---

## Modelo de Datos (Prisma)

```prisma
model Owner {
  id        String   @id @default(cuid())
  name      String
  phone     String
  email     String?
  createdAt DateTime @default(now())
  dogs      Dog[]
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

## Diseño e Identidad Visual

- **Paleta principal:** Terracota cálido + blanco roto + verde salvia
  - Alternativa premium: Lila suave + blanco + dorado
- **Tipografía:** `Playfair Display` (títulos) + `Inter` (cuerpo)
- **Elementos visuales:** Ilustraciones lineales de perros, fotos reales, transiciones suaves con Framer Motion
- **Mobile-first:** Hero con CTA de WhatsApp o botón de reserva bien visible en móvil
- **Secciones landing:** Hero → Servicios → Galería (antes/después) → Testimonios → CTA de contacto

---

## Buenas Prácticas — Reglas Innegociables

1. **Production-first:** `npm run build` en verde antes de cualquier deploy. Cero errores de TypeScript ni ESLint.
2. **Zod para variables de entorno** en `src/env.js`. Nunca usar `process.env` directamente en el código.
3. **Mobile-first con Tailwind** — diseñar para pantallas pequeñas primero, luego escalar.
4. **`"use client"` solo en hojas interactivas** (formularios, calendario, botones con estado). Nunca en layouts ni páginas completas sin razón.
5. **Type-safety end-to-end:** Route Handlers tipados o tRPC según complejidad del feature.
6. **Zero warnings antes de cada commit** — sin imports ni variables sin usar.
7. **No concatenar strings para clases de Tailwind** (ej: evitar `` `bg-${color}-500` ``). Usar nombres completos o mapeos de objetos estáticos para que el compilador no las elimine en producción.
8. **Evitar hydration mismatch:** cuidado con fechas y zonas horarias entre servidor y cliente.
9. **Imágenes siempre via Cloudinary** — nunca guardar binarios en la base de datos.
10. **Precios en CLP (entero)** — no usar `float` para dinero.

---

## Sistema de Reservas (Cal.com Embed + Webhooks)

La gestión de calendario, disponibilidad, zonas horarias y correos de confirmación se delega completamente a **Cal.com SaaS**. No reinventar esa rueda.

- La página `/reservar` embebe el widget de Cal.com usando `@calcom/embed-react` y el componente `CalComEmbed`.
- Variable de entorno: `NEXT_PUBLIC_CALCOM_LINK` con formato `"usuario/tipo-de-evento"`.

### Custom Fields obligatorios en Cal.com

Configurar en Cal.com → Event Type → Advanced → Custom Fields. Todos deben ser **requeridos**:

| Label en Cal.com | Slug (exacto)  | Tipo     | Notas                                 |
| ---------------- | -------------- | -------- | ------------------------------------- |
| Teléfono         | `telefono`     | Phone    | Identificador principal del dueño     |
| Nombre del perro | `nombre_perro` | Text     |                                       |
| Raza             | `raza_perro`   | Text     |                                       |
| Tamaño           | `dog_size`     | Select   | Opciones: XS, S, M, L, XL             |
| Notas del perro  | `dog_notes`    | Textarea | Alergias, temperamento, etc. Opcional |

> Si la clienta solicita nuevos campos: agregarlos aquí y en la interfaz `CalComResponses` del webhook (`src/app/api/webhooks/calcom/route.ts`).

### Webhook

- URL a configurar en Cal.com → Settings → Webhooks: `https://[dominio]/api/webhooks/calcom`
- Secreto HMAC: variable `CALCOM_WEBHOOK_SECRET`
- Eventos suscritos: `BOOKING_CREATED`, `BOOKING_RESCHEDULED`, `BOOKING_CANCELLED`
- El webhook hace `upsert` de Owner, Dog y Appointment en Prisma. La lógica de deduplicación usa email del dueño (primario) o crea uno nuevo si no existe.
- `calComUid` en `Appointment` garantiza idempotencia — si Cal.com reenvía el evento, no se duplica la cita.

## Agenda (FullCalendar)

- Librería: **`@fullcalendar/react`** (MIT, gratuita). Instalar: `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/interaction`.
- Vistas requeridas: semanal (`timeGridWeek`), mensual (`dayGridMonth`), diaria (`timeGridDay`).
- Drag & drop de citas habilitado.
- Color por estado:
  - `PENDING` → amarillo
  - `CONFIRMED` → azul
  - `DONE` → verde
  - `CANCELLED` → gris/tachado
- Click en cita → drawer/modal con detalle completo del perro + botones de acción.
- **Zona horaria:** Siempre usar `America/Santiago`. Nunca comparar fechas sin normalizar la zona horaria — riesgo de hydration mismatch y citas desplazadas.

---

## Convenciones de Código

- **Tipado estricto:** TypeScript estricto en todo el proyecto. **PROHIBIDO** el uso de `any`. Nunca dejar interfaces o tipos vacíos (`interface Props {}` → usar `Record<string, never>` o eliminarla).
- **Zero warnings:** Limpiar todas las importaciones y variables no utilizadas (`no-unused-vars`) antes de terminar un componente.
- **Client vs Server Components:** Por defecto, los componentes de React son de servidor. Usar `"use client"` únicamente en la última hoja interactiva (formularios, FullCalendar, botones con estado). Nunca en layouts ni páginas completas sin razón.
- **Clases de Tailwind — Purge CSS:** **NUNCA concatenar strings** para crear nombres de clase (ej: evitar `` `bg-${color}-500` ``). El compilador de Tailwind no las detecta y las elimina en producción. Usar nombres completos o mapeos de objetos estáticos.
- **Precios en CLP:** Siempre entero (`Int` en Prisma). Nunca usar `float` para dinero.
- **Imágenes:** Siempre via Cloudinary — nunca guardar binarios en la base de datos.

---

## Reglas Anti-Fallos en Vercel (Production-First)

Restricciones reales del entorno de Vercel Hobby que **deben respetarse desde el primer commit** para evitar builds rotos en producción:

### Build y TypeScript

- **Cero errores de build:** `npm run build` debe pasar sin errores de TypeScript ni ESLint. Vercel aborta el deploy si hay errores — no warnings, **errores**.
- **No `/* eslint-disable */` para enmascarar errores de tipo:** Resuelve el problema real. Vercel tiene ESLint configurado como parte del build.
- **`@typescript-eslint/no-unsafe-return`:** Evitar arrow functions sin llaves en callbacks que esperan tipo `void`. Usar siempre llaves: `onChange: (e) => { setValue(e); }` en lugar de `onChange: (e) => setValue(e)`.
- **`react-hooks/exhaustive-deps`:** Nunca ignorar este warning. Las dependencias de `useEffect`/`useCallback` deben estar completas.

### Middleware y Edge Runtime

- **El middleware corre en Edge Runtime** (Vercel Edge Network). Prisma y `bcryptjs` **no funcionan en Edge**. Por eso `auth.config.ts` (usado en middleware) nunca debe importar Prisma. Solo `auth.ts` importa Prisma.
- **Regla:** Si un import falla en Edge, el middleware entero falla silenciosamente en producción.

### Prisma y Base de Datos

- **Nunca ejecutar `prisma db seed` en el pipeline de `build`:** Las Vercel Build Machines tienen un timeout de conexión a la base de datos que causa deploys fallidos aleatorios. El seed se ejecuta manualmente en local apuntando a la base de datos de producción.
- **Siempre usar `npx prisma migrate deploy`** (no `migrate dev`) para aplicar migraciones en producción.
- **Connection pooling:** Neon requiere `?pgbouncer=true` en `DATABASE_URL` y `?connect_timeout=10` para evitar timeouts en funciones serverless. Usar `DIRECT_URL` para migraciones (sin pooler).

### Funciones Serverless (Timeout)

- **Timeout del plan Hobby: 10 segundos.** Las funciones serverless (Route Handlers) deben responder en menos de 10s. No escribir operaciones lentas en Route Handlers sin un timeout explícito.
- **Límite de payload:** El cuerpo de una request tiene un límite de **4.5 MB**. Para subida de imágenes, usar **upload directo al browser → Cloudinary** (no pasar el binario por el servidor de Next.js).

### Imágenes con `next/image`

- **Dominios remotos obligatorios:** Cualquier imagen externa (Cloudinary, etc.) debe declararse en `next.config.ts` bajo `images.remotePatterns`. Sin esto, `<Image>` lanza un error en producción.
  ```ts
  // next.config.ts
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  }
  ```

### Hydration Mismatch

- **Fechas y zonas horarias:** El servidor renderiza en UTC. El cliente puede estar en cualquier zona. Siempre formatear fechas en el cliente (dentro de un `useEffect` o con `suppressHydrationWarning` si es inevitable). Nunca formatear fechas directamente en Server Components que se hidratan.
- **Anidaciones HTML inválidas:** (ej: `<div>` dentro de `<p>`) causan errores de hidratación silenciosos. Validar el HTML semántico.
- **`window` / `document` en Server Components:** Lanzará error. Acceder a estas APIs solo dentro de `"use client"` o en `useEffect`.

### Variables de Entorno

- **Nunca usar `process.env` directamente** en el código. Siempre importar desde `src/env.ts` (validado con Zod).
- **Variables públicas (`NEXT_PUBLIC_*`):** Se embeben en el bundle del cliente en tiempo de build. No poner secretos en variables `NEXT_PUBLIC_`.
- **Vercel Preview vs Production:** Configurar variables de entorno separadas por entorno en el Dashboard de Vercel.

---

## Roadmap

> Ver `docs/plan-desarrollo.md` para el plan detallado de sprints con criterios de aceptación y estado de cada tarea.

### Sprints

1. **Sprint 1:** Fundación en Producción (Neon + Vercel + dominio)
2. **Sprint 2:** Login Admin + Panel Base (sidebar + dashboard)
3. **Sprint 3:** Catálogo de Servicios (CRUD desde panel)
4. **Sprint 4:** BookingWizard propio (reemplaza Cal.com)
5. **Sprint 5:** Clientes, Fichas de Perros + Cloudinary
6. **Sprint 6:** Agenda FullCalendar + Lista de Citas
7. **Sprint 7:** Historial de Atenciones con fotos
8. **Sprint 8:** Pulido final y entrega
