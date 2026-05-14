# Plan de Desarrollo — Petitsalon (Plan 3 Integral)

> Documento de seguimiento de sprints. Cada parte debe verificarse con `npm run build` en verde antes de continuar.
>
> **Leyenda:** ✅ Completado · 🔄 En progreso · 🔲 Pendiente

---

## Estado General del Proyecto

| Capa                          | Estado | Detalle                                                        |
| ----------------------------- | ------ | -------------------------------------------------------------- |
| Next.js 15 + TypeScript       | ✅     | Configurado y funcionando                                      |
| Prisma + Neon (esquema)       | ✅     | Todos los modelos definidos                                    |
| NextAuth.js v5 (auth)         | ✅     | Credentials + middleware protegiendo `/admin`                  |
| Validación de entorno (Zod)   | ✅     | `src/env.ts` completo                                          |
| Landing pública (visual)      | ✅     | Todos los componentes creados                                  |
| Sistema de email (Nodemailer) | ✅     | `src/lib/email.ts` funcional                                   |
| API de servicios (GET)        | ✅     | `/api/services` operativo                                      |
| Login Admin + Panel Base      | ✅     | Login, layout con sidebar, dashboard con stats                 |
| Deploy en Vercel              | 🔲     | Pendiente de configurar variables en producción                |
| Cal.com (embed + webhook)     | ✅     | Embed activo en `/reservar`, webhook en `/api/webhooks/calcom` |
| Agenda Admin (FullCalendar)   | ✅     | `/admin/agenda` con colores por estado y modal de detalle      |
| Lista de Citas Admin          | ✅     | `/admin/citas` con filtros y cambio de estado                  |
| Página Pública `/servicios`   | ✅     | Categorías y servicios activos desde DB                        |
| CRM Clientes y Perros         | ✅     | Fichas completas con modales de edición                        |
| Contenido Landing Editable    | 🔲     | Acerca de, FAQ, Ubicación gestionados desde Admin              |
| Sistema de Reseñas            | 🔲     | Link de reseña al marcar cita DONE, visualización en landing   |

---

## Sprint 1 — Fundación en Producción

> **Objetivo:** Que la landing pública sea accesible en internet con dominio real. Build verde en Vercel desde el día 1.

### Tareas

- ✅ Crear base de datos en **Neon** y obtener `DATABASE_URL` + `DIRECT_URL`
- ✅ Generar `AUTH_SECRET` (`openssl rand -base64 32`) y configurar en Vercel
- 🔲 Configurar variables de entorno en el Dashboard de Vercel (producción)
- ✅ Ejecutar `npx prisma migrate deploy` apuntando a Neon
- ✅ Crear el primer `AdminUser` con seed manual (`npx ts-node` o script de consola — **nunca** en el pipeline de `build`)
- 🔲 Conectar repositorio GitHub a Vercel
- 🔲 Configurar dominio propio en Vercel (SSL automático)
- 🔲 Verificar que `npm run build` pase sin errores en CI

### Criterios de Aceptación

- [ ] La landing carga en el dominio real (móvil y desktop)
- [ ] El build de Vercel es verde (sin errores TS ni ESLint)
- [ ] Las secciones Servicios muestran datos reales desde la base de datos
- [ ] La URL `/admin` redirige al login (middleware activo)

---

## Sprint 2 — Login Admin + Panel Base ✅

> **Objetivo:** La dueña puede ingresar a su panel privado desde cualquier dispositivo.

### Tareas

- ✅ Crear `src/app/admin/login/page.tsx` con formulario email + contraseña
- ✅ Conectar formulario con `signIn()` de NextAuth (Server Action + `useActionState`)
- ✅ Crear layout del panel admin: `src/app/admin/layout.tsx`
  - Sidebar con navegación (Dashboard, Agenda, Citas, Clientes, Perros, Servicios)
  - Nombre de usuario y botón "Cerrar sesión"
  - Responsivo (drawer deslizable en móvil + top bar fija)
- ✅ Crear `src/app/admin/page.tsx` — Dashboard con 4 stat cards + tabla de próximas citas (7 días)
- ✅ Logout via Server Action que redirige a `/admin/login`

### Criterios de Aceptación

- [x] Login funciona con las credenciales del AdminUser creado en Sprint 1
- [x] Credenciales incorrectas muestran error sin revelar si el email existe o no
- [x] El panel es accesible desde móvil (sidebar colapsable)
- [x] Build verde en Vercel

