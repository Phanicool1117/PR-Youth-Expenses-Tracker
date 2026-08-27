# PR Youth — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** 27 August 2026  
**Product:** PR Youth  
**Product Type:** Committee Donation & Expense Tracking Web App

---

## 1. Product Overview

PR Youth is a mobile-first web application for the **Penumuli Perantalamma Youth Team** to manage two core financial activities:

1. **Donation Collection** — committee members record donations they receive.
2. **Expense Tracking** — committee members record expenses they personally pay.

The application will provide separate member and admin experiences. Committee members will log in using individual credentials and manage only their own entries. The administrator will have a complete view of all members, donations, expenses, totals, and activity.

**Google Sheets** will act as the primary data store, while **Google Apps Script** will provide the backend/API layer connecting the web application to Google Sheets.

---

## 2. Product Goals

### Primary Goals

- Make donation and expense entry fast and simple on mobile.
- Give every committee member an individual login.
- Automatically associate each entry with the logged-in member.
- Prevent members from viewing other members' financial entries.
- Give the admin a complete financial overview.
- Maintain Google Sheets as the central source of truth.
- Allow the admin to add members directly in Google Sheets without redeploying the website.
- Automatically calculate donation, expense, member, category, and payment-method totals.
- Maintain reliable timestamps and an audit trail.

### Non-Goals

- No online payment collection.
- No payment gateway integration.
- No public donation portal.
- No member-to-member messaging.
- No unnecessary transaction ID displayed or stored in the main transaction sheets.
- No requirement for a separate database such as Firebase/Supabase unless a future scalability/security requirement makes it necessary.

---

## 3. User Roles

### 3.1 Admin

The admin has full access.

Admin can:

- Log in to the admin panel.
- View overall financial dashboard.
- View all donations.
- View all expenses.
- View all member activity.
- View member-level financial summaries.
- View donation payment-method breakdowns.
- View expense category breakdowns.
- Search and filter records.
- Add/manage members through Google Sheets.
- Activate or deactivate member accounts.
- Review recent activity.

### 3.2 Youth Member

Each committee member receives an individual account.

Member can:

- Log in with their own credentials.
- Add donation/collection records.
- Add expense records.
- View their own recent activity.
- View their own donation total.
- View their own expense total.
- View their own donation count.

Member cannot:

- View other members' records.
- Access the admin dashboard.
- Change their Member ID.
- Change the automatically assigned "Paid By" value.
- Manage other members.

---

# 4. Authentication

## 4.1 Example Accounts

### Admin

- Admin ID: `ADM000`

### Member

- Member ID: `PRY001`
- Name: `Phani`
- Example password: `001`

Additional members follow the same ID structure:

- `PRY002`
- `PRY003`
- `PRY004`
- etc.

Passwords must **not be stored as plain text in production**. Use secure password hashing or an equivalent secure authentication mechanism in the Apps Script/backend layer.

## 4.2 Login Flow

1. User opens PR Youth.
2. User enters username/member ID and password.
3. Backend validates the account.
4. Backend checks whether the account is active.
5. User is assigned the correct role.
6. Member → Member Dashboard.
7. Admin → Admin Dashboard.
8. Unauthorized requests are rejected server-side.

Authentication must not rely only on frontend checks.

---

# 5. Information Architecture

## Member Portal

- Dashboard
- Donation Note
- Expenses Tracker
- Recent Activity
- Profile/Account

## Admin Portal

- Dashboard
- Members
- Donations
- Expenses
- Activity
- Reports/Overview

---

# 6. Member Dashboard

The member dashboard should be simple and mobile-first.

### Summary Cards

- Total Donations
- Number of Donations
- Total Expenses

### Quick Actions

- `+ Add Donation`
- `+ Add Expense`

### Recent Activity

Show the member's latest donation and expense entries.

Each activity item should display:

- Type
- Amount
- Date
- Payment method
- Category, when applicable
- Note
- Timestamp

Only the logged-in member's records should be returned.

---

# 7. Donation Note

The Donation Note is used when a committee member receives a donation.

## Add Donation Fields

### Required

- Donor Name
- Amount
- Date
- Payment Method

### Optional

- Note

### Payment Methods

- Cash
- UPI
- Other

### Important Rules

- No Purpose field.
- Donation purpose is assumed to be Ganapati-related.
- Member ID is automatically taken from the logged-in account.
- Member Name is automatically taken from the logged-in account.
- Type is automatically set to `Donation`.
- Timestamp is generated automatically by the backend/server.
- Amount must be a valid positive number.
- Date cannot be invalid.
- Member cannot impersonate another member.

