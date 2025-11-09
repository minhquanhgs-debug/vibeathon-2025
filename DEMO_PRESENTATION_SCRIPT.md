# ReferHarmony - 5-Minute Demo Presentation Script

## 🎯 Demo Overview
**Duration:** 5 minutes  
**Format:** Live application demonstration  
**Focus:** Show, don't just tell - walk through actual features

---

## 📝 Demo Script (with timing cues)

### [0:00 - 0:30] **Opening & Setup**

**[0:00]**
"Good [morning/afternoon], everyone. I'm excited to give you a live demonstration of **ReferHarmony** - our AI-powered healthcare referral and care navigation system."

**[0:10]**
"Today, I'll walk you through how a patient uses our system to get an optimized care route, and then show you how providers track and manage those routes. Let's dive in!"

**[0:20]**
*[Open browser, navigate to Route Planner]*

"I'm starting at the Route Planner - this is where patients begin their journey."

---

### [0:30 - 2:00] **Patient Journey: Route Optimization**

**[0:30]**
"Here's the patient input form. Let me fill in the information:"

*[Fill in form fields]*
- "Patient name: John Doe"
- "Insurance: Aetna Gold"
- "Location: I'll enter coordinates for Joplin, Missouri"
- "Address: 123 Main St, Joplin, MO - notice how the system can geocode addresses"

**[0:50]**
"Now I'll click 'Optimize Route' - this triggers our AI-powered route optimization engine."

*[Click Optimize Route button]*

**[0:55]**
"While it's processing, the system is:
- Verifying insurance eligibility
- Matching services with covered providers
- Calculating distances and costs
- Running our A* optimization algorithm
- Generating AI recommendations"

**[1:10]**
*[Route appears]*

"Perfect! Here's what the patient sees:"

**[1:15]**
"**First, the Route ID** - this is crucial. Route ID #42. The patient can copy this with one click to share with their doctor."

*[Point to Route ID card, optionally click Copy]*

**[1:25]**
"**Cost Breakdown** - Notice we show four key metrics:
- Total Cost: $333.75
- Service Cost: $330.00
- Travel Cost: $3.75 - this is calculated based on actual distance
- Total Time: 2 hours 30 minutes"

**[1:40]**
"**The Route** - Here are the three services in optimal order:
1. Primary Care Consultation at Mercy Hospital
2. Cardiology Follow-up at Freeman Health
3. Lab Work at LabCorp"

**[1:50]**
"Each service shows:
- Service cost
- Travel cost to reach it
- Distance in miles
- Duration"

**[2:00]**
"**AI Recommendations** - Scroll down to see AI-powered insights explaining why this route was chosen, cost-saving tips, and health considerations."

---

### [2:00 - 3:30] **Route Customization & Features**

**[2:00]**
"Patients can customize their route. For example, if they want to exclude a service, they can toggle it off:"

*[Click to exclude a service]*

**[2:10]**
"Notice how the costs and route update automatically. This gives patients control over their care journey."

**[2:20]**
"Let me also point out the **distance-based cost calculation**. When the patient entered their address, the system:
- Geocoded the address to get precise coordinates
- Calculated distances to each provider
- Added travel costs at $0.50 per mile
- This gives complete cost transparency"

**[2:35]**
"Now, the patient has their Route ID - let's say it's #42. They can share this with their healthcare provider. Let me show you what happens on the provider side."

---

### [2:35 - 4:00] **Provider Dashboard: Route Tracking**

**[2:35]**
*[Switch to Provider Dashboard tab/window]*

"Here's the Provider Dashboard. This is where doctors and care coordinators manage patient routes."

**[2:45]**
"To track a patient's route, the provider simply enters the Route ID that the patient shared:"

*[Type Route ID: 42]*

**[2:50]**
"Click 'Load Route'..."

*[Click Load Route button]*

**[2:55]**
"Perfect! The route loads instantly. Here's what providers see:"

