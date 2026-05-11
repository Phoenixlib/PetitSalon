
"use server";

import { auth } from "@/auth";
import { z } from "zod";

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

const OwnerSchema = z.object({
  name:  z.string().min(1, "El nombre es obligatorio").max(200),
  phone: z.string().min(6, "El teléfono es obligatorio").max(30),
  email: z.string().email("Email inválido").optional().nullable().or(z.literal("")),
});

export type OwnerFormState = {
  errors?: { name?: string[]; phone?: string[]; email?: string[]; _form?: string[] };
  success?: boolean;
};

export async function updateOwnerAction(id: string, _prev: OwnerFormState, formData: FormData): Promise<OwnerFormState> {
  try {
    await requireAdmin();
    const raw = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: (formData.get("email") as string) || null,
    };
    
    const parsed = OwnerSchema.safeParse(raw);
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }
    
    await prisma.owner.update({
      where: { id },
      data: { ...parsed.data, email: parsed.data.email || null }
    });
    
    revalidatePath("/admin/clientes");
    revalidatePath(`/admin/clientes/${id}`);
    return { success: true };
  } catch (error) {
    return { errors: { _form: ["Error al actualizar el cliente"] } };
  }
}

const DogSchema = z.object({
  name:   z.string().min(1, "El nombre es obligatorio").max(100),
  breed:  z.string().min(1, "La raza es obligatoria").max(100),
  size:   z.enum(["XS","S","M","L","XL"]).optional().nullable().or(z.literal("")),
  age:    z.string().max(50).optional().nullable(),
  weight: z.string().max(50).optional().nullable(),
  notes:  z.string().max(2000).optional().nullable(),
});

export type DogFormState = {
  errors?: { name?: string[]; breed?: string[]; size?: string[]; _form?: string[] };
  success?: boolean;
};

export async function addDogAction(ownerId: string, _prev: DogFormState, formData: FormData): Promise<DogFormState> {
  try {
    await requireAdmin();
    const raw = {
      name: formData.get("name") as string,
      breed: formData.get("breed") as string,
      size: (formData.get("size") as string) || null,
      age: (formData.get("age") as string) || null,
      weight: (formData.get("weight") as string) || null,
      notes: (formData.get("notes") as string) || null,
    };

    const parsed = DogSchema.safeParse(raw);
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    await prisma.dog.create({
      data: {
        name: parsed.data.name,
        breed: parsed.data.breed,
        size: parsed.data.size ? (parsed.data.size as DogSize) : null,
        age: parsed.data.age || null,
        weight: parsed.data.weight || null,
        notes: parsed.data.notes || null,
        ownerId,
      }
    });

    revalidatePath(`/admin/clientes/${ownerId}`);
    return { success: true };
  } catch (error) {
    return { errors: { _form: ["Error al agregar la mascota"] } };
  }
}
