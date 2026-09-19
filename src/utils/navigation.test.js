import { describe, expect, it } from 'vitest';
import {
  createNavigationEntry,
  getNavigationStateFromHash,
} from './navigation';

describe('app navigation state', () => {
  it('keeps the dashboard as the app root without creating a trap', () => {
    expect(getNavigationStateFromHash('')).toEqual({ type: 'root' });
    expect(getNavigationStateFromHash('#')).toEqual({ type: 'root' });
    expect(createNavigationEntry('dashboard')).toBe('');
  });

  it('serializes feature screens to app-level browser history entries', () => {
    expect(createNavigationEntry('attendance')).toBe('#/attendance');
    expect(createNavigationEntry('calendar')).toBe('#/calendar');
    expect(createNavigationEntry('history')).toBe('#/history');
    expect(createNavigationEntry('analytics')).toBe('#/analytics');
  });

  it('restores the app feature screen state from a browser URL', () => {
    expect(getNavigationStateFromHash('#/calendar')).toEqual({ type: 'feature', view: 'calendar' });
    expect(getNavigationStateFromHash('#/history')).toEqual({ type: 'feature', view: 'history' });
    expect(getNavigationStateFromHash('#/attendance')).toEqual({ type: 'feature', view: 'attendance' });
  });
});
