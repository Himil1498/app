# 🐛 Debug Line Drawing Issues

## 🚨 Current Issue
Lines are not appearing on the map when clicking to add measurement points.

## 🔧 Debugging Steps

### Step 1: Test the Simple Map Component

**Access the simple test page:**
```
http://localhost:5173/simpleMapTest
```

**What to check:**
1. Does the map load?
2. Can you see the debug logs?
3. Does "Test Polyline" create a green line?
4. Do markers appear when you click?
5. Do lines appear when you have 2+ points?

### Step 2: Check Browser Console

**Open Developer Tools (F12) and check:**
1. Are there any JavaScript errors?
2. Is the Google Maps API loading successfully?
3. Are the click events being triggered?
4. Are polylines being created?

**Look for these log messages:**
- `✅ Google Maps loaded via callback`
- `📍 Clicked at: [coordinates]`
- `🔗 Creating polyline...`
- `✅ Polyline created successfully!`

### Step 3: Common Issues & Solutions

#### Issue 1: API Key Problems
**Symptoms:** Map doesn't load, "Failed to load Google Maps" error
**Solution:** Check `.env` file has correct API key
```
VITE_GOOGLE_MAPS_KEY=AIzaSyAT5j5Zy8q4XSHLi1arcpkce8CNvbljbUQ
```

#### Issue 2: Click Events Not Working
**Symptoms:** No markers appear, no console logs when clicking
**Solutions:**
- Check if drawing mode is active
- Verify click listener is attached
- Check if map is fully loaded

#### Issue 3: Polylines Not Visible
**Symptoms:** Markers appear but no lines
**Solutions:**
- Check strokeWeight (should be > 0)
- Check strokeOpacity (should be > 0)
- Verify path coordinates are valid
- Check map zoom level

#### Issue 4: Conflicting Scripts
**Symptoms:** Intermittent issues, "Google is not defined" errors
**Solutions:**
- Clear browser cache
- Check for multiple Google Maps script tags
- Restart development server

### Step 4: Manual Testing Commands

**Open browser console and run:**

```javascript
// Check if Google Maps is loaded
console.log('Google Maps available:', !!window.google?.maps);

// Test polyline creation manually
if (window.google && window.google.maps) {
  const map = new google.maps.Map(document.querySelector('#map-container'), {
    center: { lat: 20.5937, lng: 78.9629 },
    zoom: 6
  });
  
  const testLine = new google.maps.Polyline({
    path: [
      { lat: 20, lng: 78 },
      { lat: 21, lng: 79 }
    ],
    strokeColor: '#FF0000',
    strokeWeight: 5,
    map: map
  });
  
  console.log('Test polyline:', testLine);
}
```

### Step 5: Fallback Solutions

If the main component still doesn't work:

1. **Use the simple test component** at `/simpleMapTest`
2. **Check network restrictions** (firewall, corporate proxy)
3. **Try different browser** (Chrome, Firefox, Edge)
4. **Clear all caches** and hard refresh (Ctrl+F5)

### Step 6: Environment Check

**Verify your setup:**
```bash
# Check if development server is running
npm run dev

# Verify .env file exists and has API key
Get-Content .env

# Check if port 5173 is accessible
curl http://localhost:5173
```

## 🎯 Expected Behavior

When working correctly:
1. Map loads and displays India
2. Clicking "Start Drawing" changes cursor to crosshair  
3. Clicking on map creates red circular markers
4. After 2+ clicks, red lines connect the markers
5. Distance calculations appear in real-time
6. Debug logs show successful operations

## 📞 Quick Test URLs

After logging in, try these URLs:

1. **Simple Test (Recommended):** `http://localhost:5173/simpleMapTest`
2. **Full Featured Map:** `http://localhost:5173/newMapMeasurement` 
3. **Navigation Page:** `http://localhost:5173/mapNavigation`

## 🔍 What to Report

If issues persist, note:
1. Which URL you're testing
2. Browser type and version
3. Error messages from console
4. Debug log output
5. Whether "Test Polyline" button works
6. API key status (working/not working)
