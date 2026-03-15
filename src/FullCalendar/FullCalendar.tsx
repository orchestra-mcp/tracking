import './FullCalendar.css';
import { useState, useMemo, useCallback } from 'react';

export interface CalendarEvent {
  id: string;
  title: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  color?: string;
  allDay?: boolean;
}

export interface FullCalendarProps {
  /** Array of calendar events to display */
  events?: CalendarEvent[];
  /** Called when a date cell is clicked */
  onDateSelect?: (date: Date) => void;
  /** Called when an event pill is clicked */
  onEventClick?: (event: CalendarEvent) => void;
  /** Currently selected date */
  selectedDate?: Date;
  /** Called when month navigation changes */
  onMonthChange?: (year: number, month: number) => void;
  /** Initial year to display (defaults to current year) */
  initialYear?: number;
  /** Initial month to display, 0-indexed (defaults to current month) */
  initialMonth?: number;
}

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DEFAULT_EVENT_COLOR = '#3b82f6';

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

interface DayCell {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

function buildCalendarGrid(year: number, month: number, today: Date): DayCell[] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const cells: DayCell[] = [];

  // Previous month trailing days
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(prevYear, prevMonth, day);
    cells.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    cells.push({
      date,
      day,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    });
  }

  // Next month leading days to fill remaining rows
  const totalCells = Math.ceil(cells.length / 7) * 7;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  let nextDay = 1;

  while (cells.length < totalCells) {
    const date = new Date(nextYear, nextMonth, nextDay);
    cells.push({
      date,
      day: nextDay,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    });
    nextDay++;
  }

  return cells;
}

function dateToKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const FullCalendar = ({
  events = [],
  onDateSelect,
  onEventClick,
  selectedDate,
  onMonthChange,
  initialYear,
  initialMonth,
}: FullCalendarProps) => {
  const now = new Date();
  const [year, setYear] = useState(initialYear ?? now.getFullYear());
  const [month, setMonth] = useState(initialMonth ?? now.getMonth());

  const today = useMemo(() => new Date(), []);

  const cells = useMemo(() => buildCalendarGrid(year, month, today), [year, month, today]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const event of events) {
      const key = event.date;
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(event);
    }
    return map;
  }, [events]);

  const goToPrevMonth = useCallback(() => {
    setYear((y) => (month === 0 ? y - 1 : y));
    setMonth((m) => (m === 0 ? 11 : m - 1));
    const newMonth = month === 0 ? 11 : month - 1;
    const newYear = month === 0 ? year - 1 : year;
    onMonthChange?.(newYear, newMonth);
  }, [month, year, onMonthChange]);

  const goToNextMonth = useCallback(() => {
    setYear((y) => (month === 11 ? y + 1 : y));
    setMonth((m) => (m === 11 ? 0 : m + 1));
    const newMonth = month === 11 ? 0 : month + 1;
    const newYear = month === 11 ? year + 1 : year;
    onMonthChange?.(newYear, newMonth);
  }, [month, year, onMonthChange]);

  const handleDateClick = useCallback(
    (date: Date) => {
      onDateSelect?.(date);
    },
    [onDateSelect],
  );

  const handleEventClick = useCallback(
    (event: CalendarEvent, e: React.MouseEvent) => {
      e.stopPropagation();
      onEventClick?.(event);
    },
    [onEventClick],
  );

  return (
    <div className="calendar" data-testid="full-calendar">
      {/* Header */}
      <div className="calendar__header">
        <h2 className="calendar__title" data-testid="calendar-title">
          {formatMonthYear(year, month)}
        </h2>
        <div className="calendar__nav">
          <button
            type="button"
            className="calendar__nav-btn"
            onClick={goToPrevMonth}
            aria-label="Previous month"
          >
            &#8249;
          </button>
          <button
            type="button"
            className="calendar__nav-btn"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            &#8250;
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="calendar__grid" role="grid" aria-label="Calendar">
        {/* Day headers */}
        {DAY_HEADERS.map((day) => (
          <div
            key={day}
            className="calendar__day-header"
            role="columnheader"
          >
            {day}
          </div>
        ))}

        {/* Day cells */}
        {cells.map((cell) => {
          const key = dateToKey(cell.date);
          const cellEvents = eventsByDate[key] || [];
          const isSelected = selectedDate ? isSameDay(cell.date, selectedDate) : false;

          const classNames = ['calendar__cell'];
          if (!cell.isCurrentMonth) classNames.push('calendar__cell--outside');
          if (cell.isWeekend) classNames.push('calendar__cell--weekend');
          if (cell.isToday) classNames.push('calendar__cell--today');
          if (isSelected) classNames.push('calendar__cell--selected');

          return (
            <div
              key={`${cell.isCurrentMonth ? 'cur' : 'out'}-${key}`}
              className={classNames.join(' ')}
              role="gridcell"
              aria-label={cell.date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              onClick={() => handleDateClick(cell.date)}
            >
              <span className="calendar__date">{cell.day}</span>
              {cellEvents.length > 0 && (
                <div className="calendar__events">
                  {cellEvents.map((event) => (
                    <div
                      key={event.id}
                      className="calendar__event"
                      style={{
                        backgroundColor: event.color || DEFAULT_EVENT_COLOR,
                      }}
                      title={event.title}
                      data-testid={`event-${event.id}`}
                      onClick={(e) => handleEventClick(event, e)}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
