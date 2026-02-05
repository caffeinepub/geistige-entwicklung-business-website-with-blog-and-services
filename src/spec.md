# Specification

## Summary
**Goal:** Add daily visitors analytics (visitor-only) and display it as a last-days bar chart in the Admin Analytics dashboard.

**Planned changes:**
- Extend the backend analytics model and admin analytics API response to include a daily visitors time series (stable calendar-day buckets derived from canister time) while excluding admin activity.
- Add frontend visitor tracking that increments the daily visitors counter at most once per browser per calendar day, using a safe localStorage-based marker with a fallback if storage is unavailable.
- Update the Admin Analytics UI to render a daily visitors bar chart from the new series, including human-readable date labels and a non-crashing empty state when no data exists.
- Update frontend query typing/data mapping so the new dailyVisitors field is fetched and consumed without TypeScript errors.

**User-visible outcome:** Admins can view a new “Daily Visitors (last days)” bar chart in the analytics dashboard, and public site visits are counted once per browser per day (excluding admin activity).