> **Nota:** Next.js 16 depreca `src/middleware.ts` en favor de `src/proxy.ts`. Pendiente de migrar (no bloqueante por ahora).

---

## Sprint 3 — Catálogo de Servicios (Admin)

> **Objetivo:** La dueña puede crear, editar y desactivar servicios sin tocar código.

### Tareas

- 🔲 Crear `src/app/admin/servicios/page.tsx` — tabla de servicios activos/inactivos
- 🔲 Crear formulario modal para crear/editar servicio (nombre, precio CLP, duración en minutos, descripción)
- 🔲 `POST /api/admin/services` — crear servicio (auth requerida)
- 🔲 `PATCH /api/admin/services/[id]` — editar servicio
- 🔲 `PATCH /api/admin/services/[id]` con `{ isActive: false }` — desactivar (soft delete, no borrar)
- 🔲 Seed inicial con servicios reales de Petitsalon (Baño, Corte, etc.)

### Criterios de Aceptación

- [ ] CRUD completo visible en el panel
- [ ] Un servicio desactivado desaparece de la landing pública automáticamente
- [ ] Precios guardados como entero (CLP sin decimales)
- [ ] Build verde en Vercel

---

## Sprint 4 — Activación Cal.com (Embed + Webhooks) ✅

> **Objetivo:** El sistema de reservas público funciona en producción con Cal.com gestionando disponibilidad, correos y recordatorios. El webhook sincroniza cada reserva a Prisma automáticamente.

### Configuración en Cal.com (sin código)

- ✅ Crear cuenta Cal.com y configurar el Event Type principal (ej: "Cita en Petitsalon")
- ✅ Configurar disponibilidad horaria y duración de la cita en Cal.com
- ✅ Agregar Custom Fields obligatorios en Cal.com → Event Type → Advanced:
  - `telefono` (Phone, requerido, slug: attendeePhoneNumber)
  - `nombre_perro` (Text, requerido)
  - `raza_perro` (Text, requerido)
  - `dog_size` (Select: XS / S / M / L / XL, requerido)
  - `edad` (text, opcional)
  - `peso` (text, opcional)
  - `dog_notes` (Textarea, opcional — alergias, temperamento)
- ✅ Configurar Webhook en Cal.com → Settings → Webhooks:
  - URL: `https://[dominio]/api/webhooks/calcom`
  - Eventos: `BOOKING_CREATED`, `BOOKING_RESCHEDULED`, `BOOKING_CANCELLED`
  - Copiar el secreto HMAC generado
- ✅ Agregar variables de entorno en Vercel:
  - `NEXT_PUBLIC_CALCOM_LINK` → `"usuario/nombre-del-evento"`
  - `CALCOM_WEBHOOK_SECRET` → secreto HMAC de Cal.com

### Verificación de código (ya existente)

- ✅ `src/components/booking/CalComEmbed.tsx` — embed con colores de marca
- ✅ `src/app/(public)/reservar/page.tsx` — página que usa el embed (Actualizada para recibir links dinámicos por query params)
- ✅ `src/app/api/webhooks/calcom/route.ts` — webhook con firma HMAC y upsert de Owner+Dog+Appointment
- ✅ Verificar que el webhook procesa correctamente `dog_size` → `Dog.size` (DogSize enum)
- ✅ Verificar que el webhook procesa `dog_notes`, `edad` y `peso`

### Criterios de Aceptación

- [x] El widget de Cal.com carga correctamente en `/reservar` con los colores de Petitsalon
- [x] Al completar una reserva en Cal.com, el webhook crea/actualiza Owner + Dog + Appointment en Neon
- [x] Los campos nombre_perro, raza_perro, teléfono, tamaño, edad, peso y notas llegan correctamente
- [x] La cancelación en Cal.com cambia el estado en Prisma a `CANCELLED`
- [x] Cal.com envía correo de confirmación automático al cliente (sin código adicional)
- [x] Build verde en Vercel

---

## Sprint 5 — Clientes y Fichas de Perros

> **Objetivo:** La dueña puede ver, buscar y editar la información de sus clientes y las fichas de cada perrito.

### Tareas