---

# 8. Expenses Tracker

The Expenses Tracker records expenses paid by committee members.

## Add Expense Field Order

The form must follow this visual order:

1. **Amount**
2. **Date**
3. **Paid By**
4. **Category**
5. **Note**

### Amount

Amount must be the visually dominant field because it is the most important piece of information when entering an expense.

### Date

Allow the member to select the date on which the expense occurred.

### Paid By

Automatically populated using the logged-in member.

Example:

`Paid By: Phani`

The member cannot change this value.

### Categories

Use these categories:

- Travel Expenses
- Crackers Expenses
- Lights Expenses
- Banner Expenses
- Decoration Expenses
- Pooja Expenses
- DJ Expenses
- Prasadam Expenses
- Other Expenses

The category list should be configurable in the future.

### Note

Free-text description of what was purchased/spent.

Example:

`Flowers and decoration material`

### Automatic Fields

- Member ID
- Member Name
- Type = `Expenses`
- Timestamp

---

# 9. Recent Activity

Members should see their own recently added records.

Example:

**₹2,500 — Expenses**  
Decoration Expenses  
27 Aug 2026 · 3:42 PM  
Flowers and decoration material

or

**₹5,000 — Donation**  
UPI  
27 Aug 2026 · 10:32 AM  
Donor: Ravi

Activity should be sorted newest first.

---

# 10. Admin Dashboard

The Admin Dashboard provides the complete financial overview.

## Primary Metrics

### Total Donations

Sum of all donation records.

### Total Expenses

Sum of all expense records.

### Current Balance

`Total Donations - Total Expenses`

### Donation Payment Breakdown

Display:

- Total Cash Donations
- Total UPI Donations
- Total Other Donations

### Expense Category Breakdown

Display total expenses by category.

Examples:

- Travel
- Crackers
- Lights
- Banner
- Decoration
- Pooja
- DJ
- Prasadam
- Other

### Recent Activity

Display the latest activity across all members.

---

# 11. Admin Members Section

The Members section must provide a member-level financial summary.

## Required Columns

| Field | Description |
|---|---|
| Member ID | Unique committee member ID |
| Name | Member name |
| Total Donations | Total donation amount collected by member |
| No. of Donations | Number of donation records |
| Total Expenses | Total expenses paid by member |
| Last Activity | Latest donation or expense timestamp |

## Donation Breakdown

Under **Total Donations**, show the payment-method breakdown.

Example:

**₹25,000**

Cash: ₹10,000  
UPI: ₹15,000

The admin should be able to immediately understand how much each member collected through Cash vs UPI.

## Mobile Member Card

On mobile, the same information should be displayed as a card instead of forcing a wide table.

Example:

**PRY001 · Phani**

**Donations**  
₹25,000  
Cash ₹10,000 · UPI ₹15,000

**8 Donations**

**Expenses**  
₹7,500

**Last Activity**  
27 Aug 2026 · 3:42 PM

---

# 12. Admin Donations

Admin can view every donation.

## Table Fields

- Member ID
- Member Name
- Type
- Payment Method
- Timestamp
- Amount
- Note

For donations, the Note can contain donor-related information if needed.

Example:

| Member ID | Member Name | Type | Payment Method | Timestamp | Amount | Note |
|---|---|---|---|---|---:|---|
| PRY001 | Phani | Donation | UPI | 27 Aug 2026 10:32 AM | ₹5,000 | Ravi |

Admin should be able to:

- Search
- Filter by member
- Filter by payment method
- Filter by date
- Sort by amount/date
- View totals

---

# 13. Admin Expenses

Admin can view every expense.

## Table Fields

- Member ID
- Member Name
- Type
- Payment Method
- Timestamp
- Amount
- Category
- Note

Example:

| Member ID | Member Name | Type | Payment Method | Timestamp | Amount | Category | Note |
|---|---|---|---|---|---:|---|---|
| PRY001 | Phani | Expenses | Cash | 27 Aug 2026 12:15 PM | ₹2,500 | Decoration Expenses | Flowers |

Admin should be able to:

- Search
- Filter by member
- Filter by category
- Filter by payment method
- Filter by date
- Sort by amount/date
- View totals

---

# 14. Google Sheets Architecture

Google Sheets is the primary data store.

Use a single Google Spreadsheet with the following tabs.

## 14.1 Members

Recommended columns:

