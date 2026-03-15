import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { FullCalendar } from './FullCalendar';
import type { CalendarEvent } from './FullCalendar';

const sampleEvents: CalendarEvent[] = [
  { id: 'evt-1', title: 'Team Standup', date: '2026-01-05', color: '#3b82f6' },
  { id: 'evt-2', title: 'Sprint Review', date: '2026-01-15', color: '#ef4444' },
  { id: 'evt-3', title: 'Design Sync', date: '2026-01-15', color: '#10b981' },
  { id: 'evt-4', title: 'Deploy v2', date: '2026-01-28', color: '#f59e0b' },
  { id: 'evt-5', title: 'Retrospective', date: '2026-01-22', color: '#8b5cf6' },
  { id: 'evt-6', title: '1:1 Meeting', date: '2026-01-09', color: '#ec4899' },
];

/**
 * FullCalendar displays a monthly calendar grid with event pills.
 * - 26 color themes via toolbar dropdown
 * - 3 component variants (default/compact/modern) via toolbar dropdown
 * - Click dates to select, click events to view details
 * - Navigate months with prev/next buttons
 */
const meta = {
  title: 'Tracking/FullCalendar',
  component: FullCalendar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    events: {
      control: 'object',
      description: 'Array of calendar events',
    },
    selectedDate: {
      control: 'date',
      description: 'Currently selected date',
    },
    initialYear: {
      control: 'number',
      description: 'Initial year to display',
    },
    initialMonth: {
      control: 'number',
      description: 'Initial month (0-indexed)',
    },
  },
} satisfies Meta<typeof FullCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialYear: 2026,
    initialMonth: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByTestId('calendar-title');
    await expect(title).toHaveTextContent('January 2026');
    const headers = canvas.getAllByRole('columnheader');
    await expect(headers).toHaveLength(7);
  },
};

export const WithEvents: Story = {
  args: {
    initialYear: 2026,
    initialMonth: 0,
    events: sampleEvents,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const event = canvas.getByTestId('event-evt-2');
    await expect(event).toHaveTextContent('Sprint Review');
  },
};

export const SelectedDate: Story = {
  args: {
    initialYear: 2026,
    initialMonth: 0,
    events: sampleEvents,
    selectedDate: new Date(2026, 0, 15),
  },
};

export const NavigateMonths: Story = {
  args: {
    initialYear: 2026,
    initialMonth: 0,
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: 12, color: 'var(--color-fg-muted)', fontSize: 14 }}>
        Use the arrow buttons in the header to navigate between months.
      </p>
      <FullCalendar {...args} />
    </div>
  ),
};
