import type { AppointmentStatus } from "@prisma/client";

export type { AppointmentStatus };

export interface AppointmentWithRelations {
  id: string;
  date: Date;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: Date;
  dog: {
    id: string;
    name: string;
    breed: string;
    owner: {
      id: string;
      name: string;
      phone: string;
    };
  };
  service: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
}

export interface DogWithRelations {
  id: string;
  name: string;
  breed: string;
  birthDate: Date | null;
  notes: string | null;
  photo: string | null;
  createdAt: Date;
  owner: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  };
}
