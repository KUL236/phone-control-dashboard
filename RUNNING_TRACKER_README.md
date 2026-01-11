# 🏃 Running Tracker - Real-time GPS Tracking

A comprehensive web-based running tracker with real-time GPS tracking, Google Maps integration, live statistics, and intelligent danger alerts with vibration notifications.

## ✨ Features

### Real-time Tracking
- 📍 **Live GPS Tracking** - Track your exact location in real-time
- 🗺️ **Google Maps Integration** - View your route on an interactive map
- 📌 **Route Visualization** - See your running path with polyline overlay
- 🧭 **Current Location Display** - Coordinates and accuracy info

### Running Statistics
- **Distance Tracking**
  - Total kilometers traveled
  - Total meters displayed
  - Accurate distance calculation using Haversine formula

- **Time Tracking**
  - Total elapsed time (HH:MM:SS format)
  - Start/pause/resume functionality
  - Precise timing calculations

- **Speed Metrics**
  - Real-time current speed
  - Average speed throughout run
  - Maximum speed achieved
  - Speed trends

- **Pace Information**
  - Minutes per kilometer
  - Helpful for training and pacing goals

### Advanced Statistics
- 📈 **Average Speed** - Calculate and display throughout run
- 🏃 **Max Speed** - Track your fastest segment
- 📊 **Calories Burned** - Estimate energy expenditure (~70 cal/km)
- ⛰️ **Elevation Tracking** - Monitor altitude changes
- 📡 **GPS Accuracy** - Display location accuracy in meters

### Safety & Alerts
- 🚨 **Danger Zone Detection** - Alert for hazardous areas
- ⚠️ **Speed Warning** - Notify when exceeding safe running speed
- 🔊 **Audio Alerts** - Different tones for different alert types
- 📳 **Vibration Alerts** - Haptic feedback for notifications
- 🧪 **Steep Terrain Detection** - Warning for elevation changes
- ⏰ **Real-time Monitoring** - Continuous safety checks

### Customizable Settings
- **Speed Threshold** - Set your own speed warning limit
- **Alert Frequency** - Adjust danger zone check interval
- **Vibration Control** - Enable/disable haptic feedback
- **Sound Alerts** - Toggle audio notifications
- **Alert System** - Enable/disable all danger alerts

### Data Management
- 💾 **Save Runs** - Store run history locally
- 📥 **Export GPX** - Download track in GPX format for other apps
- 📤 **Share Runs** - Share results with friends via native share
- 📜 **Run History** - View last 5 completed runs
- 💿 **Local Storage** - All data saved in browser cache

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for Google Maps)
- Location services enabled on device
- Google Maps API key

### Installation

1. **Get a Google Maps API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Google Maps JavaScript API
   - Generate an API key
   - Enable Geolocation API

2. **Update API Key**
   - Open `running-tracker.html`
   - Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=geometry"></script>
   ```

3. **Deploy Files**
   ```
   - running-tracker.html
   - running-tracker.css
   - running-tracker.js
   ```

4. **Access the App**
   - Open `running-tracker.html` in your browser
   - Or access via your web server: `http://192.168.0.157:8000/running-tracker.html`

## 📱 How to Use

### Starting a Run
1. Click **"Start Run"** button
2. Grant location permissions when prompted
3. Your location appears on the map
4. Route tracking begins automatically

### Tracking Your Run
- **Real-time Stats** - Distance, time, speed update live
- **Map View** - Your position and route visible on map
- **Alerts** - Receive notifications for dangerous areas
- **Vibration** - Feel haptic feedback for alerts

### Controlling Your Run
- **Pause** - Stop tracking without ending the run
- **Resume** - Continue after pause
- **Stop** - End the run and save data

### Safety Features
- Set speed threshold (default: 25 km/h)
- Configure alert interval (default: 30 seconds)
- Disable alerts if needed
- Toggle vibration feedback
- Control audio notifications

### Saving & Sharing
- **Save Run** - Stores to local browser storage
- **Share Run** - Share summary with friends
- **Download GPX** - Export for fitness apps
- **View History** - See last 5 runs

## 📊 Statistics Explained

### Distance
- **Total KM** - Total kilometers covered
- **Total Meters** - Same distance in meters
- Calculated using GPS coordinates (Haversine formula)

### Time
- Format: HH:MM:SS
- Includes pause time if resumed
- Precise to nearest second

### Speed
- **Current Speed** - Your speed at this moment
- **Average Speed** - Total distance ÷ total time
- **Max Speed** - Fastest speed achieved
- Unit: km/h

### Pace
- Minutes per kilometer
- Useful for training targets
- Format: MM:SS per km

### Calories
- Estimated based on distance
- ~70 calories per kilometer
- Varies by body weight and intensity

### Elevation
- Total meters of elevation gain
- Tracked from GPS altitude data
- Helpful for hill training

## 🚨 Safety Alerts

### Speed Warning
- Triggers when speed exceeds threshold
- Default: 25 km/h
- Customizable in settings
- Vibration pattern: [100, 50, 100]

