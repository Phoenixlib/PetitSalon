import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function run() {
  const { sendWhatsAppConfirmation, sendWhatsAppReminder } = await import("../src/lib/twilio");
  
  const testPhone = process.argv[2];
  if (!testPhone) {
    console.error("Por favor provee un numero de telefono. Ejemplo: npx tsx scripts/test-whatsapp.ts +56912345678");
    process.exit(1);
  }

  console.log(`Probando envíos al número: ${testPhone}`);

  try {
    console.log("1. Enviando confirmación de reserva...");
    await sendWhatsAppConfirmation(testPhone, {
      ownerName: "Propietario de Prueba",
      petName: "Firulais",
      dateStr: "25 de Mayo",
      timeStr: "10:00",
    });
    console.log("✅ Confirmación enviada exitosamente.");

    console.log("2. Enviando recordatorio...");
    await sendWhatsAppReminder(testPhone, {
      ownerName: "Propietario de Prueba",
      petName: "Firulais",
      dateStr: "Mañana",
      timeStr: "16:30",
    });
    console.log("✅ Recordatorio enviado exitosamente.");

  } catch (error) {
    console.error("❌ Error al enviar:", error);
  }
}

run();