- 🔲 `GET /api/admin/owners` — lista paginada de clientes con búsqueda por nombre/teléfono
- 🔲 `GET /api/admin/owners/[id]` — detalle del cliente con sus perros
- 🔲 `PATCH /api/admin/owners/[id]` — editar datos del dueño
- 🔲 Crear `src/app/admin/clientes/page.tsx` — tabla con buscador
- 🔲 Crear `src/app/admin/clientes/[id]/page.tsx` — detalle con lista de perros
- 🔲 `GET /api/admin/dogs/[id]` — ficha completa del perro
- 🔲 `PATCH /api/admin/dogs/[id]` — editar ficha (notas de alergias, temperamento, etc.)
- 🔲 Integrar **Cloudinary** para la foto de perfil del perro:
  - Subida directa desde el browser (signed upload)
  - Guardar URL en el campo `Dog.photo`
- 🔲 Crear `src/app/admin/perros/page.tsx` — lista de perros con búsqueda
- 🔲 Crear `src/app/admin/perros/[id]/page.tsx` — ficha completa con foto y notas

### Criterios de Aceptación

- [ ] Se puede buscar un cliente por nombre o teléfono
- [ ] La ficha del perro muestra: raza, tamaño, cumpleaños, alergias/notas y foto
- [ ] Se puede editar la ficha sin perder el historial
- [ ] La foto se sube desde el celular de la dueña (flujo móvil)
- [ ] Build verde en Vercel

---

## Sprint 6 — Agenda Interactiva ✅

> **Objetivo:** La dueña tiene un calendario visual de sus citas con control de estados.

### Tareas

- ✅ Instalar `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/interaction`
- ✅ Crear `GET /api/admin/appointments` — citas con filtros de fecha
- ✅ Crear Server Action `updateAppointmentStatusAction` — cambiar estado
- ✅ Crear componente `AgendaCalendar` con FullCalendar:
  - Vistas: semana (`timeGridWeek`), mes (`dayGridMonth`), día (`timeGridDay`)
  - Colores por estado: amarillo (PENDING), azul (CONFIRMED), verde (DONE), gris (CANCELLED)
  - Click en cita → modal `AppointmentDetailModal` con detalle completo
  - Botones de acción: Confirmar / Marcar como Realizado / Cancelar
  - Navegación entre fechas carga citas dinámicamente desde la API
- ✅ Crear `src/app/admin/agenda/page.tsx` con el componente y leyenda de estados
- ✅ Crear `src/app/admin/citas/page.tsx` — lista tabular con filtros y buscador
- ✅ Crear `src/app/(public)/servicios/page.tsx` — página pública de servicios

### Criterios de Aceptación

- [x] El calendario carga las citas del mes actual
- [x] Cambiar el estado de una cita se refleja en tiempo real sin recargar la página
- [x] La vista de semana muestra los bloques de tiempo correctamente en zona horaria de Chile (America/Santiago)
- [x] La lista en `/admin/citas` permite filtrar por estado y buscar por nombre
- [x] Build verde en Vercel

---

## Sprint 7 — Fotos de Atenciones (Cloudinary) + Flujo Combinado desde Agenda

> **Objetivo:** La dueña puede subir fotos del antes/después en cada atención y registrar la atención directamente desde el modal de agenda al marcar una cita como Realizada.

> **Plan detallado:** `docs/plan-sprint7.md`

### Tareas

- 🔲 Crear `GET /api/admin/upload-signature` — firma HMAC para subida directa a Cloudinary desde el browser
- 🔲 Crear `src/hooks/useCloudinaryUpload.ts` — hook reutilizable para subida de archivos
- 🔲 Modificar `createAttendanceAction` en `perros/actions.ts` — leer URLs de fotos del FormData
- 🔲 Modificar `AttendanceModal.tsx` — añadir dropzone de fotos con previsualización y subida a Cloudinary
- 🔲 Añadir `markDoneWithAttendanceAction` en `citas/actions.ts` — transacción que cambia estado + crea asistencia
- 🔲 Modificar `AppointmentDetailModal.tsx` — flujo de 2 pasos: detalle → formulario de atención al marcar como Realizado

### Criterios de Aceptación

- [ ] Se pueden subir hasta 6 fotos por atención desde el celular (JPG, PNG, WEBP)
- [ ] Las fotos se suben directamente a Cloudinary desde el browser (sin pasar por nuestro servidor)
- [ ] Si Cloudinary no está configurado, el formulario funciona igual pero sin fotos
- [ ] Al hacer click en "Marcar como Realizado" en la agenda, aparece un formulario de atención
- [ ] "Guardar y Finalizar" cambia el estado a DONE y crea la asistencia en una transacción atómica
- [ ] El botón "Solo marcar como Realizado" sigue disponible (sin registro de atención)
- [ ] Build verde en Vercel

