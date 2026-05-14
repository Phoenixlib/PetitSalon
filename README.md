# 🐾 Petitsalon — Gestión Integral de Peluquería Canina

Bienvenido al repositorio de **Petitsalon**, una plataforma moderna diseñada para la gestión eficiente de una peluquería canina, combinando una landing page atractiva para clientes con un potente panel administrativo para la gestión del negocio.

---

## 🚀 Vision General

Petitsalon es una aplicación web de alto rendimiento construida con las últimas tecnologías web. El sistema se divide en dos áreas principales:

1.  **Landing Pública:** Una vitrina elegante que muestra servicios, galería de trabajos (antes/después), testimonios y facilita el contacto directo vía WhatsApp y reserva de citas.
2.  **Panel de Administración:** Una herramienta privada para la dueña del negocio donde gestiona la agenda (FullCalendar), fichas clínicas de perros, base de datos de clientes y catálogo de servicios.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org/) |
| **Estilos** | [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Animaciones** | [Framer Motion](https://www.framer.com/motion/) |
| **Base de Datos** | [Neon](https://neon.tech/) (PostgreSQL Serverless) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **Autenticación** | [NextAuth.js v5](https://authjs.dev/) (Auth.js) |
| **Imágenes** | [Cloudinary](https://cloudinary.com/) |
| **Calendario** | [FullCalendar](https://fullcalendar.io/) & [Cal.com](https://cal.com/) |

---

## ✨ Características Principales

### 🌐 Cara Pública
- **Diseño Mobile-First:** Optimizado para smartphones, donde ocurre la mayoría de las interacciones.
- **Galería Dinámica:** Visualización de trabajos realizados con efectos suaves de transición.
- **Reserva Inteligente:** Integración con Cal.com para agendamiento automatizado.
- **SEO Optimizado:** Estructura semántica y metadatos para mejor visibilidad en buscadores.

### 🔐 Panel Administrativo (Solo Dueña)
- **Dashboard de Métricas:** Resumen rápido de citas del día y estados.
- **Agenda Interactiva:** Gestión visual de citas con arrastrar y soltar (Drag & Drop).
- **Fichas Caninas:** Historial detallado por mascota (alergias, temperamento, fotos de visitas).
- **Gestión de Clientes:** Base de datos centralizada de dueños con contacto rápido.
- **Control de Servicios:** CRUD completo para actualizar precios y descripciones en tiempo real.

---

## 📦 Instalación y Configuración

Para ejecutar este proyecto localmente, sigue estos pasos:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/petitsalon.git
    cd petitsalon
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env.local` basado en `.env.example` (si existe) o agrega las siguientes claves:
    - `DATABASE_URL`: Conexión a Neon PostgreSQL.
    - `NEXTAUTH_SECRET`: Secreto para la autenticación.
    - `CLOUDINARY_URL`: Configuración de Cloudinary.
    - `NEXT_PUBLIC_CALCOM_LINK`: Tu link de Cal.com.

4.  **Sincronizar la base de datos:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Iniciar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

---

## 🎨 Identidad Visual

El proyecto utiliza una paleta de colores cuidadosamente seleccionada para transmitir calidez y profesionalismo:
- **Terracota Cálido:** Para acentos y botones principales.
- **Verde Salvia:** Para elementos de naturaleza y bienestar.
- **Blanco Roto:** Como base para una lectura descansada.
- **Tipografías:** *Playfair Display* (Elegancia en títulos) e *Inter* (Claridad en cuerpo).

---

## 📈 Roadmap

- [x] Sprint 1: Fundación y despliegue en Vercel.
- [x] Sprint 2: Autenticación y Panel Admin base.
- [x] Sprint 3: Catálogo de servicios dinámico.
- [ ] Sprint 4: BookingWizard personalizado.
- [ ] Sprint 5: Gestión avanzada de fichas y Cloudinary.
- [ ] Sprint 6: Integración completa de Agenda.

---

Desarrollado con ❤️ para los consentidos del hogar.
