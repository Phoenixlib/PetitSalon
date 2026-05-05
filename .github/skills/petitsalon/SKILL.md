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

## Agenda (Cal.com Embed + Webhooks)

- La página `/reservar` embebe el widget de Cal.com usando `@calcom/embed-react`.
- Configurar en Cal.com los Custom Fields obligatorios: `nombre_perro`, `raza_perro`, `telefono`.
- Cal.com gestiona correos de confirmación, cancelación y recordatorios automáticamente.
- El webhook `POST /api/webhooks/calcom` recibe los eventos y sincroniza con Prisma:
  - `BOOKING_CREATED` → upsert Owner + Dog + Appointment (con `calComUid`).
  - `BOOKING_CANCELLED` → actualiza status a `CANCELLED`.
  - `BOOKING_RESCHEDULED` → actualiza la fecha de la cita.
- Variables de entorno requeridas:
  - `NEXT_PUBLIC_CALCOM_LINK` — formato `"usuario/tipo-de-evento"`, expuesto al cliente.
  - `CALCOM_WEBHOOK_SECRET` — HMAC secret del webhook en Cal.com settings (obligatorio en producción).
- El panel `/admin/agenda` sigue operando sobre los datos locales en Neon/Prisma.

---

## Roadmap

### Fase 1 — MVP (~2 semanas)

- Setup: Next.js 15 + Neon + Prisma + NextAuth.js v5
- Landing pública (hero, servicios, contacto)
- Login admin (un solo usuario, credentials)
- CRUD clientes + fichas de perros
- Agenda básica con FullCalendar
- Deploy en Vercel con dominio propio

### Fase 2 (~1 semana)

- Fichas de atención completadas con fotos (Cloudinary)
- Historial de atenciones por perro
- Notificaciones por WhatsApp (link directo o Twilio free tier)
