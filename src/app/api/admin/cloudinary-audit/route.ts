/**
 * GET /api/admin/cloudinary-audit
 *
 * Estrategia 3: Auditoría periódica de assets huérfanos en Cloudinary.
 *
 * Compara TODOS los assets en la carpeta "petitsalon/" contra las URLs
 * actualmente referenciadas en la base de datos.
 * Los assets sin referencia en la BD se eliminan de Cloudinary.
 *
 * Uso: llamar manualmente desde el panel admin o configurar un cron externo
 * (Vercel Cron Jobs, GitHub Actions schedule, etc.) que llame a esta ruta
 * con el header "Authorization: Bearer <AUTH_SECRET>".
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listAssetsInFolder, destroyByUrls, publicIdFromUrl } from "@/lib/cloudinary";
import { env } from "@/env";

export async function GET(request: NextRequest) {
  // Autenticación: sesión de admin O bearer token (para cron jobs)
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.replace("Bearer ", "");

  if (bearerToken !== env.AUTH_SECRET) {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  try {
    // -----------------------------------------------------------------
    // 1. Obtener todos los assets de Cloudinary en la carpeta del proyecto
    // -----------------------------------------------------------------
    const cloudinaryAssets = await listAssetsInFolder("petitsalon");

    // -----------------------------------------------------------------
    // 2. Recopilar todas las URLs activas en la base de datos
    // -----------------------------------------------------------------
    const [attendances, galleryPairs, dogs] = await Promise.all([
      prisma.attendance.findMany({ select: { photos: true } }),
      prisma.galleryPair.findMany({
        select: { beforeUrl: true, afterUrl: true },
      }),
      prisma.dog.findMany({
        where: { photo: { not: null } },
        select: { photo: true },
      }),
    ]);

    // Construir un Set de public_ids activos
    const activePublicIds = new Set<string>();

    for (const a of attendances) {
      for (const url of a.photos) {
        const pid = publicIdFromUrl(url);
        if (pid) activePublicIds.add(pid);
      }
    }
    for (const g of galleryPairs) {
      const pidBefore = publicIdFromUrl(g.beforeUrl);
      const pidAfter = publicIdFromUrl(g.afterUrl);
      if (pidBefore) activePublicIds.add(pidBefore);
      if (pidAfter) activePublicIds.add(pidAfter);
    }
    for (const d of dogs) {
      if (d.photo) {
        const pid = publicIdFromUrl(d.photo);
        if (pid) activePublicIds.add(pid);
      }
    }

    // -----------------------------------------------------------------
    // 3. Identificar orphans
    // -----------------------------------------------------------------
    const orphans = cloudinaryAssets.filter(
      (asset) => !activePublicIds.has(asset.publicId),
    );

    // -----------------------------------------------------------------
    // 4. Eliminar orphans de Cloudinary
    // -----------------------------------------------------------------
    let deleted = 0;
    if (orphans.length > 0) {
      const orphanUrls = orphans.map((o) => o.secureUrl);
      await destroyByUrls(orphanUrls);
      deleted = orphans.length;
    }

    // -----------------------------------------------------------------
    // 5. Reporte
    // -----------------------------------------------------------------
    const report = {
      totalInCloudinary: cloudinaryAssets.length,
      totalActiveInDB: activePublicIds.size,
      orphansFound: orphans.length,
      orphansDeleted: deleted,
      orphanPublicIds: orphans.map((o) => o.publicId),
      auditedAt: new Date().toISOString(),
    };

    console.log("[Cloudinary Audit]", report);

    return NextResponse.json(report);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("[Cloudinary Audit] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