| Member ID | Name | Username | Password Hash | Role | Active |
|---|---|---|---|---|---|
| ADM000 | Admin | admin | secure hash | Admin | TRUE |
| PRY001 | Phani | phani | secure hash | Member | TRUE |

### Member Management Requirement

Admin should be able to add a new member directly to the `Members` Google Sheet.

Example:

`PRY002 | Ravi | ravi | secure hash | Member | TRUE`

The website must automatically recognize newly added members without requiring:

- Code changes
- Website redeployment
- Manual database synchronization

The backend should read the current `Members` sheet when authenticating users or refresh its member configuration safely.

Setting `Active` to `FALSE` must prevent the member from logging in.

---

# 15. Donations Sheet

Tab name:

`Donations`

Columns:

| Member ID | Member Name | Type | Payment Method | Timestamp | Amount | Note |
|---|---|---|---|---|---:|---|

`Type` should always be:

`Donation`

No Transaction ID column.

---

# 16. Expenses Sheet

Tab name:

`Expenses`

Columns:

| Member ID | Member Name | Type | Payment Method | Timestamp | Amount | Category | Note |
|---|---|---|---|---|---:|---|---|

`Type` should always be:

`Expenses`

No Transaction ID column.

Although the general transaction format does not require Category, the Expenses sheet must contain Category so the admin can generate category-wise expense reports.

---

# 17. Categories Sheet

Tab name:

`Categories`

Recommended columns:

| Category | Active |
|---|---|
| Travel Expenses | TRUE |
| Crackers Expenses | TRUE |
| Lights Expenses | TRUE |
| Banner Expenses | TRUE |
| Decoration Expenses | TRUE |
| Pooja Expenses | TRUE |
| DJ Expenses | TRUE |
| Prasadam Expenses | TRUE |
| Other Expenses | TRUE |

This makes categories maintainable without changing application code.

---

# 18. Audit Log

Tab name:

`Audit_Log`

Recommended columns:

| Timestamp | User ID | User Name | Action | Record Type | Details |
|---|---|---|---|---|---|

Examples:

- Member added
- Donation submitted
- Expense submitted
- Account deactivated
- Admin action

The audit log should not expose sensitive authentication information.

---

# 19. Google Apps Script Backend

Google Apps Script will act as the backend/API layer.

Required operations:

- `login`
- `getMemberDashboard`
- `addDonation`
- `addExpense`
- `getMyActivity`
- `getAdminDashboard`
- `getAllDonations`
- `getAllExpenses`
- `getMembers`
- `getCategories`
- `validateMember`

All important permission checks must happen server-side.

---

# 20. Data Rules

## Automatic Values

The following values must never be manually entered by members:

- Member ID
- Member Name
- Type
- Paid By
- Timestamp

They are derived from the authenticated session and/or backend.

## Amount Validation

- Must be numeric.
- Must be greater than zero.
- Currency display should use Indian Rupees (₹).
- Store the numeric amount in Google Sheets.

## Timestamp

Timestamp must be generated by the backend/server.

Do not depend on the user's device clock.

## Date

Store a consistent date format and use the configured India timezone.

Recommended timezone:

`Asia/Kolkata`

---

# 21. Security Requirements

- Never expose Google Apps Script secrets in frontend source code.
- Never expose Google Sheet credentials/API keys in the browser.
- Never store production passwords as plain text.
- Validate authentication server-side.
- Validate authorization server-side.
- A member request must use the authenticated member identity rather than trusting a Member ID supplied by the browser.
- Members must only receive their own records.
- Admin endpoints must reject normal member accounts.
- Sanitize user-provided notes.
- Validate all amounts and dates.
- Prevent unauthorized direct API access as far as the Apps Script architecture permits.
- Do not include passwords or password hashes in normal dashboard responses.

---

# 22. UI/UX Requirements

## Design Direction

PR Youth should feel:

- Clean
- Modern
- Trustworthy
- Simple
- Fast
- Mobile-first
- Suitable for a local youth committee

Avoid making the application look like a complicated enterprise accounting system.

## Mobile First

Most members will likely use smartphones.

Prioritize:

- Large touch targets
- Simple forms
- Minimal typing
- Clear amount input
- Bottom navigation or compact navigation
- Responsive cards
- Fast loading
- Clear success/error states

## Amount Input

The amount field should be visually prominent.

Example:

`₹ 2,500`

Use proper numeric keyboard behavior on mobile.

## Feedback

After successful submission:

- Show a clear success state.
- Confirm what was added.
- Refresh the recent activity.
- Prevent accidental duplicate submissions.

