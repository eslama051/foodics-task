# Restaurant Reservation Manager

## Setup

```bash
#rename .env.example to .env #to get access to envs (base url , token)
npm install
npm run dev
```


## Project Structure
```
src/
 views/ReservationsView.vue       # Main page
 stores/reservation.ts            # All the data and API logic
 components/
   dialogs/                     # Popups (edit, add, confirm)
   forms/                       # Input fields, selects
   ui/                          # Table, buttons, toasts
   layouts/AppHeader.vue        # Top bar
 composables/
   useApi.ts                    # Api requests
   useToast.ts                  # Notifications
   useTheme.ts                  # Dark/light mode
```

## Key Decisions

**Why Pinia?**
Multiple components need the same data, easier to manage in one place.

**Why composables?**
Reusable logic (API calls, toasts, theme) to prevent redundancy.

**Why sequential updates and not use promise.all even tho its provide but hashed in the store?**
When enabling multiple branches, we do it one by one instead of all at once. Slower  (much slower in fact) but we can show which ones failed.

**why not closing the model while disabling or enabling all branches 
(there is a button for enableing all branches, it is hashed as it was not required in the task)**
so we let the user know that that this action  will take a while,  he should wait before making any curcial changes as in fact this action is very imporant in itself 


## Tech Stack

- Vue 3 + TypeScript
- Vite
- Pinia
- Tailwind CSS
- Axios

## Important Components

**DataTable.vue**
Generic resuable table component the ability to config columns. Takes data array and column definitions, spits out a sortable table. 

**EditBranchDialog.vue**
Dialog for editing branch settings. Lets you set reservation duration, select which tables accept reservations, and configure time slots for each day of the week with validation.

**AddBranchesDialog.vue**
Simple dialog to enable reservations for multiple disabled branches at once. Shows a multi-select dropdown of disabled branches and enables them sequentially.

**TimeSlotCard.vue**
Shows days of the week with time slot inputs (from/to). Used inside EditBranchDialog for setting reservation hours per day.

**BaseDialog.vue**
Wrapper for all dialogs. Handles overlay, animations, close on escape/outside click. Other dialogs just pass title and content.

**useApi.ts**
Axios wrapper with base URL from env, auth token in headers, and error handling. Every API call goes through this.

**useToast.ts**
Simple toast system.

## API

 endpoints:
- `GET /branches?include[0]=sections&include[1]=sections.tables`
- `PUT /branches/:id`

The end#. 
