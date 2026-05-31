import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Necesario para entornos Node.js (no edge/browser)
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function isRetryableError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const msg = String((err as { message?: string }).message ?? "");
  const code = String((err as { code?: string }).code ?? "");
  // ECONNRESET: WebSocket cerrado por Neon entre requests
  // EAI_AGAIN:  fallo DNS transitorio
  return (
    code === "ECONNRESET" ||
    code === "EAI_AGAIN" ||
    msg.includes("ECONNRESET") ||
    msg.includes("read ECONNRESET") ||
    msg.includes("Can't reach database server")
  );
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isRetryableError(err) || attempt === retries) break;
      // Espera exponencial: 200ms, 400ms, 800ms...
      const delay = 200 * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  // Relanzar como Error estándar para que RSC lo serialice correctamente
  // en lugar de mostrar {clientVersion: "6.19.3"} en el browser
  const msg =
    lastError instanceof Error
      ? lastError.message
      : "Error de conexión con la base de datos";
  throw new Error(`[Prisma] ${msg}`);
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaNeon({
    connectionString: String(connectionString),
  });

  const client = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

  // Proxy que envuelve cada llamada de modelo con withRetry automáticamente.
  // Esto intercepta accesos como prisma.dog.findUnique, prisma.service.findMany, etc.
  return new Proxy(client, {
    get(target, modelProp) {
      const modelValue = target[modelProp as keyof typeof target];

      // Solo interceptar propiedades de modelos Prisma (objetos con métodos async)
      if (
        typeof modelValue !== "object" ||
        modelValue === null ||
        typeof modelProp !== "string" ||
        modelProp.startsWith("$") ||
        modelProp.startsWith("_")
      ) {
        return modelValue;
      }

      // Proxy del modelo individual (dog, service, owner, etc.)
      return new Proxy(modelValue as object, {
        get(modelTarget, methodProp) {
          const method =
            modelTarget[methodProp as keyof typeof modelTarget];
          if (typeof method !== "function") return method;

          // Envolver cada método del modelo con reintentos
          return (...args: unknown[]) =>
            withRetry(() =>
              (method as (...a: unknown[]) => Promise<unknown>).apply(
                modelTarget,
                args
              )
            );
        },
      });
    },
  }) as unknown as PrismaClient;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
