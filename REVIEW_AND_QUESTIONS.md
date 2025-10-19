# Plan Review & Clarifying Questions

## 📋 Review Status: COMPLETE (Reviewed 2x)

I've reviewed the entire plan twice to assess coverage of your additional requirements.

---

## ✅ What's Already Covered

### 1. **Adjustable Date Range for Upcoming Bills**
**Status:** ✅ PARTIALLY COVERED

**Current Plan:**
- Dashboard shows upcoming bills with configurable time horizon (7/14/30 days)
- User settings allow choosing the look-ahead period
- Safe-to-spend calculator uses this setting

**Location in Docs:**
- `CLAUDE_BUILD_PROMPT.md` → Dashboard → Upcoming Bills Section
- `PROJECT_PLAN.md` → Safe-to-Spend Calculator → Settings

**What's Missing:**
- Not clear if this is adjustable ON-THE-FLY (like a slider/dropdown on the dashboard itself)
- Only mentions preset options (7/14/30 days), not a custom range picker
- No date range filter on the payments list page

**Needs Enhancement:** ⚠️ YES

---

### 2. **Adjustable Time Zone**
**Status:** ⚠️ MINIMALLY COVERED

**Current Plan:**
- User settings include timezone in JSONB field
- Mentioned in: `CLAUDE_BUILD_PROMPT.md` → USERS table → `settings (JSONB - timezone, currency, preferences)`

**What's Missing:**
- No explicit requirement for timezone selection UI
- No specification for how dates are displayed (user timezone vs. UTC)
- No guidance on handling due dates across timezones
- Scheduler jobs (cron) timezone not specified

**Needs Enhancement:** ⚠️ YES (Critical for international use or travel)

---

### 3. **Adjustable Details with Options Menu**
**Status:** ⚠️ VAGUE / NOT EXPLICIT

**Current Plan:**
- General mention of user settings page
- Filter/sort options on payment list

**What's Missing:**
- Not clear what "adjustable details" means - need clarification
- No specification for which details should be configurable
- No UI mockup for "options menu"

**Needs Clarification:** ❓ WHAT SPECIFICALLY?

**Possible Interpretations:**
- A. Dashboard widget customization (show/hide certain cards)?
- B. Table column visibility (show/hide columns in payment list)?
- C. Notification preferences (what alerts to show)?
- D. Display density (compact vs. comfortable view)?
- E. All of the above?

---

### 4. **Spending Planning / What-If Scenarios**
**Status:** ❌ NOT COVERED

**Current Plan:**
- Safe-to-spend calculator shows available money
- Does NOT include what-if scenario planning

**What's Missing:**
- No feature for "If I spend $X, how much will I have left?"
- No projection of future balance
- No income tracking (needed for "before next paycheck" calculation)

**Example Needed Feature:**
```
What-If Spending Calculator:
┌────────────────────────────────────┐
│ Current Safe to Spend: $1,847     │
│                                    │
│ If I spend: [$500]                 │
│                                    │
│ I will have: $1,347 remaining      │
│                                    │
│ Next income: Feb 15 (+$2,500)      │
│ After bills due: $847 remaining    │
│                                    │
│ ⚠️ Warning: $200 below comfort     │
│    threshold                       │
└────────────────────────────────────┘
```

**Needs Addition:** ❌ YES (New Feature)

---

### 5. **Multiple Income Streams**
**Status:** ❌ NOT COVERED

**Current Plan:**
- Only tracks money going OUT (bills, payments)
- Does NOT track money coming IN (income, paychecks, deposits)

**What's Missing:**
- No income tracking table
- No "expected income" feature
- No "next paycheck" calculation
- No recurring income support
- Safe-to-spend calculator doesn't factor in upcoming income

**Example Needed Feature:**
```
INCOME_STREAMS table:
- id
- user_id
- source_name (e.g., "Primary Job", "Freelance", "Rental Income")
- amount
- frequency (weekly, biweekly, monthly, etc.)
- next_payment_date
- to_account_id (which account receives it)
- is_recurring
- notes

Dashboard widget:
┌────────────────────────────────────┐
│ UPCOMING INCOME                    │
│                                    │
│ Feb 15 - Primary Job: $2,500       │
│ Feb 20 - Freelance: $800           │
│ Feb 28 - Rental Income: $1,200     │
│                                    │
│ Total next 30 days: $4,500         │
└────────────────────────────────────┘
```

**Needs Addition:** ❌ YES (New Feature)

---

### 6. **Claude Context Window Handling**
**Status:** ⚠️ NOT EXPLICITLY ADDRESSED

**Current Plan:**
- Documentation is split into multiple files
- Build prompt is comprehensive (~25 KB)
- No specific guidance for Claude on handling context windows

**What's Missing:**
- No instruction in prompt about breaking work into phases if context limit reached
- No guidance on maintaining state across context windows
- No priority order if Claude needs to stop/resume

