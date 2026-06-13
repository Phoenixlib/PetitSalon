"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  startOfDay,
  setHours,
  setMinutes,
  addMonths,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, RefreshCw, Maximize2, X, CalendarRange } from "lucide-react";
import type { AppointmentWithRelations, AppointmentStatus } from "@/types";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const AppointmentDetailModal = dynamic(() => import("./AppointmentDetailModal"));
const NuevaCitaModal = dynamic(() => import("./NuevaCitaModal"));
const BloqueoHorasModal = dynamic(() => import("./BloqueoHorasModal"));
const BlockDetailsModal = dynamic(() => import("./BlockDetailsModal"));

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface Props {
  initialAppointments: AppointmentWithRelations[];
  services: Service[];
  initialAvailabilityRules: any[];
}

const STATUS_STYLES: Record<AppointmentStatus, { bg: string; text: string; border: string }> = {
  PENDING: { bg: "bg-amber-100", text: "text-amber-900", border: "border-amber-400" },
  CONFIRMED: { bg: "bg-blue-100", text: "text-blue-900", border: "border-blue-400" },
  DONE: { bg: "bg-green-100", text: "text-green-900", border: "border-green-400" },
  CANCELLED: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-300" },
};

const isHourAvailable = (date: Date, hour: number, availabilityRules: any[]) => {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayOfWeek = dayNames[date.getDay()];
  if (!dayOfWeek) return false;

  const rules = availabilityRules.filter(r => r.days.includes(dayOfWeek));
  if (rules.length === 0) return false;

  const timeInMins = hour * 60;
  const timeToMins = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };

  return rules.some(r => {
    const startMins = timeToMins(r.startTime);
    const endMins = timeToMins(r.endTime);
    return timeInMins >= startMins && timeInMins < endMins;
  });
};

