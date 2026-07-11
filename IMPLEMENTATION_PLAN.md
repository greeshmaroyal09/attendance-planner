# Attendance Planner Implementation Plan

## Scope
This plan completes the remaining production-readiness work for the Attendance Planner without redesigning the existing React + Vite architecture. The implementation will extend the current services, components, storage layer, and PWA setup while preserving existing localStorage data and exported backup compatibility.

## Current Baseline
- The app already has a working data model with subjects, timetable, attendance records, calendar data, and basic analytics/UI.
- Existing tests are passing:
  - `npm test` → 3 test files, 5 tests passing
- The main gaps are in attendance integrity, calendar behavior, mobile navigation, settings, and PWA install/offline support.

## Guiding Principles
- Preserve the existing architecture and state flow.
- Reuse current services and utilities where possible.
- Avoid breaking existing localStorage structure without migration.
- Keep backward compatibility for existing exported JSON backups.
- Validate every phase with the build and test suite before moving on.

## Phase 1 — Attendance integrity
Goal: prevent stale or orphaned attendance data from corrupting statistics.

### Planned work
- Normalize attendance records before they are persisted.
- Remove attendance entries for timetable slots that no longer exist after timetable changes.
- Validate existing attendance records against current timetable slots and drop invalid slot references.
- Ensure subject summary and remaining classes only use current, valid slots.
- Prevent orphan slot IDs from affecting attendance statistics.

### Expected touchpoints
- [src/services/attendanceService.js](src/services/attendanceService.js)
- [src/pages/PlannerPage.jsx](src/pages/PlannerPage.jsx)
- [src/utils/attendance.js](src/utils/attendance.js)
- [src/utils/timetable.js](src/utils/timetable.js)

## Phase 2 — Attendance management UX
Goal: complete the missing day-level attendance actions and make the workflow clearer.

### Planned work
- Keep the existing save success feedback but ensure it is triggered reliably after save.
- Add a clear attendance action that removes the current day’s saved attendance entry.
- Add explicit delete support for the selected date’s attendance record.
- Normalize records before save so the stored structure remains consistent.

### Expected touchpoints
- [src/components/TodayPage.jsx](src/components/TodayPage.jsx)
- [src/pages/PlannerPage.jsx](src/pages/PlannerPage.jsx)
- [src/services/attendanceService.js](src/services/attendanceService.js)
- [src/storage/localStorage.js](src/storage/localStorage.js)

## Phase 3 — Calendar enhancements
Goal: make the calendar reflect attendance, exams, holidays, and today with better visual cues.

### Planned work
- Highlight dates that contain saved attendance records.
- Highlight exam dates.
- Highlight holiday dates and custom holiday overrides.
- Highlight today clearly.
- Add working day counter support.
- Ensure custom holidays influence attendance calculations and working-day checks.

### Expected touchpoints
- [src/components/CalendarView.jsx](src/components/CalendarView.jsx)
- [src/utils/calendar.js](src/utils/calendar.js)
- [src/data/academicCalendar.js](src/data/academicCalendar.js)
- [src/pages/PlannerPage.jsx](src/pages/PlannerPage.jsx)

## Phase 4 — Mobile navigation and menus
Goal: add a mobile-first navigation experience that fits the current single-page structure.

### Planned work
- Add a bottom navigation with:
  - Dashboard
  - Subjects
  - Timetable
  - Attendance
  - Calendar
  - More
- Add a More menu with:
  - Analytics
  - History
  - Bunk Planner
  - Leave Planner
  - Settings
- Keep the existing content sections but make them reachable on small screens.

### Expected touchpoints
- [src/App.jsx](src/App.jsx)
- [src/pages/PlannerPage.jsx](src/pages/PlannerPage.jsx)
- [src/components/CalendarView.jsx](src/components/CalendarView.jsx)
- [src/index.css](src/index.css)

## Phase 5 — Analytics improvements
Goal: show the full attendance picture in one place.

### Planned work
- Display:
  - Attendance %
  - Present count
  - Absent count
  - Remaining classes
  - Safe bunks
  - Danger status
- Reuse the existing attendance and summary utilities rather than introducing a separate analytics engine.

