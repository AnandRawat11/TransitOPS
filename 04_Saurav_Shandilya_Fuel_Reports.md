# Saurav Shandilya — Fuel & Expense Management + Reports & Analytics

**Branch:** `feature/fuel-reports`
**Depends on:** Anand's Vehicle model, Nitin's Trip/Maintenance data (pull `main` before starting; this module reads the most from everyone else's work)
**Note:** This is the last module to merge — it aggregates data from all three others, so build your queries defensively (handle empty collections gracefully for early testing).

---

## 1. Scope

You own fuel logging, general expense tracking, and the Reports & Analytics screen — the module the Financial Analyst persona cares about most. Your formulas need Vehicle (`acquisitionCost`), Trip (`actualDistance`), Maintenance (`cost`), and Fuel (`liters`, `cost`) data.

---

## 2. Backend Tasks

### 2.1 Models
- `FuelLog` model (see contract doc)
- `Expense` model (see contract doc)

### 2.2 Fuel Routes (`/api/fuel`)
| Method | Route | Description | Role |
|---|---|---|---|
| GET | `/` | List fuel logs (supports `?vehicleId=`) | All roles |
| POST | `/` | Create fuel log entry | Driver / Fleet Manager |
| DELETE | `/:id` | Remove entry (correction) | Fleet Manager |

### 2.3 Expense Routes (`/api/expenses`)
| Method | Route | Description | Role |
|---|---|---|---|
| GET | `/` | List expenses (supports `?vehicleId=&type=`) | All roles |
| POST | `/` | Create expense (toll, misc.) | Fleet Manager / Financial Analyst |
| DELETE | `/:id` | Remove entry | Fleet Manager |

### 2.4 Reports Routes (`/api/reports`) — the core of your module

| Method | Route | Description |
|---|---|---|
| GET | `/operational-cost` | Per-vehicle total cost = Σ FuelLog.cost + Σ MaintenanceLog.cost |
| GET | `/fuel-efficiency` | Per-vehicle: total distance / total fuel liters |
| GET | `/fleet-utilization` | Fleet-wide %, same formula as Dashboard (reuse Deepika's aggregation logic — don't reinvent) |
| GET | `/roi` | Per-vehicle ROI (formula below) |
| GET | `/export/csv` | CSV export of the combined report table |

**Formulas (straight from the PDF):**

```
Operational Cost (per vehicle) = Σ FuelLog.cost + Σ MaintenanceLog.cost

Fuel Efficiency (per vehicle) = Σ Trip.actualDistance / Σ FuelLog.liters

Vehicle ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
```

- **Revenue** isn't explicitly modeled in the PDF's entity list — you'll need to define a reasonable proxy. Two options, pick one and document it in your PR:
  1. Add a simple `revenue` field to `Trip` (per-trip revenue entered manually or a flat rate × distance) — cleanest option if time allows
  2. Treat revenue as a manually-entered per-vehicle field for the hackathon demo (simplest, fastest)
- Flag this assumption clearly in your README/demo notes since it's the one place the spec is ambiguous — judges will likely ask about it

**Aggregation approach:**
- Use Mongoose aggregation pipelines with `$group` by `vehicle` for efficient per-vehicle rollups instead of looping in JS
- Example shape for `/operational-cost`:
```json
{
  "success": true,
  "data": [
    { "vehicleId": "...", "registrationNumber": "Van-05", "fuelCost": 4200, "maintenanceCost": 1500, "totalCost": 5700 }
  ]
}
```

### 2.5 CSV Export
- Use a lightweight library like `json2csv` or `papaparse` (Node-side) to convert the report array to CSV
- Return with headers: `Content-Type: text/csv` and `Content-Disposition: attachment; filename=report.csv`

---

## 3. Frontend Tasks

### 3.1 Fuel & Expense Pages
- `FuelLogPage.jsx` — table + form to add fuel log (vehicle dropdown, liters, cost, date)
- `ExpensePage.jsx` — table + form to add expense (vehicle dropdown, type, amount, date, notes)
- Can combine both into a tabbed `FuelExpensePage.jsx` if time is tight

### 3.2 Reports & Analytics Page
- `ReportsPage.jsx` — the most visual page in the app, main "wow factor" for demo judging
- Sections:
  - **Fuel Efficiency chart** — bar chart, per vehicle (Recharts)
  - **Operational Cost chart** — stacked bar (fuel vs maintenance) per vehicle
  - **ROI table/chart** — per vehicle, color-coded (green if positive, red if negative)
  - **Fleet Utilization** — can reuse Deepika's dashboard component/styling for consistency
- Filter by vehicle, date range
- "Export CSV" button hitting `/api/reports/export/csv`, triggering browser download
- **Bonus (if time allows):** PDF export using a library like `jspdf` — PDF's explicitly optional, don't burn hours here unless everything else is done

### 3.3 UI Requirements
- Charts should be readable at a glance — this is the page most likely to impress judges since it visualizes the whole platform's data
- Loading/empty states (e.g., "No fuel logs yet" instead of blank chart)

---

## 4. Business Rules You Must Enforce

- ✅ Operational cost must always be Fuel + Maintenance (don't accidentally exclude one)
- ✅ Fuel efficiency should handle divide-by-zero gracefully (vehicle with fuel logs but 0 recorded distance yet)
- ✅ ROI calculation must not crash on vehicles with `acquisitionCost: 0` or missing — guard with a check and show "N/A" instead of `Infinity`/`NaN`

---

## 5. Deliverable Checklist

- [ ] Fuel log + Expense CRUD working
- [ ] All four report endpoints returning correct aggregated data
- [ ] Reports page with at least 2 charts + 1 table live
- [ ] CSV export working end-to-end (downloadable file with correct data)
- [ ] Documented assumption on how "Revenue" is captured for ROI calc

---

## 6. Handoff Notes for Teammates

- Nitin: confirm whether trip completion auto-creates a FuelLog, or whether I should expect users to manually log fuel after each trip — affects how I query Fuel Efficiency
- Deepika: I'll reuse your Fleet Utilization aggregation pattern from `/api/dashboard/kpis` rather than duplicating logic — let me know if you refactor it into a shared helper function I can import
- Anand: need `acquisitionCost` reliably populated on all seeded vehicles for ROI demo to look correct — make sure your seed script includes it