**[3:00]**
"**Route Summary:**
- Route ID: #42
- Patient ID: P1
- Insurance: AET-GOLD
- Progress: 0% - this updates in real-time as services are completed"

**[3:10]**
"**Service Nodes** - Each service in the route is listed with:
- Current status: Pending, In Progress, Completed
- Service details
- Location information"

**[3:20]**
"**Status Updates** - Providers can update the status of each service:"

*[Click on a service status dropdown]*

"See options: Pending, Scheduled, In Progress, Completed, Cancelled"

*[Select "In Progress" or "Completed"]*

**[3:30]**
"Watch the progress bar update automatically - now showing 33% complete. This gives real-time visibility into the patient's care journey."

---

### [4:00 - 4:45] **Key Features Highlight**

**[4:00]**
"Let me highlight a few key technical features:"

**[4:05]**
"**1. AI-Powered Optimization** - Our system uses the A* algorithm, the same technology behind GPS navigation, but optimized for healthcare. It considers distance, cost, time, and insurance coverage."

**[4:15]**
"**2. Real-Time Tracking** - Providers can see exactly where a patient is in their care journey at any moment."

**[4:25]**
"**3. Cost Transparency** - Patients see everything upfront - service costs, travel expenses, total cost - no surprises."

**[4:35]**
"**4. Insurance Integration** - The system automatically verifies eligibility and matches services with covered providers."

**[4:45]**
"**5. Route ID System** - Simple, secure way for patients to share their route with providers - no complex logins or portals needed."

---

### [4:45 - 5:00] **Closing & Q&A**

**[4:45]**
"In just 5 minutes, you've seen how ReferHarmony transforms healthcare navigation from a confusing, time-consuming process into a streamlined, transparent journey."

**[4:50]**
"Patients get optimized routes with complete cost transparency. Providers get real-time visibility into patient care. Everyone wins."

**[4:55]**
"Thank you for watching. I'd be happy to answer any questions or show you additional features."

**[5:00]**
"Thank you!"

---

## 🎬 Demo Preparation Checklist

### **Before the Demo:**