export default function AgendaCalendar({ initialAppointments, services, initialAvailabilityRules }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Data fetching state
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>(initialAppointments);
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);
  const [availabilityRules, setAvailabilityRules] = useState<any[]>(initialAvailabilityRules);
  const [isFetching, setIsFetching] = useState(false);
  const [currentRange, setCurrentRange] = useState<{ startStr: string; endStr: string } | null>(null);

  // Modals state
  const [selectedAppt, setSelectedAppt] = useState<AppointmentWithRelations | null>(null);
  const [showNewCitaModal, setShowNewCitaModal] = useState(false);
  const [initialNewCitaDate, setInitialNewCitaDate] = useState<string | null>(null);

  // Bloqueo Horas state
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [initialBlockDate, setInitialBlockDate] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<any | null>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, dateStr: string, isOut: boolean, isBlocked: boolean } | null>(null);

  // Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = useMemo(() => eachDayOfInterval({ start: startDate, end: endDate }), [startDate, endDate]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAppointmentsAndBlocks = useCallback(async (start: Date, end: Date) => {
    const startStr = start.toISOString();
    const endStr = end.toISOString();

    if (currentRange?.startStr === startStr && currentRange?.endStr === endStr) return;

    setCurrentRange({ startStr, endStr });
    setIsFetching(true);
    try {
      const [apptsRes, blocksRes, rulesRes] = await Promise.all([
        fetch(`/api/admin/appointments?from=${startStr}&to=${endStr}`),
        fetch(`/api/admin/blocked-slots?start=${startStr}&end=${endStr}`),
        fetch(`/api/admin/availability-rules`)
      ]);

      if (apptsRes.ok) {
        setAppointments(await apptsRes.json());
      }
      if (blocksRes.ok) {
        setBlockedSlots(await blocksRes.json());
      }
      if (rulesRes.ok) {
        setAvailabilityRules(await rulesRes.json());
      }
    } catch (err) {
      console.error("Error fetching agenda data", err);
    } finally {
      setIsFetching(false);
    }
  }, [currentRange]);

  useEffect(() => {
    if (mounted) {
      fetchAppointmentsAndBlocks(startDate, endDate);
    }
  }, [startDate, endDate, mounted, fetchAppointmentsAndBlocks]);

  const refetch = useCallback(() => {
    setCurrentRange(null); // Force refetch
    fetchAppointmentsAndBlocks(startDate, endDate);
  }, [fetchAppointmentsAndBlocks, startDate, endDate]);

  const handleCreateSuccess = useCallback(() => {
    router.refresh();
    refetch();
  }, [router, refetch]);

  const handleStatusChange = (id: string, newStatus: AppointmentStatus) => {
    if (newStatus === "CANCELLED") {
      setAppointments((prev) => prev.filter((app) => app.id !== id));
      setSelectedAppt(null); // Optional: close modal if open
    } else {
      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
    }
  };

  const handleAppointmentUpdate = (updated: AppointmentWithRelations) => {
    if (updated.status === "CANCELLED") {
      setAppointments((prev) => prev.filter((app) => app.id !== updated.id));
      setSelectedAppt(null);
    } else {
      setAppointments((prev) =>
        prev.map((app) => (app.id === updated.id ? updated : app))
      );
      setSelectedAppt(updated);
    }
  };

  // Dynamic hours calculation
  const dynamicHoursRange = useMemo(() => {
    let minH = 8;
    let maxH = 20;

    availabilityRules.forEach(rule => {
      const startH = parseInt(rule.startTime.split(':')[0] || "8", 10);
      let endH = parseInt(rule.endTime.split(':')[0] || "20", 10);
      const endM = parseInt(rule.endTime.split(':')[1] || "0", 10);
      if (endM > 0) endH += 1;
      if (startH < minH) minH = startH;
      if (endH > maxH) maxH = endH;
    });

    appointments.forEach(appt => {
      const startObj = new Date(appt.date);
      const startH = startObj.getHours();
      const endH = startH + Math.ceil(appt.service.duration / 60);
      if (startH < minH) minH = startH;
      if (endH > maxH) maxH = endH;
    });

    if (maxH < 20) maxH = 20;
    if (minH > 8) minH = 8;

    maxH = Math.min(24, maxH);
    minH = Math.max(0, minH);

    const length = maxH - minH;
    return {
      minHour: minH,
      maxHour: maxH,
      hours: Array.from({ length }, (_, i) => i + minH)
    };
  }, [availabilityRules, appointments]);

  const { minHour, maxHour, hours: HOURS } = dynamicHoursRange;

  // Handlers
  const handlePrevWeek = () => setCurrentDate((prev) => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentDate((prev) => addWeeks(prev, 1));
  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setPickerDate(now);
  };

  const handleCellClick = (e: React.MouseEvent, date: Date, hour: number) => {
    e.preventDefault();
    e.stopPropagation();
    const cellDate = setHours(setMinutes(startOfDay(date), 0), hour);
    const isOut = !isHourAvailable(date, hour, availabilityRules);

    const cellStart = cellDate.getTime();
    const cellEnd = cellStart + 60 * 60 * 1000;
    const isBlocked = blockedSlots.some(block => {
      const blockStart = new Date(block.startAt).getTime();
      const blockEnd = new Date(block.endAt).getTime();
      return (cellStart < blockEnd && cellEnd > blockStart);
    });

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      dateStr: format(cellDate, "yyyy-MM-dd'T'HH:mm:ss"),
      isOut,
      isBlocked,
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    window.addEventListener("scroll", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleClick);
    };
  }, []);

  const handleActionCreateCita = () => {
    if (contextMenu && !contextMenu.isBlocked) {
      setInitialNewCitaDate(contextMenu.dateStr);
      setShowNewCitaModal(true);
    }
    closeContextMenu();
  };

  const handleActionBlockSlot = () => {
    if (contextMenu) {
      setInitialBlockDate(contextMenu.dateStr);
      setShowBlockModal(true);
    }
    closeContextMenu();
  };

  const toggleFullscreen = () => {
    const container = document.getElementById("agenda-container");
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Close date picker on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.date-picker-container')) {
        setShowDatePicker(false);
      }
    };
    if (showDatePicker) {
      window.addEventListener("click", handleClick);
    }
    return () => window.removeEventListener("click", handleClick);
  }, [showDatePicker]);

  const renderMiniCalendar = () => {
    const monthStart = startOfDay(new Date(pickerDate.getFullYear(), pickerDate.getMonth(), 1));
    const monthEnd = new Date(pickerDate.getFullYear(), pickerDate.getMonth() + 1, 0);
    const startDateCal = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDateCal = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDateCal, end: endDateCal });

    const currentYear = new Date().getFullYear();
    const yearsList = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-4 w-[300px]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-1">
            <button type="button" onClick={(e) => { e.stopPropagation(); setPickerDate(subMonths(pickerDate, 12)); }} className="p-1 hover:bg-gray-100 rounded-md text-[var(--ps-text)]" title="Año anterior"><ChevronsLeft size={16} /></button>
            <button type="button" onClick={(e) => { e.stopPropagation(); setPickerDate(subMonths(pickerDate, 1)); }} className="p-1 hover:bg-gray-100 rounded-md text-[var(--ps-text)]" title="Mes anterior"><ChevronLeft size={16} /></button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase text-[var(--primary)] tracking-wider">
              {format(pickerDate, "MMMM", { locale: es })}
            </span>
            <div className="relative">
              <select
                value={pickerDate.getFullYear()}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  const newYear = parseInt(e.target.value);
                  const newDate = new Date(pickerDate);
                  newDate.setFullYear(newYear);
                  setPickerDate(newDate);
                }}
                className="text-xs font-bold uppercase text-[var(--primary)] bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-md outline-none cursor-pointer transition-colors appearance-none pr-5"
              >
                {yearsList.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--primary)]/50">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
              </div>
            </div>
          </div>

          <div className="flex gap-1">
            <button type="button" onClick={(e) => { e.stopPropagation(); setPickerDate(addMonths(pickerDate, 1)); }} className="p-1 hover:bg-gray-100 rounded-md text-[var(--ps-text)]" title="Mes siguiente"><ChevronRight size={16} /></button>
            <button type="button" onClick={(e) => { e.stopPropagation(); setPickerDate(addMonths(pickerDate, 12)); }} className="p-1 hover:bg-gray-100 rounded-md text-[var(--ps-text)]" title="Año siguiente"><ChevronsRight size={16} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-[var(--ps-text-mid)] font-bold mb-2">
          {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const isCurrentMonth = day.getMonth() === pickerDate.getMonth();
            const isSelected = isSameDay(day, currentDate);
            const isToday = isSameDay(day, new Date());
            return (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentDate(day);
                  setShowDatePicker(false);
                }}
                className={`h-7 w-7 flex items-center justify-center rounded-full text-xs font-medium transition-colors ${!isCurrentMonth ? "text-gray-300" :
                    isSelected ? "bg-[var(--primary)] text-white shadow-md" :
                      isToday ? "bg-gray-100 text-[var(--primary)] font-bold" :
                        "text-[var(--ps-text)] hover:bg-gray-100"
                  }`}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (!mounted) {
    return (
      <div
        className="h-[600px] w-full rounded-xl animate-pulse"
        style={{ backgroundColor: "var(--ps-lila-pale)" }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full gap-4 relative">
      <div
        id="agenda-container"
        className={`flex-1 flex flex-col bg-white border border-gray-100 overflow-hidden transition-all ${isFullscreen
            ? "fixed inset-0 z-50 w-screen h-screen p-2 lg:p-6 bg-white"
            : "rounded-2xl shadow-sm h-[calc(100vh-140px)] min-h-[600px] lg:h-auto"
          }`}
      >
        {/* Agenda Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-3 lg:p-4 border-b border-gray-100 gap-4">
          <div className="flex items-center gap-3">
            <button onClick={handlePrevWeek} className="p-2 hover:bg-gray-50 rounded-full text-[var(--ps-text)] transition-colors"><ChevronLeft size={20} /></button>


            <div className="relative date-picker-container">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowDatePicker(!showDatePicker); setPickerDate(currentDate); }}
                className="text-base sm:text-lg text-[var(--ps-text)] capitalize min-w-36 lg:min-w-48 text-center font-bold hover:bg-gray-50 px-4 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {format(startDate, "MMMM yyyy", { locale: es })}
                <span className="text-xs opacity-50">▼</span>
              </button>

              {showDatePicker && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50">
                  {renderMiniCalendar()}
                </div>
              )}
            </div>

            <button onClick={handleNextWeek} className="p-2 hover:bg-gray-50 rounded-full text-[var(--ps-text)] transition-colors"><ChevronRight size={20} /></button>
            <button onClick={handleToday} className="px-4 py-1.5 bg-gray-50 hover:bg-gray-100 text-[var(--ps-text)] text-[10px] font-bold uppercase tracking-widest rounded-full transition-colors ml-2 hidden md:block">
              Hoy
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} className="p-2 hover:bg-gray-50 rounded-xl text-[var(--ps-text-mid)] transition-colors" title="Actualizar">
              <RefreshCw size={18} className={isFetching ? "animate-spin text-[var(--primary)]" : ""} />
            </button>
            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 ${isFullscreen
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "hover:bg-gray-50 text-[var(--ps-text-mid)]"
                }`}
              title={isFullscreen ? "Volver (Salir de pantalla completa)" : "Pantalla Completa"}
            >
              {isFullscreen ? (
                <>
                  <X size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider hidden md:inline">Volver</span>
                </>
              ) : (
                <Maximize2 size={18} />
              )}
            </button>
            <a
              href={`https://app.cal.com/availability/${process.env.NEXT_PUBLIC_CALCOM_SCHEDULE_ID || "1515358"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center hover:bg-gray-50 transition-colors text-[var(--ps-text)] px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold uppercase gap-2 border border-gray-200 shadow-sm"
              title="Disponibilidad en Cal.com"
            >
              <CalendarRange size={16} className="text-[var(--secondary)]" />
              <span className="hidden md:inline">Disponibilidad</span>
            </a>
            <button
              onClick={() => {
                setInitialNewCitaDate(null);
                setShowNewCitaModal(true);
              }}
              className="flex items-center justify-center bg-[var(--primary)] hover:opacity-90 transition-colors text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold uppercase gap-2 shadow-sm"
              title="Nueva Cita"
            >
              <Plus size={16} />
              <span className="hidden md:inline">Agendar Cita</span>
            </button>
          </div>
        </div>

        {/* Compact Grid View */}
        <div className="flex-1 overflow-auto relative">
          <div className="min-w-[800px] h-full flex flex-col">
            {/* Days Header */}
            <div className="flex border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-30">
              <div className="w-16 shrink-0 border-r border-gray-100 bg-gray-50/50" />
              {weekDays.map((day, idx) => (
                <div key={idx} className={`flex-1 min-w-0 p-3 text-center border-r border-gray-100 ${isSameDay(day, new Date()) ? 'bg-gray-50' : ''}`}>
                  <p className="text-[10px] font-bold uppercase text-[var(--ps-text-mid)] tracking-wider">
                    {format(day, "EEEE", { locale: es })}
                  </p>
                  <p className={`text-xl mt-0.5 ${isSameDay(day, new Date()) ? 'text-[var(--primary)] font-bold' : 'text-[var(--ps-text)]'}`}>
                    {format(day, "d")}
                  </p>
                </div>
              ))}
            </div>

            {/* Grid Body */}
            <div className="flex relative bg-gray-50/20" style={{ height: `${HOURS.length * 60}px` }}>
              {/* Time Labels (Y-axis) */}
              <div className="w-16 shrink-0 border-r border-gray-100 bg-white sticky left-0 z-20">
                {HOURS.map((hour) => (
                  <div key={hour} className="h-[60px] flex items-start justify-end pr-2 pt-1 border-b border-gray-100 box-border">
                    <span className="text-[10px] font-bold text-[var(--ps-text-mid)]">
                      {hour.toString().padStart(2, "0")}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              <div className="flex-1 flex relative">
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 pointer-events-none z-0 flex flex-col">
                  {HOURS.map(h => (
                    <div key={h} className="h-[60px] border-b border-gray-100 box-border w-full" />
                  ))}
                </div>

                {/* Vertical columns for interaction */}
                {weekDays.map((day, dIdx) => (
                  <div key={dIdx} className="flex-1 relative border-r border-gray-100 box-border z-10">
                    {/* Empty cell interaction areas */}
                    {HOURS.map(hour => {
                      const isAvailable = isHourAvailable(day, hour, availabilityRules);
                      return (
                        <div
                          key={hour}
                          className={`absolute w-full h-[60px] cursor-pointer transition-colors ${isAvailable
                              ? "hover:bg-[var(--primary)]/5"
                              : "bg-[repeating-linear-gradient(-45deg,rgba(0,0,0,0.02),rgba(0,0,0,0.02)_4px,transparent_4px,transparent_8px)] bg-gray-50/40 hover:bg-gray-50/60"
                            }`}
                          style={{ top: `${(hour - minHour) * 60}px` }}
                          onClick={(e) => handleCellClick(e, day, hour)}
                        />
                      );
                    })}

                    {/* Blocked Slots Overlay */}
                    {blockedSlots
                      .filter((bs) => isSameDay(new Date(bs.startAt), day))
                      .map((block) => {
                        const startObj = new Date(block.startAt);
                        const endObj = new Date(block.endAt);

                        const startDecimal = startObj.getHours() + startObj.getMinutes() / 60;
                        let durationHrs = (endObj.getTime() - startObj.getTime()) / (1000 * 60 * 60);

                        // Adjust for full day bounds
                        let adjustedStart = startDecimal;
                        let adjustedDuration = durationHrs;

                        if (adjustedStart < minHour) {
                          adjustedDuration -= (minHour - adjustedStart);
                          adjustedStart = minHour;
                        }
                        if (adjustedStart + adjustedDuration > maxHour) {
                          adjustedDuration = maxHour - adjustedStart;
                        }

                        if (adjustedStart >= maxHour || adjustedStart + adjustedDuration <= minHour) return null;

                        const top = (adjustedStart - minHour) * 60;
                        const height = adjustedDuration * 60;
                        const isVirtual = block.id.startsWith("virtual_") || block.isVirtual;

                        return (
                          <div
                            key={block.id}
                            className="absolute left-1 right-1 bg-slate-200/85 border border-slate-300 rounded-lg p-1.5 overflow-hidden z-20 flex flex-col justify-between shadow-sm cursor-pointer hover:bg-slate-200 transition-colors"
                            style={{ top: `${top}px`, height: `${Math.max(height, 20)}px` }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBlock(block);
                            }}
                          >
                            <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest leading-none truncate">
                              Bloqueado
                            </span>
                            {height > 30 && (
                              <span className="text-[8px] text-slate-500 font-medium leading-none truncate mt-1">
                                {isVirtual ? "🌐 Cal.com" : "📱 Local"}
                              </span>
                            )}
                          </div>
                        );
                      })}

                    {/* Appointments Overlay */}
                    {appointments
                      .filter((appt) => isSameDay(new Date(appt.date), day))
                      .map((appt) => {
                        const startObj = new Date(appt.date);
                        const startDecimal = startObj.getHours() + startObj.getMinutes() / 60;
                        const durationHrs = appt.service.duration / 60;

                        if (startDecimal < minHour || startDecimal >= maxHour) return null;

                        const top = (startDecimal - minHour) * 60;
                        const height = durationHrs * 60;
                        const styleConfig = STATUS_STYLES[appt.status] || STATUS_STYLES.PENDING;

                        return (
                          <div
                            key={appt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppt(appt);
                            }}
                            className={`absolute left-1 right-1 rounded-xl p-2 cursor-pointer shadow-sm hover:shadow-md transition-all border-l-4 z-20 overflow-hidden flex flex-col ${styleConfig.bg} ${styleConfig.text} ${styleConfig.border}`}
                            style={{ top: `${top}px`, height: `${height}px` }}
                          >
                            <p className={`text-[10px] font-bold truncate leading-tight`}>
                              🐾 {appt.dog.name} - {appt.dog.owner.name} {appt.whatsappSentAt && " ✓WA"}
                            </p>
                            <p className={`text-[9px] truncate mt-0.5 opacity-80 ${styleConfig.text}`}>
                              {appt.service?.name}
                            </p>
                            {height >= 50 && (
                              <p className={`text-[9px] font-semibold mt-auto truncate opacity-70 ${styleConfig.text}`}>
                                {format(startObj, "HH:mm")} - {format(new Date(startObj.getTime() + appt.service.duration * 60000), "HH:mm")}
                              </p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <div
            className="fixed z-50 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-52 animate-in fade-in zoom-in-95 duration-150"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 border-b border-gray-100 mb-1">
              <span className="text-[10px] font-bold text-[var(--ps-text-mid)] uppercase tracking-widest block">
                {format(new Date(contextMenu.dateStr), "d MMM, HH:mm", { locale: es })}
              </span>
            </div>
            <button
              onClick={handleActionCreateCita}
              disabled={contextMenu.isBlocked}
              className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 ${contextMenu.isBlocked ? "text-gray-400 cursor-not-allowed" : "text-[var(--ps-text)]"}`}
            >
              <Plus size={14} className={contextMenu.isBlocked ? "text-gray-400" : "text-[var(--primary)]"} />
              {contextMenu.isBlocked ? "Horario Bloqueado" : contextMenu.isOut ? "Agendar Cita (Sobre Cupo)" : "Agendar Cita"}
            </button>
            {!contextMenu.isOut && !contextMenu.isBlocked && (
              <button
                onClick={handleActionBlockSlot}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[var(--ps-text)] hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <X size={14} className="text-red-500" />
                Bloquear Horario
              </button>
            )}
          </div>
        )}

        <AnimatePresence>
          {selectedAppt && (
            <AppointmentDetailModal
              appointment={selectedAppt}
              onClose={() => setSelectedAppt(null)}
              onStatusChange={handleStatusChange}
              onAppointmentUpdate={handleAppointmentUpdate}
            />
          )}

          {showNewCitaModal && (
            <NuevaCitaModal
              isOpen={showNewCitaModal}
              onClose={() => {
                setShowNewCitaModal(false);
                setInitialNewCitaDate(null);
              }}
              initialDateStr={initialNewCitaDate}
              services={services}
              onSuccess={handleCreateSuccess}
              availabilityRules={availabilityRules}
            />
          )}

          {showBlockModal && (
            <BloqueoHorasModal
              isOpen={showBlockModal}
              onClose={() => setShowBlockModal(false)}
              initialDateStr={initialBlockDate}
              onSuccess={refetch}
            />
          )}

          {selectedBlock && (
            <BlockDetailsModal
              isOpen={!!selectedBlock}
              onClose={() => setSelectedBlock(null)}
              block={selectedBlock}
              onSuccess={refetch}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