**Recommendation:**
Add to build prompt:
```
CONTEXT WINDOW INSTRUCTIONS:
If you reach context limits during implementation:
1. Prioritize in this order:
   - Core database schema and migrations
   - Backend authentication and API structure
   - Frontend routing and auth
   - Payment management features
   - Dashboard and safe-to-spend calculator
   - Remaining features
   
2. When resuming in new context:
   - State what you've completed
   - Confirm the approach before continuing
   - Ask for any clarifications needed
   
3. Create a PROGRESS.md file tracking:
   - Completed files
   - Pending files
   - Known issues or decisions needed
```

**Needs Addition:** ⚠️ YES (Enhancement to prompt)

---

## 📊 Coverage Summary

| Feature | Status | Priority | Effort |
|---------|--------|----------|--------|
| Adjustable date range | ⚠️ Partial | HIGH | Small |
| Adjustable timezone | ⚠️ Minimal | MEDIUM | Medium |
| Adjustable details/options | ❓ Unclear | UNKNOWN | Unknown |
| Spending planning (what-if) | ❌ Missing | HIGH | Medium |
| Multiple income streams | ❌ Missing | HIGH | Medium |
| Context window handling | ⚠️ Not addressed | MEDIUM | Small |

---

## ❓ CLARIFYING QUESTIONS

### Question 1: Adjustable Date Range
**How flexible should the date range be?**

A. Preset options only (7, 14, 30, 60, 90 days) - Easier
B. Custom date range picker (any start/end date) - More flexible
C. Quick toggle on dashboard (switch without going to settings) - Most convenient
D. All of the above

**My Recommendation:** C + A (Quick toggle with presets)

---

### Question 2: Adjustable Details with Options Menu
**What specifically do you mean by "adjustable details"?**

Please clarify which of these you want:

A. **Dashboard Customization**
   - Show/hide dashboard widgets (upcoming bills, recent activity, accounts)?
   - Reorder widgets (drag and drop)?
   - Customize widget size?

B. **Table/List Customization**
   - Show/hide columns in payment lists?
   - Custom sort preferences?
   - Rows per page?

C. **Display Preferences**
   - Compact vs. comfortable layout?
   - Color scheme (light/dark mode)?
   - Font size?

D. **Notification Preferences**
   - Which alerts to show on dashboard?
   - Email notification settings (Phase 2)?
   - Reminder frequencies?

E. **Data Visibility**
   - Show/hide certain payment types?
   - Filter by default (e.g., only show unpaid)?
   - Default calendar view (month/week/day)?

F. **Something else?** (Please describe)

---

### Question 3: Spending Planning Feature
**How detailed should the what-if spending calculator be?**

**Scenario A: Simple**
```
Input: Amount I want to spend
Output: Remaining safe-to-spend amount
```

**Scenario B: With Next Income**
```
Input: Amount I want to spend
Output: 
- Remaining safe-to-spend
- Balance after next paycheck
- Balance after upcoming bills
```

**Scenario C: Advanced**
```
Input: 
- Amount I want to spend
- Date of planned spending
- Which account to spend from

Output:
- Current safe-to-spend
- Safe-to-spend after this purchase
- Projection to next paycheck
- Impact on bill payments
- Warning if it puts you below threshold
- Suggestion: "Wait until Feb 15 (payday)"
```

**My Recommendation:** Start with B, add C in Phase 2

**Also:**
- Should this be a separate page/tool or integrated into dashboard?
- Should it show multiple "what-if" scenarios side-by-side?
- Should it save "planned purchases" for future reference?

---

### Question 4: Multiple Income Streams
**What income tracking features do you need?**

**Must-Have:**
- [ ] Track different income sources (job, freelance, etc.)
- [ ] Recurring income (auto-generate like bills)
- [ ] Next expected income date and amount
- [ ] Which account receives the income
- [ ] Show upcoming income on dashboard

**Nice-to-Have:**
- [ ] Income history (track all received income)
- [ ] Mark income as "received" when it arrives
- [ ] Variable income (amount changes each time)
- [ ] Income categories (wages, dividends, gifts, etc.)
- [ ] Tax withholding tracking
- [ ] Year-to-date income totals
- [ ] Income vs. expenses reports

**Questions:**
1. Do your income amounts vary, or are they consistent?
2. Do you need to track partial income (like tips, which vary daily)?
3. Should income reduce "safe-to-spend" reserved amounts automatically?
4. Do you need income reminders (like "paycheck should arrive today")?

---

### Question 5: Time Zone Handling
**How important is timezone customization?**

**Options:**

A. **Simple (Server timezone only)**
   - All dates stored and displayed in one timezone
   - Easiest implementation

B. **User timezone preference**
   - User sets their timezone in settings
   - All dates displayed in their timezone
   - Scheduled tasks still run on server time

