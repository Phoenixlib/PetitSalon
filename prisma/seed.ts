import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const hash = await bcrypt.hash("admin123", 12);
  await prisma.adminUser.upsert({
    where: { email: "admin@petitsalon.cl" },
    update: {},
    create: {
      email: "admin@petitsalon.cl",
      password: hash,
      name: "Administradora",
    },
  });
  console.log("✅ AdminUser creado");

  // Servicios reales de Petitsalon
  // calComLink: usa los 3 eventos creados en Cal.com agrupados por duración
  // servicio90min  → hasta 90 min
  // servicio120min → 120 min
  // servicio150min → 150 min
  const services = [
    {
      name: "Baño y Secado",
      price: 12000,
      duration: 60,
      description:
        "Baño completo con shampoo profesional, acondicionador, secado y cepillado.",
      calComLink: "petitsalon/servicio90min",
    },
    {
      name: "Corte de Pelo",
      price: 15000,
      duration: 75,
      description: "Corte a medida según la raza, perfil o gustos del dueño.",
      calComLink: "petitsalon/servicio90min",
    },
    {
      name: "Baño + Corte",
      price: 22000,
      duration: 120,
      description:
        "Servicio completo: baño, secado y corte de pelo. El más solicitado.",
      calComLink: "petitsalon/servicio120min",
    },
    {
      name: "Corte de Uñas",
      price: 4000,
      duration: 15,
      description: "Corte y limado de uñas para la comodidad de tu mascota.",
      calComLink: "petitsalon/servicio90min",
    },
    {
      name: "Limpieza de Oídos",
      price: 4000,
      duration: 15,
      description: "Limpieza suave del conducto auditivo externo.",
      calComLink: "petitsalon/servicio90min",
    },
    {
      name: "Deslanado",
      price: 18000,
      duration: 90,
      description:
        "Retiro del pelo muerto en razas de doble capa. Reduce la caída y mejora el pelo.",
      calComLink: "petitsalon/servicio90min",
    },
    {
      name: "Spa Completo",
      price: 32000,
      duration: 150,
      description:
        "Baño, corte, deslanado, corte de uñas y limpieza de oídos. Experiencia premium.",
      calComLink: "petitsalon/servicio150min",
    },
  ];

  const count = await prisma.service.count();
  if (count === 0) {
    await prisma.service.createMany({ data: services });
    console.log(`✅ ${services.length} servicios creados`);
  } else {
    // Actualizar calComLink en servicios existentes aunque ya estén creados
    for (const s of services) {
      await prisma.service.updateMany({
        where: { name: s.name },
        data: { calComLink: s.calComLink },
      });
    }
    console.log(
      `ℹ️  Servicios ya existentes (${count}), calComLink actualizado`,
    );
  }

  // --- SPRINT 8: Seed de Contenido (SiteConfig y FaqItem) ---
  console.log("🌱 Seeding SiteConfig and FaqItem...");

  const siteConfigs = [
    { key: "whatsapp", value: "56937541863" },
    { key: "email", value: "Petitsalon.contacto@gmail.com" },
    { key: "address", value: "Carvajal 330, La Cisterna, Chile" },
    { key: "parking", value: "true" },
    { key: "about_p1", value: "En <strong>Petit Salon</strong> priorizamos la atención personalizada, respetuosa y profesional, cuidando cada detalle para que tu mascota tenga una buena experiencia en su sesión." },
    { key: "about_p2", value: "Atendemos cada requerimiento de sus tutores, salvaguardando primeramente el bienestar de la mascota. En un espacio seguro, <strong>sin caniles ni sedantes</strong>, con un horario dedicado solo para tu peludo." },
    { key: "about_p3", value: "No dudes en comunicarte con nosotros ante cualquier duda y con gusto te atenderemos." },
    { key: "maps_embed_url", value: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3325.297746594244!2d-70.6693892!3d-33.5244199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662dae31a1a7995%3A0xe5772390f7adca0!2sCarvajal%20330%2C%20La%20Cisterna%2C%20Regi%C3%B3n%20Metropolitana%2C%20Chile!5e0!3m2!1ses-419!2scl!4v1714856000000!5m2!1ses-419!2scl" },
  ];

  for (const config of siteConfigs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: {},
      create: { key: config.key, value: config.value },
    });
  }
  console.log("✅ SiteConfig seed completado");

  const faqCount = await prisma.faqItem.count();
  if (faqCount === 0) {
    const faqItems = [
      {
        question: "¿Con cuánta anticipación debo reservar?",
        answer: "Recomendamos reservar con al menos 2 días de anticipación, especialmente en fines de semana. Para turnos de urgencia, contáctanos por WhatsApp y verificamos disponibilidad.",
        order: 0,
      },
      {
        question: "¿Qué razas y tamaños aceptan?",
        answer: "Trabajamos con todas las razas y tamaños, desde pequeños como Chihuahuas hasta grandes como Golden Retrievers. Cada perro recibe atención personalizada según sus necesidades.",
        order: 1,
      },
      {
        question: "¿Cuánto tiempo dura la sesión?",
        answer: "Depende del servicio y tamaño del perro. Un baño y secado para un perro pequeño toma entre 1 y 1.5 horas. Un corte completo para razas grandes puede llevar hasta 3 horas.",
        order: 2,
      },
      {
        question: "¿Qué productos usan?",
        answer: "Utilizamos shampoos y acondicionadores dermatológicos, libres de parabenos y sulfatos, aptos para piel sensible. Si tu perro tiene alguna alergia específica, avísanos al reservar.",
        order: 3,
      },
      {
        question: "¿Puedo acompañar a mi mascota durante el servicio?",
        answer: "En general pedimos que el dueño espere fuera para que el perro no se distraiga y el proceso sea más rápido y seguro. ¡Te avisamos cuando esté listo!",
        order: 4,
      },
      {
        question: "¿Cómo puedo ver los precios?",
        answer: "Los precios varían según la raza, tamaño y tipo de servicio. Escríbenos por WhatsApp con una foto de tu perro y te enviamos una cotización personalizada sin compromiso.",
        order: 5,
      },
    ];

    await prisma.faqItem.createMany({ data: faqItems });
    console.log(`✅ ${faqItems.length} FaqItems creados`);
  } else {
    console.log(`ℹ️  FaqItems ya existentes (${faqCount})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
