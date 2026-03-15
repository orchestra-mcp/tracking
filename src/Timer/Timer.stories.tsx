import type { Meta, StoryObj } from '@storybook/react';
import { Timer } from './Timer';

/**
 * Timer component for time tracking:
 * - Stopwatch counts up, Countdown counts down from initialTime
 * - Full (HH:MM:SS) and compact (MM:SS) display formats
 * - Optional lap tracking
 * - Responds to color themes and component variants via toolbar
 */
const meta = {
  title: 'Tracking/Timer',
  component: Timer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['stopwatch', 'countdown'],
      description: 'Timer mode',
    },
    display: {
      control: 'select',
      options: ['full', 'compact'],
      description: 'Display format',
    },
    initialTime: {
      control: { type: 'number', min: 0 },
      description: 'Initial time in seconds',
    },
    autoStart: {
      control: 'boolean',
      description: 'Auto-start on mount',
    },
    showControls: {
      control: 'boolean',
      description: 'Show control buttons',
    },
    showLaps: {
      control: 'boolean',
      description: 'Show lap button and list',
    },
  },
} satisfies Meta<typeof Timer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stopwatch: Story = {
  args: {
    mode: 'stopwatch',
    display: 'full',
    showControls: true,
  },
};

export const Countdown: Story = {
  args: {
    mode: 'countdown',
    initialTime: 300,
    display: 'full',
    showControls: true,
  },
};

export const Compact: Story = {
  args: {
    mode: 'stopwatch',
    display: 'compact',
    showControls: true,
  },
};

export const WithLaps: Story = {
  args: {
    mode: 'stopwatch',
    display: 'full',
    showControls: true,
    showLaps: true,
  },
};

export const AutoStart: Story = {
  args: {
    mode: 'stopwatch',
    display: 'full',
    autoStart: true,
    showControls: true,
  },
};