### Danger Zone Alert
- Pre-defined hazardous areas
- Traffic zones
- Construction areas
- Busy intersections
- Pattern: [200, 100, 200, 100, 200]

### Terrain Warning
- Steep elevation changes detected
- Alert for safety caution
- Based on altitude data

## 💾 Data Storage

### Local Storage
- All runs saved in browser storage
- Persists across sessions
- Clear browser cache to reset

### Exported Formats
- **GPX** - Standard GPS format
  - Compatible with: Strava, Garmin, AllTrails
  - Includes: Location, altitude, time
  - Filename: `run-[timestamp].gpx`

### Run History
- Stored locally on device
- Last 5 runs displayed
- Shows: Date, distance, time, avg speed

## 🔒 Privacy & Security

- **No Cloud Storage** - All data stays local
- **No Tracking** - We don't track your location
- **No Servers** - Runs offline where possible
- **Browser Storage** - Standard localStorage API
- **Clear Data** - Delete anytime from browser

## ⚠️ Limitations

1. **Browser APIs**
   - Geolocation accuracy varies by device
   - Some browsers limit background location

2. **Google Maps**
   - Requires valid API key
   - Subject to rate limits
   - May have usage costs

3. **Danger Detection**
   - Simulated hazard zones in demo
   - Real-world apps would use hazard databases
   - Speed warning only, not weather-aware

4. **Elevation**
   - Depends on GPS altitude data
   - Not always accurate
   - May not capture small hill variations

5. **Mobile**
   - Battery intensive
   - Screen stays on during run
   - Uses significant data for maps

## 🎯 Best Practices

### For Accurate Tracking
1. Allow location permissions
2. Keep device in hand or pocket
3. Run in open areas (not tunnels)
4. Disable battery saver if possible
5. Charge phone before long runs

### For Safety
1. Enable all safety alerts
2. Review danger zone alerts
3. Adjust speed threshold for your pace
4. Keep sound or vibration enabled
5. Stop if alert seems critical

### For Battery Life
1. Reduce map zoom when not needed
2. Lower screen brightness
3. Disable background apps
4. Use battery saver mode
5. Connect to charger for long runs

## 🔧 Technical Details

### APIs Used
- **Geolocation API** - GPS tracking
- **Google Maps API** - Map display & routing
- **Web Audio API** - Alert sounds
- **Vibration API** - Haptic feedback
- **LocalStorage API** - Data persistence
- **Navigator.share API** - Sharing functionality

### Calculations
- **Distance** - Haversine formula for Earth surface
- **Speed** - Distance / time in km/h
- **Pace** - Time / distance in min/km
- **Calories** - ~70 per km (approximation)

### Browser Support
- ✅ Chrome (Android & Desktop)
- ✅ Firefox (Android & Desktop)
- ✅ Safari (iOS & Mac)
- ✅ Edge (All platforms)
- ⚠️ Limited on older browsers

## 🌟 Use Cases

1. **Training** - Track your running progress
2. **Racing** - Monitor pace and speed
3. **Fitness** - Calculate calories burned
4. **Navigation** - Plan running routes
5. **Safety** - Know your location
6. **Social** - Share achievements
7. **Data** - Export to fitness apps

## 📈 Future Enhancements

- [ ] Multiple route saving
- [ ] Route comparison
- [ ] Weather integration
- [ ] Heart rate monitoring (Bluetooth)
- [ ] Crowd-sourced hazard reporting
- [ ] Social leaderboards
- [ ] Advanced analytics dashboard
- [ ] Offline map caching
- [ ] Voice guidance
- [ ] Advanced terrain analysis

## 🐛 Troubleshooting

### Location Not Available
- Check if location services are enabled
- Grant app permission to access location
- Try different browser
- Ensure you're outdoors (GPS needs clear sky)

### Map Not Loading
- Verify Google Maps API key is valid
- Check internet connection
- Ensure API quotas not exceeded
- Try refreshing page

### Vibration Not Working
- Check if device supports vibration
- Verify vibration toggle is on
- Test with simple vibrate button
- Try different browser

### Data Not Saving
- Ensure localStorage is enabled
- Check browser privacy settings
- Clear cache and try again
- Try exporting to GPX instead

### Inaccurate Distance
- GPS accuracy varies by device
- Try running in open areas
- More satellites = better accuracy
- Check GPS accuracy indicator

## 📄 Files Included

```
running-tracker/
├── running-tracker.html    # Main HTML file
├── running-tracker.css     # Styling and responsive design
├── running-tracker.js      # Core functionality
└── README.md              # This file
```

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Verify API key is correct
3. Clear browser cache
4. Try different browser
5. Check console for errors (F12)

## 🎉 Get Started

1. Set up Google Maps API key
2. Open `running-tracker.html` in your browser
3. Grant location permissions
4. Click "Start Run" and begin tracking!

---

**Stay safe and happy running! 🏃‍♂️🏃‍♀️**

Last Updated: January 2026
Version: 1.0.0