C. **Full timezone support**
   - User timezone per session (detects from browser)
   - Can change timezone temporarily (traveling)
   - Due dates respect timezone (midnight in user's zone)

**My Recommendation:** B for Phase 1, C for Phase 2

**Questions:**
1. Do you travel across timezones frequently?
2. Will multiple users be in different timezones?
3. Is it okay if scheduled tasks (missed payment checks) run at server midnight?

---

### Question 6: Context Window Strategy
**How should Claude handle context window limits?**

**Option A: Build in phases with explicit stops**
- Build core features first
- Stop and ask you to create new conversation
- You provide progress summary, continue

**Option B: Build everything, auto-resume if needed**
- Claude attempts to build all at once
- If context limit hit, provides summary of what's done
- You start new conversation with summary

**Option C: Modular approach**
- Break into clear modules (auth, payments, dashboard, etc.)
- Build one module at a time
- Test each module before proceeding

**My Recommendation:** C (Safest, most testable)

**Should I update the build prompt to include:**
- [ ] Explicit phase breakdown with stopping points?
- [ ] Progress tracking template?
- [ ] Instructions for resuming in new context?
- [ ] Priority order if everything can't fit?

---

## 🎯 Recommended Actions

### Immediate Updates Needed (Before Building)

#### 1. **Add Income Tracking Feature**
**Priority:** HIGH  
**Why:** Required for "before next paycheck" calculation in spending planner

**Changes Needed:**
- Add INCOME_STREAMS table to database schema
- Add income management UI (create, edit, view income sources)
- Add "Upcoming Income" section to dashboard
- Update safe-to-spend calculator to factor in near-term income (optional)
- Add recurring income auto-generation (like recurring bills)

**Estimated Addition to Build:** +30 minutes, +5 files

---

#### 2. **Add Spending Planning / What-If Calculator**
**Priority:** HIGH  
**Why:** Core requested feature

**Changes Needed:**
- Add spending calculator widget to dashboard
- Input: Amount to spend
- Output: Resulting safe-to-spend, balance until next income
- Consider upcoming bills and income
- Show warnings if spending would put you below threshold

**Estimated Addition to Build:** +20 minutes, +3 files

---

#### 3. **Enhance Date Range Flexibility**
**Priority:** MEDIUM  
**Why:** Improves usability

**Changes Needed:**
- Add quick date range toggle to dashboard (7/14/30/60/90 days)
- Add custom date range filter to payment list page
- Save preference per user
- Update calendar to respect selected range

**Estimated Addition to Build:** +15 minutes, +2 files

---

#### 4. **Clarify and Add Adjustable Details**
**Priority:** MEDIUM (pending your clarification)  
**Why:** User experience enhancement

**Depends on your answer to Question 2 above**

---

#### 5. **Add Timezone Support**
**Priority:** MEDIUM  
**Why:** Important for accuracy

**Changes Needed:**
- Add timezone selector in user settings
- Display all dates in user's timezone
- Store dates in UTC in database
- Convert for display based on user preference
- Add timezone to user profile

**Estimated Addition to Build:** +20 minutes, +2 files

---

#### 6. **Add Context Window Handling to Prompt**
**Priority:** LOW (preventative)  
**Why:** Helps Claude manage large builds

**Changes Needed:**
- Add section to build prompt with instructions
- Define priority order for features
- Include progress tracking template
- Add resume instructions

**Estimated Addition to Build:** +5 minutes (just prompt updates)

---

## 📝 Summary of Gaps

### Critical Missing Features (Needed for your requirements):
1. ❌ **Income tracking** (multiple streams)
2. ❌ **Spending planning calculator** (what-if scenarios)

### Important Enhancements (Improve usability):
3. ⚠️ **Flexible date range selection** (needs improvement)
4. ⚠️ **Timezone support** (needs explicit specification)
5. ❓ **Adjustable details/options menu** (needs your clarification)

### Good-to-Have:
6. ⚠️ **Context window handling** (helps Claude build successfully)

---

## ✅ Next Steps

**Please answer the 6 clarifying questions above**, then I will:

1. Update `CLAUDE_BUILD_PROMPT.md` with:
   - Income tracking feature
   - Spending planning calculator
   - Enhanced date range flexibility
   - Timezone support
   - Your specified "adjustable details" options
   - Context window handling instructions

2. Update `PROJECT_PLAN.md` with:
   - New database tables (INCOME_STREAMS)
   - New features documentation
   - UI mockups for new features

3. Update `SYSTEM_OVERVIEW.md` with:
   - Income tracking architecture
   - What-if calculator logic
   - Updated data flows

4. Commit all updates to Github

5. Provide you with an updated, comprehensive build prompt

---

## 🤔 My Recommendations (If You Want Quick Decisions)

If you want me to proceed with reasonable defaults without waiting for all answers:

**Income Tracking:** 
- Add basic income tracking with recurring support
- Show on dashboard
- Include in what-if calculator

**Spending Planning:**
- Add "What-If Calculator" widget to dashboard
- Show: spending amount → remaining safe-to-spend → balance until next income
- Include warnings

**Date Range:**
- Quick toggle on dashboard (7/14/30/60/90 days)
- Saves preference
- Also affects safe-to-spend calculation

**Timezone:**
- User sets in settings
- All dates displayed in their timezone
- Stored as UTC in database

**Adjustable Details:**
- Dashboard widget show/hide toggles
- Table column visibility
- Display density (compact/comfortable)
- Default filters (show only unpaid, etc.)

**Context Windows:**
- Add phased approach instructions to prompt
- Priority: Database → Backend → Frontend → Features

**Should I proceed with these defaults, or do you want to review the questions first?**

---

**Waiting for your responses to proceed with updates!** 🚀


