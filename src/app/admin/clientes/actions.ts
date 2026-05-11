"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DogSize } from "@prisma/client";


async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
}

export async function createClientWithDog(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;

  const dogName = formData.get("dogName") as string;
  const dogBreed = formData.get("dogBreed") as string;
  const dogSize = formData.get("dogSize") as string;
  const dogAge = formData.get("dogAge") as string;
  const dogWeight = formData.get("dogWeight") as string;
  const dogNotes = formData.get("dogNotes") as string;

  if (!name || !phone || !dogName || !dogBreed) {
    return {
      error: "Nombre, teléfono, nombre del perro y raza son obligatorios",
    };
  }

  try {
    const owner = await prisma.$transaction(async (tx) => {
      // 1. Create owner
      const newOwner = await tx.owner.create({
        data: {
          name,
          phone,
          email: email || null,
        },
      });

      // 2. Create dog
      await tx.dog.create({
        data: {
          name: dogName,
          breed: dogBreed,
          size: dogSize ? (dogSize as DogSize) : null,
          age: dogAge || null,
          weight: dogWeight || null,
          notes: dogNotes || null,
          ownerId: newOwner.id,
        },
      });

      return newOwner;
    });

    revalidatePath("/admin/clientes");
    // Redirect must happen outside the try/catch or it will be caught as an error by standard try/catch if it's throw-based,
    // actually in next.js `redirect` throws an error we need to let it bubble or return a specific path and handle it below.
    return { success: true, ownerId: owner.id };
  } catch (error) {
    console.error("[Create Client Error]:", error);
    return { error: "Ocurrió un error al crear el cliente y la mascota" };
  }
}
