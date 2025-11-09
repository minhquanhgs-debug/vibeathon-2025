# 💰 Distance-Based Cost Calculation Feature

## ✅ What Was Added

The Route Optimizer now calculates **travel costs based on distance** when you enter an address!

---

## 🎯 Features

### 1. **Address Geocoding**
- Converts address to coordinates automatically
- Uses OpenStreetMap Nominatim (free geocoding service)
- Falls back to manual coordinates if geocoding fails

### 2. **Distance Calculation**
- Calculates distance from patient to each service location
- Uses Haversine formula for accurate distance
- Shows distance in miles

### 3. **Travel Cost Calculation**
- Calculates cost based on distance traveled
- Default: **$0.50 per mile** (configurable)
- Separate from service costs

### 4. **Cost Breakdown**
- **Total Cost** = Service Cost + Travel Cost
- Shows both costs separately
- Displays travel cost per service node

---

## 📊 How It Works

### When Patient Enters Address:

1. **Geocoding:**
   ```
   Address: "123 Main St, Joplin, MO"
   → Converts to: Latitude 37.0842, Longitude -94.5133
   ```

2. **Distance Calculation:**
   ```
   Patient → Service 1: 2.5 miles
   Service 1 → Service 2: 1.8 miles
   Service 2 → Service 3: 3.2 miles
   Total: 7.5 miles
   ```

3. **Travel Cost:**
   ```
   7.5 miles × $0.50/mile = $3.75 travel cost
   ```

4. **Total Cost:**
   ```
   Service Cost: $330.00
   Travel Cost: $3.75
   Total: $333.75
   ```

---

## ⚙️ Configuration

### Set Travel Cost Per Mile

**In `route_optimizer/.env`:**
```env
TRAVEL_COST_PER_MILE=0.50
```

**Default:** $0.50 per mile (if not set)

**Examples:**
- `0.50` = $0.50 per mile (standard)
- `0.65` = $0.65 per mile (higher cost)
- `0.30` = $0.30 per mile (lower cost)

---

## 📱 Frontend Display

### Cost Summary Cards:
- **Total Cost** - Combined service + travel
- **Service Cost** - Medical services only
- **Travel Cost** - Distance-based travel
- **Total Time** - Total duration

### Service Node Details:
Each service node shows:
- **Service Price** - Cost of the service
- **Travel Cost** - Cost to reach this location
- **Distance** - Miles to this location
- **Duration** - Service duration

---

## 🔧 How Address Geocoding Works

### Automatic Geocoding:
1. Patient enters address in form
2. System geocodes address to get coordinates
3. Uses coordinates for distance calculation
4. Falls back to manual lat/lng if geocoding fails

### Geocoding Service:
- Uses **OpenStreetMap Nominatim** (free, no API key needed)
- Works for most addresses worldwide
- Can be upgraded to Google Geocoding API for better accuracy

---

## 💡 Example

### Input:
```json
{
  "name": "John Doe",
  "insurance_code": "AET-GOLD",
  "address": "123 Main St, Joplin, MO 64804",
  "location_latitude": 37.0842,
  "location_longitude": -94.5133
}
```

### Output:
```json
{
  "total_estimated_cost": 333.75,
  "total_service_cost": 330.00,
  "total_travel_cost": 3.75,
  "total_distance_miles": 7.5,
  "route": [
    {
      "service_name": "Primary Care Consultation",
      "price": 80.00,
      "travel_cost": 1.25,
      "travel_distance_miles": 2.5
    },
    {
      "service_name": "Cardiology Follow-up",
      "price": 250.00,
      "travel_cost": 0.90,
      "travel_distance_miles": 1.8
    }
  ]
}
```

---

## 🎨 UI Updates

### Cost Breakdown Display:
- **4 cards** instead of 3:
  1. Total Cost (blue)
  2. Service Cost (green)
  3. Travel Cost (orange) - NEW!
  4. Total Time (purple)

### Service Node Display:
- Shows travel cost for each service
- Displays distance to each location
- Clear separation of service vs travel costs

---

## 🔄 How It Calculates

### For Each Service:
1. **Calculate distance** from previous location (or patient location for first)
2. **Calculate travel cost** = distance × cost_per_mile
3. **Add to total travel cost**
4. **Display in service node**

### Total Costs:
- **Service Cost** = Sum of all service prices (after insurance)
- **Travel Cost** = Sum of all travel segments
- **Total Cost** = Service Cost + Travel Cost

---

## ✅ Benefits

1. **Accurate Cost Estimation** - Includes travel expenses
2. **Transparent Pricing** - Shows service vs travel costs separately
3. **Distance-Based** - Costs reflect actual travel distance
4. **Address Support** - Automatically geocodes addresses
5. **Configurable** - Adjust cost per mile as needed

---

## 🚀 Usage

### In Route Planner:
1. Enter patient address (optional but recommended)
2. Enter coordinates (or let geocoding handle it)
3. Optimize route
4. See cost breakdown with travel costs!

### API Request:
```json
{
  "name": "Patient Name",
  "insurance_code": "AET-GOLD",
  "address": "123 Main St, Joplin, MO",
  "location_latitude": 37.0842,
  "location_longitude": -94.5133
}
```

**Address is optional** - if provided, it will be geocoded for accurate coordinates.

---

## 📝 Files Modified

1. **`route_optimizer/route_optimizer.py`**
   - Added `geocode_address()` function
   - Added `calculate_travel_cost()` function
   - Updated cost calculation logic
   - Added travel cost to service nodes

2. **`client/src/pages/RoutePlanner.jsx`**
   - Updated cost display (4 cards)
   - Shows travel cost per service
   - Displays distance information

---

## 🎉 Result

Now when patients enter an address, the system:
- ✅ Geocodes the address automatically
- ✅ Calculates distances accurately
- ✅ Adds travel costs based on distance
- ✅ Shows clear cost breakdown
- ✅ Displays cost breakdown

**Distance-based cost calculation is now fully integrated!** 🚀