- [ ] **Test the application** - Make sure everything works
- [ ] **Prepare test data** - Have a route already optimized (Route ID ready)
- [ ] **Browser setup** - Open Route Planner in one tab, Provider Dashboard in another
- [ ] **Screen resolution** - Set to 1920x1080 or similar for clear visibility
- [ ] **Zoom level** - Set browser zoom to 100% for best appearance
- [ ] **Internet connection** - Ensure stable connection
- [ ] **Backup screenshots** - Have screenshots ready in case of technical issues
- [ ] **Route ID ready** - Know a working Route ID to demonstrate (e.g., #42)

### **Technical Setup:**

- [ ] **Backend running** - Route Optimizer server on port 8000
- [ ] **Frontend running** - React app on port 3000
- [ ] **Database seeded** - Providers and services available
- [ ] **API working** - Test route optimization before demo
- [ ] **AI configured** - Optional, but nice to have AI recommendations working

### **Demo Data to Prepare:**

**Patient Input:**
- Name: "John Doe" (or your choice)
- Insurance: "AET-GOLD"
- Location: Latitude 37.0842, Longitude -94.5133 (Joplin, MO)
- Address: "123 Main St, Joplin, MO 64804"

**Expected Results:**
- Route ID: Will be generated (note it down)
- Services: Should show 3-5 services
- Costs: Should show service + travel costs
- AI Recommendations: If configured

---

## 🎯 Demo Flow Diagram

```
1. Open Route Planner
   ↓
2. Fill in Patient Information
   ↓
3. Click "Optimize Route"
   ↓
4. Show Route ID (copy it)
   ↓
5. Show Cost Breakdown
   ↓
6. Show Service Route
   ↓
7. Show AI Recommendations
   ↓
8. Switch to Provider Dashboard
   ↓
9. Enter Route ID
   ↓
10. Show Route Details
   ↓
11. Update Service Status
   ↓
12. Show Progress Update
```

---

## 💡 Demo Tips & Tricks

### **If Something Goes Wrong:**

1. **Route doesn't optimize:**
   - "Let me show you what the results look like" → Use screenshot
   - "The system is processing..." → Explain what's happening

2. **Provider Dashboard doesn't load:**
   - "Here's how it would appear..." → Use screenshot
   - "The route would display here..." → Explain the interface

3. **Technical glitch:**
   - Stay calm, acknowledge it
   - "Let me show you the expected behavior..." → Use backup materials
   - Continue with explanation

### **Engagement Techniques:**

- **Ask rhetorical questions:** "Notice how the costs are broken down?"
- **Point to specific elements:** Use mouse cursor to highlight features
- **Explain as you go:** "As I click here, you'll see..."
- **Show, then explain:** Let visuals speak first, then add context

### **Pacing:**

- **Don't rush** - Better to skip a feature than rush through everything
- **Pause for effect** - After showing Route ID, pause to let it sink in
- **Check understanding** - "Any questions so far?" (if time allows)

---

## 📊 Alternative Demo Scenarios

### **Scenario 1: Focus on Patient Experience (3 min)**
- Skip Provider Dashboard
- Deep dive into Route Planner features
- Show customization options
- Highlight AI recommendations

### **Scenario 2: Focus on Provider Experience (3 min)**
- Start with Provider Dashboard
- Show route import
- Demonstrate status updates
- Show progress tracking

### **Scenario 3: Quick Overview (2 min)**
- Show Route Planner → Optimize → Route ID
- Switch to Provider Dashboard → Import Route ID
- Highlight key benefits
- Close

---

## 🎤 What to Say vs. What to Show

### **Say Less, Show More:**

❌ **Don't say:** "The system calculates distances using the Haversine formula..."
✅ **Do say:** "Watch as the system calculates travel costs based on distance..."

❌ **Don't say:** "We use React and FastAPI for the frontend and backend..."
✅ **Do say:** "Notice how quickly the route loads - that's our optimized system..."

❌ **Don't say:** "The A* algorithm optimizes the route..."
✅ **Do say:** "See how the services are ordered - this is the most efficient path..."

### **Key Phrases to Use:**

- "Watch this..."
- "Notice how..."
- "Here's what happens..."
- "As you can see..."
- "This is where..."
- "The system automatically..."

---

## 🎨 Visual Cues for Audience

### **When to Point:**

1. **Route ID card** - "This is the Route ID patients share"
2. **Cost breakdown** - "Complete cost transparency"
3. **Service nodes** - "Each service in the optimized route"
4. **Progress bar** - "Real-time tracking"
5. **Status dropdown** - "Easy status updates"

### **Mouse Movements:**

- **Slow, deliberate** - Don't move mouse too fast
- **Circle important elements** - Draw attention to key features
- **Click confidently** - Show you know the system
- **Hover to show tooltips** - If available

---

## 📝 Quick Reference Card

**Opening:** "Live demo of ReferHarmony"

**Patient Flow:** "Route Planner → Optimize → Route ID → Share"

**Provider Flow:** "Dashboard → Import Route ID → Track → Update"

**Key Message:** "Seamless, transparent, AI-powered healthcare navigation"

**Closing:** "Questions?"

---

## ✅ Final Pre-Demo Checklist

- [ ] Application tested and working
- [ ] Test data prepared
- [ ] Browser tabs ready (Route Planner + Provider Dashboard)
- [ ] Backup screenshots prepared
- [ ] Script reviewed
- [ ] Timing practiced
- [ ] Technical issues resolved
- [ ] Water nearby
- [ ] Screen sharing tested (if remote)
- [ ] Microphone working (if remote)

---

## 🚀 Ready to Demo!

**Remember:**
- Stay calm and confident
- Show, don't just tell
- Engage with the audience
- Handle glitches gracefully
- End strong

**Good luck with your demo! 🎉**