### Expected touchpoints
- [src/components/BunkPredictor.jsx](src/components/BunkPredictor.jsx)
- [src/services/attendanceService.js](src/services/attendanceService.js)
- [src/utils/attendance.js](src/utils/attendance.js)

## Phase 6 — Settings and data management
Goal: make settings configurable and keep backup imports safe.

### Planned work
- Add attendance threshold configuration.
- Add export support for current data.
- Add import support for existing and future backup files.
- Add reset support.
- Add backward-compatible migration logic for old localStorage data and older exported JSON files.

### Expected touchpoints
- [src/App.jsx](src/App.jsx)
- [src/pages/PlannerPage.jsx](src/pages/PlannerPage.jsx)
- [src/storage/localStorage.js](src/storage/localStorage.js)
- [src/data/academicCalendar.js](src/data/academicCalendar.js)

## Phase 7 — PWA readiness
Goal: make the app installable and usable offline after first load.

### Planned work
- Add `vite-plugin-pwa` integration.
- Update the manifest for installability.
- Replace the basic service worker with a Vite PWA-compatible setup.
- Add an install prompt and Android-friendly install support.
- Ensure the app can load offline after the first successful load.

### Expected touchpoints
- [vite.config.js](vite.config.js)
- [manifest.json](manifest.json)
- [index.html](index.html)
- [src/main.jsx](src/main.jsx)
- [public/sw.js](public/sw.js)
- [sw.js](sw.js)

## Files to modify
- [src/services/attendanceService.js](src/services/attendanceService.js)
- [src/pages/PlannerPage.jsx](src/pages/PlannerPage.jsx)
- [src/components/TodayPage.jsx](src/components/TodayPage.jsx)
- [src/components/CalendarView.jsx](src/components/CalendarView.jsx)
- [src/components/BunkPredictor.jsx](src/components/BunkPredictor.jsx)
- [src/components/SubjectManager.jsx](src/components/SubjectManager.jsx)
- [src/components/TimetableBuilder.jsx](src/components/TimetableBuilder.jsx)
- [src/utils/attendance.js](src/utils/attendance.js)
- [src/utils/calendar.js](src/utils/calendar.js)
- [src/utils/timetable.js](src/utils/timetable.js)
- [src/storage/localStorage.js](src/storage/localStorage.js)
- [src/data/academicCalendar.js](src/data/academicCalendar.js)
- [src/App.jsx](src/App.jsx)
- [src/main.jsx](src/main.jsx)
- [src/index.css](src/index.css)
- [vite.config.js](vite.config.js)
- [manifest.json](manifest.json)
- [index.html](index.html)
- [public/sw.js](public/sw.js)
- [sw.js](sw.js)

## Files to create
- [src/hooks/usePwaInstall.js](src/hooks/usePwaInstall.js) — install prompt state and Android-friendly handling
- [src/components/MobileNav.jsx](src/components/MobileNav.jsx) — bottom navigation and more menu
- [src/components/SettingsPanel.jsx](src/components/SettingsPanel.jsx) — threshold, export, import, reset, and migration controls
- [src/components/AnalyticsCard.jsx](src/components/AnalyticsCard.jsx) — compact analytics summary card
- [src/utils/storageMigration.js](src/utils/storageMigration.js) — backward-compatible data migration helpers
- [src/utils/pwa.js](src/utils/pwa.js) — install prompt helpers and registration utilities

## Risks
- Existing attendance records may contain stale slot references that need careful migration rather than hard deletion.
- Calendar changes can affect attendance calculations if holiday and exam logic is not applied consistently.
- Mobile navigation must be added without disrupting the current desktop layout.
- PWA behavior can vary across browsers, especially on Android install prompts.
- Existing localStorage data must remain readable even if the schema evolves.

## Dependency chains
1. Attendance normalization utilities must be ready before planner save and summary logic can be safely updated.
2. Calendar behavior changes depend on the migration and normalization utilities being in place.
3. The mobile navigation and settings panels depend on the shared data model in the planner page.
4. PWA integration depends on the app shell and manifest being updated together.

## Implementation order
1. Attendance integrity and normalization
2. Attendance management UX
3. Calendar enhancements
4. Analytics and mobile navigation
5. Settings and migration
6. PWA support and install flow

## Review checkpoint
The implementation will pause after each phase for verification. No source code will be changed until this plan is approved.
