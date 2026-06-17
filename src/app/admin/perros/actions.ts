"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseIncomingDate } from "@/lib/date-utils";


async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
}

const DogSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  breed: z.string().min(1, "La raza es obligatoria").max(100),
  age: z.string().max(50).optional().nullable(),
  weight: z.string().max(50).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  photo: z.string().optional().nullable(),
});

export type DogFormState = {
  errors?: {
    name?: string[];
    breed?: string[];
    _form?: string[];
  };
  success?: boolean;
};

export async function updateDogAction(
  dogId: string,
  _prev: DogFormState,
  formData: FormData,
): Promise<DogFormState> {
  try {
    await requireAdmin();
    const raw = {
      name: formData.get("name") as string,
      breed: formData.get("breed") as string,
      age: (formData.get("age") as string) || null,
      weight: (formData.get("weight") as string) || null,
      notes: (formData.get("notes") as string) || null,
      photo: (formData.get("photo") as string) || null,
    };

    const parsed = DogSchema.safeParse(raw);
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    const dog = await prisma.dog.findUnique({
      where: { id: dogId },
      select: { ownerId: true },
    });
    if (!dog) return { errors: { _form: ["Perro no encontrado"] } };

    await prisma.dog.update({
      where: { id: dogId },
      data: {
        name: parsed.data.name,
        breed: parsed.data.breed,
        age: parsed.data.age || null,
        weight: parsed.data.weight || null,
        notes: parsed.data.notes || null,
        photo: parsed.data.photo || null,
      },
    });

    revalidatePath(`/admin/perros/${dogId}`);
    revalidatePath(`/admin/clientes/${dog.ownerId}`);
    return { success: true };
  } catch (error) {
    return { errors: { _form: ["Error al actualizar el perro"] } };
  }
}

const AttendanceSchema = z.object({
  service: z.string().min(1, "El servicio es obligatorio").max(200),
  date: z.preprocess((val) => parseIncomingDate(val), z.date()),
  notes: z.string().max(2000).optional().nullable(),
});

export type AttendanceFormState = {
  errors?: {
    service?: string[];
    date?: string[];
    notes?: string[];
    _form?: string[];
  };
  success?: boolean;
};

export async function createAttendanceAction(
  dogId: string,
  _prev: AttendanceFormState,
  formData: FormData,
): Promise<AttendanceFormState> {
  try {
    await requireAdmin();
    const raw = {
      service: formData.get("service") as string,
      date: formData.get("date") as string,
      notes: (formData.get("notes") as string) || null,
    };

    const parsed = AttendanceSchema.safeParse(raw);
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    const photos: string[] = [];
    let i = 0;
    while (formData.get(`photos[${i}]`)) {
      const url = formData.get(`photos[${i}]`) as string;
      if (url.startsWith("https://res.cloudinary.com/")) {
        photos.push(url); // solo aceptar URLs de Cloudinary (validación de origen)
      }
      i++;
    }

    await prisma.attendance.create({
      data: {
        service: parsed.data.service,
        date: parsed.data.date,
        notes: parsed.data.notes || null,
        photos,
        dogId,
      },
    });

    revalidatePath(`/admin/perros/${dogId}`);
    return { success: true };
  } catch (error) {
    return { errors: { _form: ["Error al registrar la atención"] } };
  }
}

const AppointmentSchema = z.object({
  serviceId: z.string().min(1, "Selecciona un servicio"),
  date: z.preprocess((val) => parseIncomingDate(val), z.date()),
  notes: z.string().max(1000).optional().nullable(),
});

export type AppointmentFormState = {
  errors?: {
    serviceId?: string[];
    date?: string[];
    notes?: string[];
    _form?: string[];
  };
  success?: boolean;
};

export async function createAppointmentAction(
  dogId: string,
  _prev: AppointmentFormState,
  formData: FormData,
): Promise<AppointmentFormState> {
  try {
    await requireAdmin();
    const raw = {
      serviceId: formData.get("serviceId") as string,
      date: formData.get("date") as string,
      notes: (formData.get("notes") as string) || null,
    };

    const parsed = AppointmentSchema.safeParse(raw);
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    await prisma.appointment.create({
      data: {
        serviceId: parsed.data.serviceId,
        date: parsed.data.date,
        notes: parsed.data.notes || null,
        status: "PENDING",
        dogId,
      },
    });

    revalidatePath(`/admin/perros/${dogId}`);
    return { success: true };
  } catch (error) {
    return { errors: { _form: ["Error al agendar la cita"] } };
  }
}