---

# 23. Navigation

## Member

Suggested navigation:

`Dashboard | Donation Note | Expenses | Activity`

## Admin

Suggested navigation:

`Overview | Members | Donations | Expenses | Activity`

Logout should always be accessible.

---

# 24. Admin Filtering

Admin should be able to filter data by:

- Member
- Date/date range
- Transaction type
- Payment method
- Expense category

Admin should also be able to search notes/member names.

---

# 25. Calculations

## Total Donations

`SUM(all Donation Amounts)`

## Total Expenses

`SUM(all Expense Amounts)`

## Current Balance

`Total Donations - Total Expenses`

## Member Total Donations

`SUM(Donation Amount WHERE Member ID = selected member)`

## Member Donation Count

`COUNT(Donation records WHERE Member ID = selected member)`

## Member Cash Donations

`SUM(Donation Amount WHERE Member ID = selected member AND Payment Method = Cash)`

## Member UPI Donations

`SUM(Donation Amount WHERE Member ID = selected member AND Payment Method = UPI)`

## Member Total Expenses

`SUM(Expense Amount WHERE Member ID = selected member)`

## Last Activity

Latest timestamp across that member's donations and expenses.

---

# 26. Error Handling

The application must show clear messages for:

- Invalid login
- Inactive account
- Missing required field
- Invalid amount
- Invalid date
- Failed Google Sheets connection
- Apps Script error
- Unauthorized access
- Duplicate submission
- Session expiration

Do not show technical stack traces to normal users.

---

# 27. Empty States

If a member has no donations:

> No donations added yet.

If a member has no expenses:

> No expenses added yet.

If admin has no transactions:

> No transactions recorded yet.

---

# 28. Success Criteria

The product is considered complete when:

- Admin can log in using ADM000.
- Members can log in using their individual accounts.
- Members can add donations.
- Members can add expenses.
- Member identity is automatically attached to submissions.
- Members can see their own recent activity.
- Members cannot see another member's data.
- Admin can see all records.
- Admin can see member summaries.
- Donation Cash/UPI totals are calculated correctly.
- Donation count is calculated correctly.
- Expense totals are calculated correctly.
- Last Activity is calculated correctly.
- Current balance is calculated correctly.
- Data is written to Google Sheets.
- New members added to Google Sheets can access the website without redeployment.
- Deactivated members cannot log in.
- Backend timestamps are recorded consistently.
- Admin can filter and search records.
- The application works properly on mobile and desktop.

---

# 29. Example User Flow

## Member Donation

1. Phani logs in.
2. Opens `Donation Note`.
3. Enters:
   - Donor Name: Ravi
   - Amount: ₹5,000
   - Date: 27 Aug 2026
   - Payment Method: UPI
   - Note: Optional
4. Taps `Add Donation`.
5. Apps Script validates the request.
6. Backend automatically adds:
   - Member ID: PRY001
   - Member Name: Phani
   - Type: Donation
   - Timestamp: server timestamp
7. Record is written to Google Sheets.
8. Phani sees the entry in Recent Activity.

## Member Expense

1. Phani logs in.
2. Opens `Expenses Tracker`.
3. Enters:
   - Amount: ₹2,500
   - Date: 27 Aug 2026
   - Paid By: Phani (automatic)
   - Category: Decoration Expenses
   - Note: Flowers
4. Taps `Add Expense`.
5. Backend validates the request.
6. Record is written to Google Sheets.
7. Recent Activity updates.

## Admin

1. Admin logs in.
2. Opens Overview.
3. Sees total donations, expenses and balance.
4. Opens Members.
5. Sees Phani's:
   - Member ID
   - Name
   - Total Donations
   - Cash/UPI breakdown
   - Number of Donations
   - Total Expenses
   - Last Activity
6. Opens Donations or Expenses to inspect individual records.

---

# 30. Future Enhancements

These are intentionally outside Version 1:

- Receipt/bill image upload
- PDF financial reports
- Excel/CSV export
- WhatsApp sharing
- Monthly closing
- Expense approval workflow
- Donation receipt generation
- Multiple admin accounts
- Dashboard charts
- Backup/export automation
- Progressive Web App (PWA)
- Offline entry with synchronization

---

# 31. Product Principle

**PR Youth should make financial recording effortless for members and financial visibility effortless for the admin.**

The member experience should require only the minimum information needed to record a donation or expense, while the backend automatically handles identity, timestamps, calculations, permissions, and Google Sheets synchronization.