---

## Sprint 8 — Contenido del Landing Editable desde Admin

> **Objetivo:** La dueña puede editar directamente desde el panel admin el contenido de las secciones clave del landing: Acerca de Nosotros, FAQ y Cómo Llegar, sin tocar código.

### Nuevos modelos de Prisma requeridos

```prisma
// Configuración global del sitio (clave-valor)
model SiteConfig {
  key       String  @id  // ej. "whatsapp", "email", "address", "maps_embed_url", "parking", "about_p1", "about_p2", "about_p3"
  value     String
  updatedAt DateTime @updatedAt
}

// Preguntas frecuentes
model FaqItem {
  id        String   @id @default(cuid())
  question  String
  answer    String
  order     Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Tareas

- 🔲 Crear migración Prisma con `SiteConfig` y `FaqItem`
- 🔲 Crear seed de datos por defecto con los valores actuales hardcodeados en los componentes
- 🔲 Crear `src/app/admin/contenido/page.tsx` — hub de edición de contenido del landing
  - Pestaña/sección: **Acerca de Nosotros** (párrafos, WhatsApp, correo, toggle de estacionamiento)
  - Pestaña/sección: **Preguntas Frecuentes** (CRUD de FaqItem con drag-and-drop de orden)
  - Pestaña/sección: **Cómo Llegar** (dirección, URL de mapa de Google Maps embed)
- 🔲 Crear Server Actions en `src/app/admin/contenido/actions.ts`:
  - `updateSiteConfigAction(key, value)` — upsert en `SiteConfig`
  - `createFaqAction`, `updateFaqAction`, `toggleFaqAction`, `deleteFaqAction`, `reorderFaqAction`
- 🔲 Hacer dinámicos los componentes del landing:
  - `AcercaDeNosotros.tsx` — recibir props desde `page.tsx` (leer `SiteConfig` en DB)
  - `FAQ.tsx` — recibir `items: FaqItem[]` como prop (leer desde DB, ordenados por `order`)
  - `Ubicacion.tsx` — recibir `address` y `mapsEmbedUrl` como props
  - `ContactoCTA.tsx` — recibir `whatsapp` como prop
- 🔲 Actualizar `src/app/(public)/page.tsx` para leer `SiteConfig` y `FaqItem` desde DB y pasar como props
- 🔲 Añadir "Contenido" al sidebar admin (`src/components/admin/AdminSidebar.tsx`)

### Criterios de Aceptación

- [ ] La dueña puede editar los 3 párrafos de Acerca de Nosotros desde `/admin/contenido`
- [ ] La dueña puede cambiar el número de WhatsApp y el correo de contacto
- [ ] El toggle de estacionamiento activa/desactiva el badge en la landing
- [ ] La dueña puede agregar, editar, reordenar y desactivar preguntas frecuentes
- [ ] La dueña puede cambiar la dirección y la URL del embed de Google Maps
- [ ] Los cambios se reflejan en el landing al recargar (Next.js revalida en cada request)
- [ ] Build verde en Vercel

---

## Sprint 9 — Sistema de Reseñas

> **Objetivo:** Al marcar una cita como Realizada, la dueña puede optar por enviarle al cliente un link de reseña. Las reseñas aprobadas se muestran en la sección Testimonios del landing.
>
> **Plan detallado:** `docs/plan-sprint9-resenas.md`

### Nuevo modelo de Prisma requerido

```prisma
model Review {
  id            String        @id @default(cuid())
  token         String        @unique @default(cuid()) // link único para dejar reseña
  ownerName     String        // nombre del dueño
  petName       String        // nombre del perrito
  text          String        // texto de la reseña
  rating        Int           // 1–5 estrellas
  status        ReviewStatus  @default(PENDING)
  appointmentId String?       @unique
  appointment   Appointment?  @relation(fields: [appointmentId], references: [id], onDelete: SetNull)
  createdAt     DateTime      @default(now())
}

