# Google Maps API Setup Instructions

## Issue
The current Google Maps API key doesn't have permission for the Geocoding service, which is needed for automatic address fetching from coordinates.

## Error Message
```
Geocoding Service: This API project is not authorized to use this API.
```

## Solution

### Step 1: Enable Geocoding API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Go to **APIs & Services > Library**
4. Search for "Geocoding API"
5. Click on "Geocoding API" and click **ENABLE**

### Step 2: Update API Key Restrictions (Optional but Recommended)
1. Go to **APIs & Services > Credentials**
2. Find your API key and click the edit icon
3. Under "API restrictions":
   - Select "Restrict key"
   - Enable these APIs:
     - Maps JavaScript API
     - Geocoding API
     - Places API (if using places features)
4. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domain(s):
     - `http://localhost:*/*` (for development)
     - `https://yourdomain.com/*` (for production)
5. Save changes

### Step 3: Billing Account
Make sure your Google Cloud project has a valid billing account attached, as the Geocoding API requires billing to be enabled.

## Current Workaround
The application now includes a fallback that will:
1. Try to use Google Maps Geocoding API first
2. If access is denied, show coordinates-based address: "Location at 28.6139, 77.2090 (Geocoding API not available)"
3. Allow manual address entry in all cases

## Testing
After enabling the Geocoding API:
1. Clear your browser cache
2. Refresh the application
3. Add a new POP/Sub-POP location
4. The address should auto-populate with a proper formatted address instead of coordinates

## Alternative Solution
If you don't want to enable billing for Geocoding API, you can:
1. Remove the `getAddressFromCoords` function calls
2. Users will need to enter addresses manually
3. The application will work perfectly without geocoding

## Files Modified
- `src/components/WorkingMeasurementMap.jsx` - Added fallback geocoding
- `src/components/AddLocationForm.jsx` - Updated helper text for geocoding status
- Added warning alert in the UI about geocoding setup

## Cost Information
- Geocoding API pricing: https://developers.google.com/maps/documentation/geocoding/usage-and-billing
- Usually very minimal cost for typical usage
- First $200 of usage per month is free
