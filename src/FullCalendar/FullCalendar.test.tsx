import { render, screen, fireEvent } from '@testing-library/react';
import { FullCalendar } from './FullCalendar';
import type { CalendarEvent } from './FullCalendar';

// Use a fixed date to avoid timezone issues: January 15, 2026
const TEST_YEAR = 2026;
const TEST_MONTH = 0; // January (0-indexed)

const sampleEvents: CalendarEvent[] = [
  { id: 'evt-1', title: 'Team Standup', date: '2026-01-05', color: '#3b82f6' },
  { id: 'evt-2', title: 'Sprint Review', date: '2026-01-15', color: '#ef4444' },
  { id: 'evt-3', title: 'Design Sync', date: '2026-01-15', color: '#10b981' },
  { id: 'evt-4', title: 'Deploy v2', date: '2026-01-28', color: '#f59e0b' },
];

describe('FullCalendar', () => {
  it('renders month header with correct month and year', () => {
    render(<FullCalendar initialYear={TEST_YEAR} initialMonth={TEST_MONTH} />);
    expect(screen.getByTestId('calendar-title')).toHaveTextContent('January 2026');
  });

  it('renders 7 day-of-week headers', () => {
    render(<FullCalendar initialYear={TEST_YEAR} initialMonth={TEST_MONTH} />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(7);
    expect(headers[0]).toHaveTextContent('Sun');
    expect(headers[1]).toHaveTextContent('Mon');
    expect(headers[6]).toHaveTextContent('Sat');
  });

  it('renders the correct number of day cells (35 or 42)', () => {
    render(<FullCalendar initialYear={TEST_YEAR} initialMonth={TEST_MONTH} />);
    const cells = screen.getAllByRole('gridcell');
    // January 2026 starts on Thursday (index 4), has 31 days = 4 + 31 = 35 cells
    expect(cells.length).toBeGreaterThanOrEqual(35);
    expect(cells.length % 7).toBe(0);
  });

  it('highlights today with accent class', () => {
    // Mock today as Jan 15, 2026
    const realNow = Date.now;
    Date.now = () => new Date(2026, 0, 15).getTime();
    const spy = vi.spyOn(globalThis, 'Date').mockImplementation((...args: unknown[]) => {
      if (args.length === 0) {
        return new realNow.constructor(2026, 0, 15) as Date;
      }
      // @ts-expect-error - spreading constructor args
      return new realNow.constructor(...args) as Date;
    });
    // The mocking approach above is fragile; instead use a simpler approach
    spy.mockRestore();
    Date.now = realNow;

    // Render with the real Date but look for today's cell
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    render(<FullCalendar initialYear={todayYear} initialMonth={todayMonth} />);

    const todayLabel = today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const todayCell = screen.getByRole('gridcell', { name: todayLabel });
    expect(todayCell).toHaveClass('calendar__cell--today');
  });

  it('navigates to previous month when prev button is clicked', () => {
    render(<FullCalendar initialYear={TEST_YEAR} initialMonth={TEST_MONTH} />);
    expect(screen.getByTestId('calendar-title')).toHaveTextContent('January 2026');

    fireEvent.click(screen.getByLabelText('Previous month'));
    expect(screen.getByTestId('calendar-title')).toHaveTextContent('December 2025');
  });

  it('navigates to next month when next button is clicked', () => {
    render(<FullCalendar initialYear={TEST_YEAR} initialMonth={TEST_MONTH} />);
    expect(screen.getByTestId('calendar-title')).toHaveTextContent('January 2026');

    fireEvent.click(screen.getByLabelText('Next month'));
    expect(screen.getByTestId('calendar-title')).toHaveTextContent('February 2026');
  });

  it('fires onDateSelect when a date cell is clicked', () => {
    const handleDateSelect = vi.fn();
    render(
      <FullCalendar
        initialYear={TEST_YEAR}
        initialMonth={TEST_MONTH}
        onDateSelect={handleDateSelect}
      />,
    );

    const jan10Cell = screen.getByRole('gridcell', {
      name: 'January 10, 2026',
    });
    fireEvent.click(jan10Cell);

    expect(handleDateSelect).toHaveBeenCalledTimes(1);
    const calledDate = handleDateSelect.mock.calls[0][0] as Date;
    expect(calledDate.getFullYear()).toBe(2026);
    expect(calledDate.getMonth()).toBe(0);
    expect(calledDate.getDate()).toBe(10);
  });

  it('displays events on the correct dates', () => {
    render(
      <FullCalendar
        initialYear={TEST_YEAR}
        initialMonth={TEST_MONTH}
        events={sampleEvents}
      />,
    );

    // evt-1 on Jan 5
    const event1 = screen.getByTestId('event-evt-1');
    expect(event1).toHaveTextContent('Team Standup');

    // evt-2 and evt-3 both on Jan 15
    const event2 = screen.getByTestId('event-evt-2');
    expect(event2).toHaveTextContent('Sprint Review');

    const event3 = screen.getByTestId('event-evt-3');
    expect(event3).toHaveTextContent('Design Sync');

    // evt-4 on Jan 28
    const event4 = screen.getByTestId('event-evt-4');
    expect(event4).toHaveTextContent('Deploy v2');
  });

  it('fires onEventClick when an event pill is clicked', () => {
    const handleEventClick = vi.fn();
    render(
      <FullCalendar
        initialYear={TEST_YEAR}
        initialMonth={TEST_MONTH}
        events={sampleEvents}
        onEventClick={handleEventClick}
      />,
    );

    const event2 = screen.getByTestId('event-evt-2');
    fireEvent.click(event2);

    expect(handleEventClick).toHaveBeenCalledTimes(1);
    expect(handleEventClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'evt-2', title: 'Sprint Review' }),
    );
  });

  it('highlights the selected date with accent background', () => {
    const selectedDate = new Date(2026, 0, 20);
    render(
      <FullCalendar
        initialYear={TEST_YEAR}
        initialMonth={TEST_MONTH}
        selectedDate={selectedDate}
      />,
    );

    const selectedCell = screen.getByRole('gridcell', {
      name: 'January 20, 2026',
    });
    expect(selectedCell).toHaveClass('calendar__cell--selected');
  });

  it('renders correct month and year after multiple navigations', () => {
    render(<FullCalendar initialYear={TEST_YEAR} initialMonth={TEST_MONTH} />);

    // Go forward 3 months: Jan -> Feb -> Mar -> Apr
    fireEvent.click(screen.getByLabelText('Next month'));
    fireEvent.click(screen.getByLabelText('Next month'));
    fireEvent.click(screen.getByLabelText('Next month'));
    expect(screen.getByTestId('calendar-title')).toHaveTextContent('April 2026');

    // Go back 1 month: Apr -> Mar
    fireEvent.click(screen.getByLabelText('Previous month'));
    expect(screen.getByTestId('calendar-title')).toHaveTextContent('March 2026');
  });

  it('fires onMonthChange callback when navigating', () => {
    const handleMonthChange = vi.fn();
    render(
      <FullCalendar
        initialYear={TEST_YEAR}
        initialMonth={TEST_MONTH}
        onMonthChange={handleMonthChange}
      />,
    );

    fireEvent.click(screen.getByLabelText('Next month'));
    expect(handleMonthChange).toHaveBeenCalledWith(2026, 1);

    fireEvent.click(screen.getByLabelText('Previous month'));
    expect(handleMonthChange).toHaveBeenCalledWith(2026, 0);
  });

  it('event click does not trigger date select', () => {
    const handleDateSelect = vi.fn();
    const handleEventClick = vi.fn();
    render(
      <FullCalendar
        initialYear={TEST_YEAR}
        initialMonth={TEST_MONTH}
        events={sampleEvents}
        onDateSelect={handleDateSelect}
        onEventClick={handleEventClick}
      />,
    );

    const event1 = screen.getByTestId('event-evt-1');
    fireEvent.click(event1);

    expect(handleEventClick).toHaveBeenCalledTimes(1);
    // onDateSelect should NOT be called because event click stops propagation
    expect(handleDateSelect).not.toHaveBeenCalled();
  });

  it('applies weekend class to Saturday and Sunday cells', () => {
    render(<FullCalendar initialYear={TEST_YEAR} initialMonth={TEST_MONTH} />);

    // January 3, 2026 is a Saturday
    const satCell = screen.getByRole('gridcell', { name: 'January 3, 2026' });
    expect(satCell).toHaveClass('calendar__cell--weekend');

    // January 4, 2026 is a Sunday
    const sunCell = screen.getByRole('gridcell', { name: 'January 4, 2026' });
    expect(sunCell).toHaveClass('calendar__cell--weekend');

    // January 5, 2026 is a Monday
    const monCell = screen.getByRole('gridcell', { name: 'January 5, 2026' });
    expect(monCell).not.toHaveClass('calendar__cell--weekend');
  });
});