enum ReviewStatus {
  PENDING    // recibida, pendiente de aprobación
  APPROVED   // visible en el landing
  REJECTED   // descartada
}
```

### Tareas

- 🔲 Crear migración Prisma con `Review` y `ReviewStatus`
- 🔲 Modificar `markDoneWithAttendanceAction` (Sprint 7): si el `Owner` tiene `email`, crear `Review` con `status: PENDING` y enviar email con el link `/resena/[token]`
- 🔲 Crear `src/app/admin/resenas/page.tsx` — lista de reseñas pendientes con botones Aprobar / Rechazar
- 🔲 Crear Server Action `updateReviewStatusAction` en `src/app/admin/resenas/actions.ts`
- 🔲 Crear página pública `src/app/(public)/resena/[token]/page.tsx`:
  - Formulario: nombre (pre-rellenado), nombre del perro (pre-rellenado), texto de reseña, rating (1-5 estrellas)
  - Al enviar: actualizar el `Review` con los datos y cambiar a estado `PENDING`
  - Si el token ya fue usado (review ya tiene `text`): mostrar mensaje de agradecimiento
- 🔲 Crear `src/lib/email.ts` función `sendReviewRequestEmail` — email con link a `/resena/[token]`
- 🔲 Hacer dinámico `Testimonios.tsx` — recibir `reviews: Review[]` como prop (solo `APPROVED`)
- 🔲 Actualizar `src/app/(public)/page.tsx` para leer reseñas aprobadas y pasarlas a `Testimonios`
- 🔲 Añadir "Reseñas" al sidebar admin con badge de pendientes

### Criterios de Aceptación

- [ ] Al marcar una cita como Realizada y el dueño tiene email, se envía el link de reseña automáticamente
- [ ] El link `/resena/[token]` es público, funciona sin login, y muestra el formulario
- [ ] El formulario valida que el texto tenga al menos 20 caracteres y el rating esté entre 1 y 5
- [ ] Un token ya utilizado muestra mensaje de agradecimiento en lugar del formulario
- [ ] La dueña puede aprobar o rechazar reseñas desde `/admin/resenas`
- [ ] Las reseñas aprobadas se muestran en la sección Testimonios del landing
- [ ] Si no hay reseñas aprobadas, se muestran los testimonios hardcodeados por defecto (fallback)
- [ ] Build verde en Vercel

---

## Sprint 10 — Pulido Final y Entrega

> **Objetivo:** Sistema completo, estable en producción y con una UX impecable para la dueña.

### Tareas

- ✅ Dashboard `/admin` completo: citas de hoy, próximas 48h, últimos perros atendidos
- 🔲 SEO: `metadata` en todas las páginas públicas (title, description, og:image)
- 🔲 `next/image` para todas las imágenes (optimización automática)
- 🔲 Configurar `remotePatterns` en `next.config.ts` para dominios de Cloudinary
- 🔲 Revisión final responsiva en móvil de todo el panel admin
- 🔲 Limpieza de código: eliminar `console.log`, imports no usados, variables huérfanas
- 🔲 Revisar todos los `// TODO` del codebase
- 🔲 Test end-to-end manual: reserva → cita en agenda → confirmar → registrar atención → ver historial
- 🔲 Entregar credenciales de acceso y guía de uso a la dueña (Incluir sección detallada de cómo crear un evento en Cal.com y copiar el link hacia el panel Admin)

### Criterios de Aceptación

- [ ] `npm run build` verde sin un solo warning
- [ ] Lighthouse Performance ≥ 85 en móvil
- [ ] Flujo completo probado en producción (no solo en localhost)
- [ ] La dueña puede operar el sistema de forma autónoma

---

## Notas de Sesión

> Espacio para anotar decisiones tomadas durante el desarrollo.

- **07/05/2026** — Cliente elige Plan 3 Integral. Se inicia planificación formal.
- **07/05/2026** — `/docs` ya estaba en `.gitignore`. Propuesta comercial generada en `docs/propuesta-comercial.md`.
- **07/05/2026** — Se decide mantener Cal.com embed + webhooks (decisión definitiva). Sprint 4 = configuración Cal.com en producción.
- **07/05/2026** — Sprint 2 completado: login con Server Actions + layout admin con sidebar responsive + dashboard con stats y próximas citas.
- **11/05/2026** — Sprint 5b completado: fichas CRM de clientes y perros con modales de edición conectados.
- **11/05/2026** — Sprint 6 completado: agenda FullCalendar + lista de citas con filtros + página pública `/servicios`.
- **12/05/2026** — Sprints 8 y 9 añadidos al plan: contenido editable del landing y sistema de reseñas.
- **13/05/2026** — Plan detallado del Sprint 9 aprobado: flujo de 3 pasos en el modal (detail → done-form → review-prompt), la dueña decide si enviar el link antes de ejecutar la acción. Ver `docs/plan-sprint9-resenas.md`.
