# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Korean calendar event management application built with React 19, TypeScript, and Material-UI. It features recurring events, event overlap detection, notifications, and a dual-view calendar (week/month).

## Development Commands

### Starting Development
```bash
pnpm dev              # Runs both server and Vite dev server concurrently
pnpm start            # Runs Vite dev server only
pnpm run server       # Runs Express server only (port 3000)
pnpm run server:watch # Runs Express server with auto-reload
```

### Testing
```bash
pnpm test             # Runs tests in watch mode
pnpm test:ui          # Opens Vitest UI
pnpm test:coverage    # Generates coverage report
```

### Building and Linting
```bash
pnpm build            # TypeScript compilation + Vite build
pnpm lint             # Runs both ESLint and TypeScript checks
pnpm lint:eslint      # ESLint only
pnpm lint:tsc         # TypeScript compiler check only
```

## Architecture

### Data Flow
- **Backend**: Express server (`server.js`) serves a REST API and uses JSON file storage (`src/__mocks__/response/realEvents.json` for dev, `e2e.json` for E2E tests)
- **Frontend**: React SPA communicates with backend via fetch API
- **State Management**: Custom hooks manage state locally (no Redux/Zustand)

### Core Hooks (Custom State Management)
Located in `src/hooks/`:

- `useEventOperations.ts` - CRUD operations for events, communicates with API
- `useEventForm.ts` - Form state and validation for event creation/editing
- `useCalendarView.ts` - Calendar navigation, view switching (week/month), and holiday fetching
- `useNotifications.ts` - Notification system for upcoming events
- `useSearch.ts` - Event search and filtering
- `useRecurringEventOperations.ts` - Special handling for recurring event edits/deletes

### Key Utilities
Located in `src/utils/`:

- `generateRepeatEvents.ts` - Generates event instances for recurring patterns (daily, weekly, monthly, yearly)
- `eventOverlap.ts` - Detects time conflicts between events
- `dateUtils.ts` - Date formatting and calendar calculations
- `timeValidation.ts` - Start/end time validation
- `notificationUtils.ts` - Notification timing calculations

### Type System
`src/types.ts` defines core types:
- `Event` - Complete event with ID
- `EventForm` - Event data without ID
- `RepeatInfo` - Recurring event configuration
- `RepeatType` - 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

### API Endpoints (server.js)
- `GET /api/events` - Fetch all events
- `POST /api/events` - Create single event
- `PUT /api/events/:id` - Update single event
- `DELETE /api/events/:id` - Delete single event
- `POST /api/events-list` - Create multiple events (recurring)
- `PUT /api/events-list` - Update multiple events
- `DELETE /api/events-list` - Delete multiple events by IDs
- `PUT /api/recurring-events/:repeatId` - Update all events in recurring series
- `DELETE /api/recurring-events/:repeatId` - Delete all events in recurring series

### Recurring Events
Recurring events are stored as separate event instances sharing a `repeat.id`. When editing/deleting:
- User chooses "single instance" or "all instances"
- Single: modifies one event
- All: uses `/api/recurring-events/:repeatId` endpoints

## Testing Structure

Tests are organized by type in `src/__tests__/`:
- `unit/` - Pure function tests (utils)
- `hooks/` - Custom hook tests
- `components/` - Component tests
- `integration/` - Full workflow tests
- `edge-cases/` - Edge case scenarios
- `regression/` - Regression tests

Test files follow naming convention: `{difficulty}.{name}.spec.ts(x)` (e.g., `easy.dateUtils.spec.ts`)

## Important Patterns

### Event Creation Flow
1. User fills form in `App.tsx`
2. For recurring events: `generateRepeatEvents()` creates instances
3. `useEventOperations.createRepeatEvent()` or `saveEvent()` sends to API
4. Server assigns IDs (including shared `repeat.id` for recurring)
5. UI refreshes from server

### Overlap Detection
Before saving, `findOverlappingEvents()` checks conflicts. If found, user sees dialog to confirm or cancel.

### Notification System
`useNotifications.ts` polls every minute, checking if any event's notification time threshold is crossed (based on `notificationTime` field: 1, 10, 60, 120, or 1440 minutes before event).

### Calendar Views
- **Month View**: Shows full month grid with dates
- **Week View**: Shows 7-day row for current week
- Both views filter and display events using `filteredEvents` from `useSearch`

## Vite Configuration

Vite proxies `/api` requests to `http://localhost:3000` (Express server). Tests use jsdom environment with `src/setupTests.ts` for global test configuration.
