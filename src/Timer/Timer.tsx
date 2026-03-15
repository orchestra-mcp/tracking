import { useState, useRef, useCallback, useEffect } from 'react';
import './Timer.css';

export interface TimerProps {
  /** Timer mode */
  mode?: 'stopwatch' | 'countdown';
  /** Initial time in seconds (countdown start, or stopwatch offset) */
  initialTime?: number;
  /** Start timer automatically on mount */
  autoStart?: boolean;
  /** Display format */
  display?: 'full' | 'compact';
  /** Called every second with elapsed seconds */
  onTick?: (seconds: number) => void;
  /** Called when countdown reaches 0 */
  onComplete?: () => void;
  /** Show start/pause/reset controls */
  showControls?: boolean;
  /** Show lap button and lap list */
  showLaps?: boolean;
}

function formatTime(totalSeconds: number, compact: boolean): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  if (compact && hrs === 0) {
    return `${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

export const Timer = ({
  mode = 'stopwatch',
  initialTime = 0,
  autoStart = false,
  display = 'full',
  onTick,
  onComplete,
  showControls = true,
  showLaps = false,
}: TimerProps) => {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(autoStart);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  const currentTime =
    mode === 'countdown'
      ? Math.max(initialTime - elapsed, 0)
      : elapsed;

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
    }, 1000);
    setRunning(true);
  }, [clearTimer]);

  const pauseTimer = useCallback(() => {
    clearTimer();
    setRunning(false);
  }, [clearTimer]);

  const resetTimer = useCallback(() => {
    clearTimer();
    setElapsed(0);
    elapsedRef.current = 0;
    setRunning(false);
    setLaps([]);
  }, [clearTimer]);

  const addLap = useCallback(() => {
    setLaps((prev) => [...prev, currentTime]);
  }, [currentTime]);

  // Handle onTick
  useEffect(() => {
    if (elapsed > 0) onTick?.(elapsed);
  }, [elapsed, onTick]);

  // Handle countdown complete
  useEffect(() => {
    if (mode === 'countdown' && currentTime === 0 && elapsed > 0) {
      pauseTimer();
      onComplete?.();
    }
  }, [mode, currentTime, elapsed, pauseTimer, onComplete]);

  // Auto-start
  useEffect(() => {
    if (autoStart) startTimer();
    return clearTimer;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const compact = display === 'compact';

  return (
    <div className="timer" data-mode={mode}>
      <div className={`timer__display ${compact ? 'timer__display--compact' : ''}`}>
        {formatTime(currentTime, compact)}
      </div>

      {showControls && (
        <div className="timer__controls">
          <button
            type="button"
            className="timer__btn timer__btn--primary"
            onClick={running ? pauseTimer : startTimer}
          >
            {running ? 'Pause' : 'Start'}
          </button>
          <button
            type="button"
            className="timer__btn timer__btn--secondary"
            onClick={resetTimer}
          >
            Reset
          </button>
          {showLaps && (
            <button
              type="button"
              className="timer__btn timer__btn--secondary"
              onClick={addLap}
              disabled={!running}
            >
              Lap
            </button>
          )}
        </div>
      )}

      {showLaps && laps.length > 0 && (
        <ol className="timer__laps">
          {laps.map((lap, i) => (
            <li key={i} className="timer__lap">
              Lap {i + 1}: {formatTime(lap, compact)}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
