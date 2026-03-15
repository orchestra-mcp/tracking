import { render, screen, fireEvent, act } from '@testing-library/react';
import { Timer } from './Timer';

describe('Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders 00:00:00 initially in full mode', () => {
    render(<Timer />);
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  it('renders 00:00 initially in compact mode', () => {
    render(<Timer display="compact" />);
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('shows start and reset buttons', () => {
    render(<Timer />);
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('hides controls when showControls is false', () => {
    render(<Timer showControls={false} />);
    expect(screen.queryByRole('button', { name: /start/i })).not.toBeInTheDocument();
  });

  it('toggles start/pause on click', () => {
    render(<Timer />);
    const btn = screen.getByRole('button', { name: /start/i });
    fireEvent.click(btn);
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /pause/i }));
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('increments time each second in stopwatch mode', () => {
    render(<Timer />);
    fireEvent.click(screen.getByRole('button', { name: /start/i }));

    act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.getByText('00:00:03')).toBeInTheDocument();
  });

  it('resets timer to 00:00:00', () => {
    render(<Timer />);
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    act(() => { vi.advanceTimersByTime(5000); });

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  it('compact hides hours when zero', () => {
    render(<Timer display="compact" />);
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText('00:02')).toBeInTheDocument();
  });

  it('countdown counts down from initialTime', () => {
    render(<Timer mode="countdown" initialTime={5} />);
    expect(screen.getByText('00:00:05')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.getByText('00:00:02')).toBeInTheDocument();
  });

  it('fires onComplete when countdown reaches 0', () => {
    const onComplete = vi.fn();
    render(<Timer mode="countdown" initialTime={2} onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    act(() => { vi.advanceTimersByTime(2000); });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onTick each second', () => {
    const onTick = vi.fn();
    render(<Timer onTick={onTick} />);

    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onTick).toHaveBeenCalledTimes(3);
    expect(onTick).toHaveBeenLastCalledWith(3);
  });

  it('shows lap button when showLaps is true', () => {
    render(<Timer showLaps />);
    expect(screen.getByRole('button', { name: /lap/i })).toBeInTheDocument();
  });

  it('adds laps to the list', () => {
    render(<Timer showLaps />);
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    act(() => { vi.advanceTimersByTime(2000); });

    fireEvent.click(screen.getByRole('button', { name: /lap/i }));
    expect(screen.getByText(/Lap 1/)).toBeInTheDocument();
  });

  it('auto-starts when autoStart is true', () => {
    render(<Timer autoStart />);
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByText('00:00:01')).toBeInTheDocument();
  });
});
