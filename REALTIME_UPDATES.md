# Real-Time Dashboard Updates

## Overview
Enhanced the Dashboard to automatically refresh data and provide manual refresh capability, ensuring users always see the most up-to-date information about their commissions and invoices.

## Features Implemented

### 1. Auto-Refresh (Every 30 seconds)
The dashboard automatically fetches fresh data from the backend every 30 seconds when the user is authenticated.

```typescript
useEffect(() => {
  if (!isAuthenticated) return;

  const interval = setInterval(() => {
    refetchCommissions();
    refetchInvoices();
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
}, [isAuthenticated, refetchCommissions, refetchInvoices]);
```

### 2. Manual Refresh Button
Added a "Refresh" button in the dashboard header that allows users to manually trigger a data refresh at any time.

**Features:**
- Animated spinning icon during loading
- Disabled state while loading to prevent multiple simultaneous requests
- Hover effects for better UX
- Tooltip for clarity

### 3. Refetch Capability
Leveraged the `refetch` function from the `useApi` hook to enable on-demand data refreshing without page reload.

## Changes Made

### File: [`frontend/src/pages/Dashboard.tsx`](frontend/src/pages/Dashboard.tsx)

**Lines 1-38: Enhanced Imports and Data Fetching**
```typescript
import React, { useEffect } from 'react';

// Destructure refetch functions from useApi
const { data: commissionsData, loading: commissionsLoading, refetch: refetchCommissions } = useApi<PaginatedResponse<Commission>>(
  '/commissions/',
  { immediate: isAuthenticated }
);
const { data: invoicesData, loading: invoicesLoading, refetch: refetchInvoices } = useApi<PaginatedResponse<Invoice>>(
  '/invoices/',
  { immediate: isAuthenticated }
);

// Auto-refresh setup
useEffect(() => {
  if (!isAuthenticated) return;
  const interval = setInterval(() => {
    refetchCommissions();
    refetchInvoices();
  }, 30000);
  return () => clearInterval(interval);
}, [isAuthenticated, refetchCommissions, refetchInvoices]);

// Manual refresh handler
const handleRefresh = () => {
  refetchCommissions();
  refetchInvoices();
};
```

**Lines 63-90: Enhanced Header with Refresh Button**
```typescript
<div className="mb-8 flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-2">
      Welcome back, {user?.first_name}!
    </h1>
    <p className="text-gray-600">
      {user?.role === 'DESIGNER'
        ? 'Manage your commissions and track project progress'
        : 'View your active projects and invoices'}
    </p>
  </div>
  <button
    onClick={handleRefresh}
    disabled={commissionsLoading || invoicesLoading}
    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
    title="Refresh dashboard data"
  >
    <svg 
      className={`w-5 h-5 ${(commissionsLoading || invoicesLoading) ? 'animate-spin' : ''}`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
    Refresh
  </button>
</div>
```

## User Experience

### Auto-Refresh Behavior
- **Frequency**: Every 30 seconds
- **Condition**: Only when user is authenticated
- **Cleanup**: Interval is cleared when component unmounts or user logs out
- **Silent**: Happens in the background without disrupting user interaction

### Manual Refresh
- **Location**: Top-right of dashboard header
- **Visual Feedback**: 
  - Spinning icon during loading
  - Button disabled during loading
  - Hover effect when enabled
- **Accessibility**: Includes tooltip for screen readers

## Benefits

1. **Real-Time Data**: Users see updated commissions and invoices without manual page refresh
2. **Better UX**: No need to reload the entire page to see changes
3. **Responsive**: Changes made elsewhere (e.g., accepting a commission) appear automatically
4. **User Control**: Manual refresh button for immediate updates when needed
5. **Performance**: Only fetches data, doesn't reload entire application

## Use Cases

### Scenario 1: Designer Creates Commission
1. Designer creates a new commission
2. Within 30 seconds (or on manual refresh), the commission appears in dashboard
3. Stats update automatically (Total Commissions count increases)

### Scenario 2: Artisan Accepts Commission
1. Artisan accepts a pending commission
2. Dashboard auto-refreshes within 30 seconds
3. Commission status changes from "pending" to "accepted"
4. "In Progress" count updates

### Scenario 3: Invoice Payment
1. Designer marks invoice as paid
2. Artisan's dashboard refreshes automatically
3. Invoice status updates to "paid"
4. "Pending Invoices" count decreases

## Configuration

### Adjust Refresh Interval
To change the auto-refresh frequency, modify the interval value:

```typescript
const interval = setInterval(() => {
  refetchCommissions();
  refetchInvoices();
}, 30000); // Change this value (in milliseconds)
```

**Recommended values:**
- 15000 (15 seconds) - For high-activity environments
- 30000 (30 seconds) - Default, balanced approach
- 60000 (60 seconds) - For low-activity or bandwidth-constrained environments

### Disable Auto-Refresh
To disable auto-refresh (keep only manual refresh):

```typescript
// Comment out or remove the useEffect hook
/*
useEffect(() => {
  if (!isAuthenticated) return;
  const interval = setInterval(() => {
    refetchCommissions();
    refetchInvoices();
  }, 30000);
  return () => clearInterval(interval);
}, [isAuthenticated, refetchCommissions, refetchInvoices]);
*/
```

## Future Enhancements

### Potential Improvements:
1. **WebSocket Integration**: Real-time push updates instead of polling
2. **Smart Refresh**: Only refresh when data actually changes (using ETags or timestamps)
3. **Selective Refresh**: Refresh only commissions or invoices based on user action
4. **Notification System**: Show toast notifications when new data arrives
5. **Last Updated Timestamp**: Display when data was last refreshed
6. **Configurable Interval**: Allow users to set their preferred refresh rate

## Testing

### Manual Testing Steps:
1. **Auto-Refresh Test**:
   - Open dashboard
   - Create a commission in another tab/browser
   - Wait 30 seconds
   - Verify new commission appears

2. **Manual Refresh Test**:
   - Open dashboard
   - Create a commission in another tab
   - Click "Refresh" button immediately
   - Verify new commission appears instantly

3. **Loading State Test**:
   - Click "Refresh" button
   - Verify button shows spinning icon
   - Verify button is disabled during loading
   - Verify button re-enables after loading

4. **Logout Test**:
   - Open dashboard (auto-refresh active)
   - Logout
   - Verify auto-refresh stops (no console errors)

## Performance Considerations

- **Network Usage**: Auto-refresh makes API calls every 30 seconds
- **Server Load**: Consider server capacity when setting refresh interval
- **Battery Impact**: Frequent refreshes may impact mobile device battery
- **Data Usage**: Important for users on metered connections

## Related Files
- [`frontend/src/pages/Dashboard.tsx`](frontend/src/pages/Dashboard.tsx) - Main dashboard component
- [`frontend/src/hooks/useApi.ts`](frontend/src/hooks/useApi.ts) - API hook with refetch capability
- [`backend/apps/commissions/views.py`](backend/apps/commissions/views.py) - Commissions API
- [`backend/apps/invoices/views.py`](backend/apps/invoices/views.py) - Invoices API

---
*Implemented on: 2026-05-03*
*Made with Bob*