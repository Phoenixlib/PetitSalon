"use client";

import { motion } from "framer-motion";
import AdminBookingWizard, { OwnerResult, DogResult } from "./AdminBookingWizard";

interface AdminBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOwner?: OwnerResult;
  initialDog?: DogResult;
}

export default function AdminBookingModal({
  isOpen,
  onClose,
  initialOwner,
  initialDog,
}: AdminBookingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col"
      >
        <AdminBookingWizard 
          initialOwner={initialOwner}
          initialDog={initialDog}
          onClose={onClose}
          className="p-6 overflow-y-auto max-h-[90vh]"
        />
      </motion.div>
    </div>
  );
}
