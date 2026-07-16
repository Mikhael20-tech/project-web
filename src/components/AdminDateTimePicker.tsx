import { useState, useEffect } from "react";
import { Calendar, DatePicker, TimeField } from "@heroui/react";
import { parseDate, parseTime } from "@internationalized/date";
import type { CalendarDate, Time } from "@internationalized/date";
import { CalendarDays, Clock, X, ChevronDown } from "lucide-react";

interface AdminDateTimePickerProps {
  label: string;
  value: string; // "2025-12-31T10:00" (datetime-local format)
  onChange: (value: string) => void;
  required?: boolean;
}

// Parse "2025-12-31T10:00" → { date, time }
function parseDateTimeStr(str: string): {
  date: CalendarDate | null;
  time: Time | null;
} {
  if (!str) return { date: null, time: null };
  try {
    const [datePart, timePart] = str.split("T");
    const date = datePart ? parseDate(datePart) : null;
    const fullTime = timePart
      ? timePart.length === 5
        ? timePart + ":00"
        : timePart
      : null;
    const time = fullTime ? parseTime(fullTime) : null;
    return { date: date as CalendarDate | null, time: time as Time | null };
  } catch {
    return { date: null, time: null };
  }
}

// { date, time } → "2025-12-31T10:00"
function formatDateTimeStr(
  date: CalendarDate | null,
  time: Time | null
): string {
  if (!date) return "";
  const m = String(date.month).padStart(2, "0");
  const d = String(date.day).padStart(2, "0");
  const h = String(time?.hour ?? 0).padStart(2, "0");
  const min = String(time?.minute ?? 0).padStart(2, "0");
  return `${date.year}-${m}-${d}T${h}:${min}`;
}

export function AdminDateTimePicker({
  label,
  value,
  onChange,
  required,
}: AdminDateTimePickerProps) {
  const parsed = parseDateTimeStr(value);
  const [dateValue, setDateValue] = useState<CalendarDate | null>(
    parsed.date
  );
  const [timeValue, setTimeValue] = useState<Time | null>(parsed.time);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Sync when parent value changes (e.g., data loaded from API)
  useEffect(() => {
    const { date, time } = parseDateTimeStr(value);
    setDateValue(date);
    setTimeValue(time);
  }, [value]);

  const handleDateChange = (newDate: CalendarDate | null) => {
    setDateValue(newDate);
    onChange(formatDateTimeStr(newDate, timeValue));
  };

  const handleTimeChange = (newTime: Time | null) => {
    setTimeValue(newTime);
    onChange(formatDateTimeStr(dateValue, newTime));
  };

  const formattedDate = dateValue
    ? `${String(dateValue.day).padStart(2, "0")}/${String(dateValue.month).padStart(2, "0")}/${dateValue.year}`
    : "Pilih tanggal...";

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </label>

      <div className="space-y-2">
        {/* ── Date Picker ── */}
        <DatePicker 
          value={dateValue} 
          onChange={handleDateChange as any}
          isOpen={isDatePickerOpen}
          onOpenChange={setIsDatePickerOpen}
        >
          <DatePicker.Trigger className="w-full px-4 py-3.5 bg-teal-50 border border-teal-100 rounded-[1.25rem] text-teal-950 font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/10 hover:border-teal-300 transition-all shadow-inner flex items-center justify-between group">
            <span className="flex items-center gap-2 text-sm">
              <CalendarDays className="w-4 h-4 text-teal-400 group-hover:text-teal-500 transition-colors" />
              <span
                className={
                  dateValue
                    ? "text-teal-950"
                    : "text-teal-400 font-medium italic"
                }
              >
                {formattedDate}
              </span>
            </span>
            <ChevronDown className="w-4 h-4 text-teal-400/70 group-hover:text-teal-500 transition-colors" />
          </DatePicker.Trigger>

          <DatePicker.Popover 
            className="z-50 !fixed !inset-0 !flex !items-center !justify-center bg-teal-950/20 backdrop-blur-sm !transform-none"
            style={{ transform: "none" }}
          >
            <div className="relative p-6 bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl shadow-teal-500/10 max-w-sm w-full mx-4">
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-teal-800/40 hover:bg-teal-50 hover:text-teal-500 border border-transparent hover:border-teal-100/50 transition-all z-10"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
              <Calendar value={dateValue} onChange={handleDateChange as any}>
                <Calendar.Header className="flex items-center justify-between px-2 pb-3 pr-8">
                  <Calendar.NavButton slot="previous" />
                  <Calendar.Heading className="text-sm font-black text-teal-950" />
                  <Calendar.NavButton slot="next" />
                </Calendar.Header>
                <Calendar.Grid>
                  <Calendar.GridHeader>
                    {(day) => (
                      <Calendar.HeaderCell className="text-[10px] font-black text-teal-800/40 uppercase">
                        {day}
                      </Calendar.HeaderCell>
                    )}
                  </Calendar.GridHeader>
                  <Calendar.GridBody>
                    {(date) => <Calendar.Cell date={date} />}
                  </Calendar.GridBody>
                </Calendar.Grid>
              </Calendar>
            </div>
          </DatePicker.Popover>
        </DatePicker>

        {/* ── Time Field ── */}
        <TimeField
          value={timeValue}
          onChange={handleTimeChange as any}
          hourCycle={24}
        >
          <TimeField.Group className="w-full">
            <TimeField.InputContainer className="w-full px-4 py-3.5 bg-teal-50 border border-teal-100 rounded-[1.25rem] shadow-inner flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <TimeField.Input className="flex-1 font-bold text-sm text-teal-950">
                {(segment) => (
                  <TimeField.Segment
                    segment={segment}
                    className="font-bold text-teal-950 focus:bg-teal-100 focus:rounded px-0.5 outline-none"
                  />
                )}
              </TimeField.Input>
            </TimeField.InputContainer>
          </TimeField.Group>
        </TimeField>
      </div>
    </div>
  );
}
