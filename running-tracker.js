// Running Tracker Application - JavaScript

// State Management
const trackerState = {
    isRunning: false,
    isPaused: false,
    startTime: null,
    pausedTime: 0,
    totalPausedDuration: 0,
    locations: [],
    distances: [],
    speeds: [],
    maxSpeed: 0,
    elevations: [],
    currentLocation: null,
    alerts: [],
    runData: {
        startTime: null,
        endTime: null,
        totalDistance: 0,
        totalTime: 0,
        avgSpeed: 0,
        maxSpeed: 0,
        calories: 0
    }
};

// Map instance
let map;
let userMarker;
let pathPolyline;
let dangerZones = [];
// Which map provider was initialized: 'google' or 'leaflet'
let mapProvider = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    // Show loading indicator
    showToast('📍 Requesting your location...', 'info');
    
    // Request location BEFORE initializing map so we can center on user's real location
    requestInitialLocation().then(() => {
        initializeMap();
        setupEventListeners();
        loadRunHistory();
        // Start continuous location tracking
        startContinuousLocationTracking();
        showToast('✅ Location acquired! Ready to track.', 'success');
    }).catch(err => {
        console.warn('Initial location fetch failed, using defaults:', err);
        initializeMap();
        setupEventListeners();
        loadRunHistory();
        startContinuousLocationTracking();
        showToast('⚠️ Enable GPS to track from your location', 'warning');
    });
});

// Initialize Leaflet Map
function initializeMap() {
    // Use user's current location if available, otherwise use default
    const defaultCenterLatLng = trackerState.currentLocation || { lat: 40.7128, lng: -74.0060 };

    if (typeof window.google !== 'undefined' && typeof window.google.maps !== 'undefined') {
        // Initialize Google Map
        map = new google.maps.Map(document.getElementById('map'), {
            center: defaultCenterLatLng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        // Create user marker
        userMarker = new google.maps.Marker({
            position: defaultCenterLatLng,
            map: map,
            title: 'Your Location'
        });

        // Initialize polyline for route
        pathPolyline = new google.maps.Polyline({
            map: map,
            geodesic: true,
            strokeColor: '#ff6b35',
            strokeOpacity: 0.8,
            strokeWeight: 4
        });
        mapProvider = 'google';
    } else {
        // Initialize Leaflet Map
        const defaultCenter = [defaultCenterLatLng.lat, defaultCenterLatLng.lng];

        map = L.map('map').setView(defaultCenter, 16);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        // Create user marker
        userMarker = L.circleMarker(defaultCenter, {
            radius: 10,
            fillColor: '#3b82f6',
            color: '#1e40af',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
            title: 'Your Location'
        }).addTo(map);

        // Initialize polyline for route
        pathPolyline = L.polyline([], {
            color: '#ff6b35',
            weight: 4,
            opacity: 0.8,
            smoothFactor: 1.0
        }).addTo(map);
        mapProvider = 'leaflet';
    }
}

// Helper: detect Google Maps availability
function isGoogleMaps() {
    return mapProvider === 'google';
}

// Request initial location (one-time, with timeout)
function requestInitialLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }

        const timeout = setTimeout(() => {
            reject(new Error('Location request timeout'));
        }, 10000); // 10 second timeout

        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearTimeout(timeout);
                const { latitude, longitude } = position.coords;
                trackerState.currentLocation = {
                    lat: latitude,
                    lng: longitude,
                    time: Date.now(),
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude || 0
                };
                resolve();
            },
            (error) => {
                clearTimeout(timeout);
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 0
            }
        );
    });
}

// Start continuous location tracking (after map init)
function startContinuousLocationTracking() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            updateLocation,
            handleLocationError,
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        showToast('Geolocation not supported on this browser', 'danger');
    }
}

// Add a point to the route (supports Google Maps and Leaflet)
function addPointToPath(location) {
    if (isGoogleMaps()) {
        const latLng = new google.maps.LatLng(location.lat, location.lng);
        const path = pathPolyline.getPath();
        path.push(latLng);
        map.panTo({ lat: location.lat, lng: location.lng });
    } else {
        const path = pathPolyline.getLatLngs();
        path.push(new L.LatLng(location.lat, location.lng));
        pathPolyline.setLatLngs(path);
        map.panTo(new L.LatLng(location.lat, location.lng));
    }
}

// Set user marker position (supports Google Maps and Leaflet)
function setUserMarkerPosition(location) {
    if (!location) return;
    if (isGoogleMaps()) {
        if (!userMarker) {
            userMarker = new google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                map: map,
                title: 'Your Location'
            });
        } else {
            userMarker.setPosition({ lat: location.lat, lng: location.lng });
        }
    } else {
        if (!userMarker) {
            userMarker = L.circleMarker([location.lat, location.lng], {
                radius: 10,
                fillColor: '#3b82f6',
                color: '#1e40af',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(map);
        } else {
            userMarker.setLatLng(new L.LatLng(location.lat, location.lng));
        }
    }
}

// Setup Event Listeners
function setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', startRun);
    document.getElementById('pauseBtn').addEventListener('click', pauseRun);
    document.getElementById('resumeBtn').addEventListener('click', resumeRun);
    document.getElementById('stopBtn').addEventListener('click', stopRun);
    document.getElementById('clearRouteBtn').addEventListener('click', clearRoute);
    document.getElementById('saveRunBtn').addEventListener('click', saveRun);
    document.getElementById('shareRunBtn').addEventListener('click', shareRun);
    document.getElementById('downloadGPXBtn').addEventListener('click', downloadGPX);
    
    document.getElementById('dangerAlerts').addEventListener('change', handleAlertToggle);
    document.getElementById('vibrationToggle').addEventListener('change', handleVibrationToggle);
    document.getElementById('soundToggle').addEventListener('change', handleSoundToggle);
}

// Note: requestLocationPermission() is now handled by requestInitialLocation() and startContinuousLocationTracking()
// Location tracking starts immediately on page load

// Update Location
function updateLocation(position) {
    const { latitude, longitude, accuracy } = position.coords;
    const altitude = position.coords.altitude || 0;

    const newLocation = {
        lat: latitude,
        lng: longitude,
        time: Date.now(),
        accuracy: accuracy,
        altitude: altitude
    };

    // Update current location display
    document.getElementById('locationDisplay').textContent = 
        `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    document.getElementById('accuracy').textContent = `±${accuracy.toFixed(0)}m`;

    // Update marker and map center
    setUserMarkerPosition(newLocation);
    
    if (trackerState.isRunning && !trackerState.isPaused) {
        // Calculate distance and speed
        if (trackerState.locations.length > 0) {
            const lastLocation = trackerState.locations[trackerState.locations.length - 1];
            const distance = calculateDistance(lastLocation, newLocation);
            
            if (distance > 0) {
                trackerState.distances.push(distance);
                trackerState.locations.push(newLocation);

                // Update polyline / path
                addPointToPath(newLocation);

                // Calculate speed (km/h)
                const timeDiffMs = newLocation.time - lastLocation.time; // milliseconds
                let speed = 0;
                if (timeDiffMs > 0) {
                    const timeDiffHours = timeDiffMs / 3600000; // Convert to hours
                    speed = distance / timeDiffHours;
                    trackerState.speeds.push(speed);
                }

                if (speed > trackerState.maxSpeed) {
                    trackerState.maxSpeed = speed;
                }

                // Update elevation gain
                if (altitude && lastLocation.altitude) {
                    const elevationGain = Math.max(0, altitude - lastLocation.altitude);
                    trackerState.elevations.push(elevationGain);
                }

                // Check for danger zones
                if (document.getElementById('dangerAlerts').checked) {
                    checkDangerZones(newLocation, speed);
                }
            }
        } else if (trackerState.isRunning) {
            trackerState.locations.push(newLocation);
        }

        updateDisplay();
        updateLastUpdated();
    } else if (!trackerState.isRunning) {
        // Just show location without tracking
        if (isGoogleMaps()) {
            map.panTo({ lat: newLocation.lat, lng: newLocation.lng });
        } else {
            map.panTo(new L.LatLng(newLocation.lat, newLocation.lng));
        }
    }

    trackerState.currentLocation = newLocation;
}

// Handle Location Error
function handleLocationError(error) {
    let message = 'Unable to get your location';
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please enable location access.';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
        case error.TIMEOUT:
            message = 'The request to get user location timed out.';
            break;
    }
    console.error(message);
}

// Calculate Distance (Haversine formula)
function calculateDistance(loc1, loc2) {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Update Polyline
function updatePolyline(location) {
    const path = pathPolyline.getLatLngs();
    path.push(new L.LatLng(location.lat, location.lng));
    pathPolyline.setLatLngs(path);
    map.panTo(new L.LatLng(location.lat, location.lng));
}

// Check Danger Zones
function checkDangerZones(location, speed) {
    const speedThreshold = parseFloat(document.getElementById('speedThreshold').value);

    // Check if speed exceeds threshold
    if (speed > speedThreshold) {
        addAlert(`⚠️ Speed Alert: You are running at ${speed.toFixed(1)} km/h!`, 'warning');
        triggerVibration([100, 50, 100]);
        triggerSound('warning');
    }

    // Check for steep terrain (simulated based on elevation changes)
    if (trackerState.elevations.length > 0) {
        const recentElevation = trackerState.elevations.slice(-5);
        const avgElevationChange = recentElevation.reduce((a, b) => a + b, 0) / recentElevation.length;
        
        if (avgElevationChange > 10) {
            addAlert('⚠️ Steep Terrain Detected - Be careful!', 'warning');
        }
    }

    // Simulate checking for hazards (in real app, would use APIs or database)
    checkSimulatedHazards(location);
}

// Check Simulated Hazards
function checkSimulatedHazards(location) {
    // These are predefined danger zones (in production, would use APIs)
    const dangerZoneList = [
        { lat: 40.7128, lng: -74.0060, radius: 0.1, name: 'Heavy Traffic Area' },
        { lat: 40.7580, lng: -73.9855, radius: 0.15, name: 'Construction Zone' },
        { lat: 40.7489, lng: -73.9680, radius: 0.08, name: 'Busy Intersection' }
    ];

    dangerZoneList.forEach(zone => {
        const distance = calculateDistance(location, { lat: zone.lat, lng: zone.lng });
        if (distance < zone.radius && distance > 0) {
            addAlert(`🚨 Danger: ${zone.name} ahead!`, 'danger');
            triggerVibration([200, 100, 200, 100, 200]);
            triggerSound('danger');
        }
    });
}

// Start Run
function startRun() {
    trackerState.isRunning = true;
    trackerState.isPaused = false;
    trackerState.startTime = Date.now() - trackerState.totalPausedDuration;
    trackerState.locations = [];
    trackerState.distances = [];
    trackerState.speeds = [];
    trackerState.elevations = [];
    trackerState.maxSpeed = 0;
    trackerState.alerts = [];

    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('stopBtn').disabled = false;

    if (isGoogleMaps()) {
        pathPolyline.setPath([]);
    } else {
        pathPolyline.setLatLngs([]);
    }
    clearAlerts();

    showToast('🏃 Run started!', 'success');
    startTimer();
}

// Pause Run
function pauseRun() {
    trackerState.isPaused = true;
    trackerState.pausedTime = Date.now();

    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('resumeBtn').disabled = false;

    showToast('⏸️ Run paused', 'warning');
}

// Resume Run
function resumeRun() {
    trackerState.isPaused = false;
    trackerState.totalPausedDuration += Date.now() - trackerState.pausedTime;

    document.getElementById('resumeBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;

    showToast('▶️ Run resumed', 'success');
}

// Stop Run
function stopRun() {
    trackerState.isRunning = false;
    trackerState.isPaused = false;

    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('resumeBtn').disabled = true;
    document.getElementById('stopBtn').disabled = true;

    // Save run data
    trackerState.runData.endTime = Date.now();
    trackerState.runData.totalDistance = trackerState.distances.reduce((a, b) => a + b, 0);
    trackerState.runData.totalTime = trackerState.runData.endTime - trackerState.startTime;
    trackerState.runData.avgSpeed = trackerState.speeds.length > 0 ? 
        trackerState.speeds.reduce((a, b) => a + b, 0) / trackerState.speeds.length : 0;
    trackerState.runData.maxSpeed = trackerState.maxSpeed;

    showToast('⏹️ Run stopped!', 'warning');
}

// Clear Route
function clearRoute() {
    if (isGoogleMaps()) {
        pathPolyline.setPath([]);
    } else {
        pathPolyline.setLatLngs([]);
    }
    trackerState.locations = [];
    trackerState.distances = [];
    trackerState.speeds = [];
    clearAlerts();
    updateDisplay();
    showToast('🗑️ Route cleared', 'success');
}

// Start Timer
function startTimer() {
    const timerInterval = setInterval(() => {
        if (!trackerState.isRunning) {
            clearInterval(timerInterval);
            return;
        }

        updateDisplay();
    }, 1000);
}

// Update Display
function updateDisplay() {
    const totalDistance = trackerState.distances.reduce((a, b) => a + b, 0);
    const totalTime = Date.now() - trackerState.startTime;
    const timeSeconds = Math.floor(totalTime / 1000);
    const hours = Math.floor(timeSeconds / 3600);
    const minutes = Math.floor((timeSeconds % 3600) / 60);
    const seconds = timeSeconds % 60;

    const currentSpeed = trackerState.speeds.length > 0 ? 
        trackerState.speeds[trackerState.speeds.length - 1] : 0;
    
    const avgSpeed = trackerState.speeds.length > 0 ? 
        trackerState.speeds.reduce((a, b) => a + b, 0) / trackerState.speeds.length : 0;

    const pace = totalDistance > 0 ? ((totalTime / 1000) / 60) / totalDistance : 0;
    const paceMinutes = Math.floor(pace);
    const paceSeconds = Math.floor((pace % 1) * 60);

    const totalMeters = Math.round(totalDistance * 1000);
    const calories = calculateCalories(totalDistance);

    // Update UI
    document.getElementById('distance').textContent = totalDistance.toFixed(2);
    document.getElementById('meters').textContent = totalMeters + ' m';
    document.getElementById('time').textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('speed').textContent = currentSpeed.toFixed(1);
    document.getElementById('pace').textContent = 
        `${String(paceMinutes).padStart(2, '0')}:${String(paceSeconds).padStart(2, '0')}`;
    
    document.getElementById('avgSpeed').textContent = avgSpeed.toFixed(1) + ' km/h';
    document.getElementById('maxSpeed').textContent = trackerState.maxSpeed.toFixed(1) + ' km/h';
    document.getElementById('calories').textContent = Math.round(calories);
    
    const totalElevation = trackerState.elevations.reduce((a, b) => a + b, 0);
    document.getElementById('elevation').textContent = Math.round(totalElevation) + ' m';
    
    document.getElementById('pointCount').textContent = trackerState.locations.length;
    document.getElementById('routeDuration').textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Calculate Calories (approximation)
function calculateCalories(distanceKm) {
    // Average calorie burn: ~70 calories per km
    return distanceKm * 70;
}

// Add Alert
function addAlert(message, type = 'danger') {
    const alert = {
        id: Date.now(),
        message: message,
        type: type,
        time: new Date().toLocaleTimeString()
    };

    trackerState.alerts.push(alert);

    const alertsList = document.getElementById('alertsList');
    if (alertsList.querySelector('.no-alerts')) {
        alertsList.innerHTML = '';
    }

    const alertItem = document.createElement('div');
    alertItem.className = `alert-item ${type}`;
    alertItem.id = `alert-${alert.id}`;
    alertItem.innerHTML = `
        <div class="alert-time">${alert.time}</div>
        <div class="alert-message">${message}</div>
    `;

    alertsList.insertBefore(alertItem, alertsList.firstChild);

    // Remove after 10 seconds
    setTimeout(() => {
        const element = document.getElementById(`alert-${alert.id}`);
        if (element) {
            element.remove();
        }
        if (alertsList.children.length === 0) {
            alertsList.innerHTML = '<p class="no-alerts">No active alerts</p>';
        }
    }, 10000);
}

// Clear Alerts
function clearAlerts() {
    document.getElementById('alertsList').innerHTML = '<p class="no-alerts">No active alerts</p>';
    trackerState.alerts = [];
}

// Trigger Vibration
function triggerVibration(pattern) {
    if (document.getElementById('vibrationToggle').checked && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

// Trigger Sound
function triggerSound(type) {
    if (!document.getElementById('soundToggle').checked) return;

    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'warning') {
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } else if (type === 'danger') {
            oscillator.frequency.value = 1200;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }
    } catch (e) {
        console.log('Audio not available');
    }
}

// Handle Alert Toggle
function handleAlertToggle(e) {
    showToast(e.target.checked ? '✅ Alerts enabled' : '❌ Alerts disabled', 'success');
}

// Handle Vibration Toggle
function handleVibrationToggle(e) {
    showToast(e.target.checked ? '📳 Vibration enabled' : '📴 Vibration disabled', 'success');
}

// Handle Sound Toggle
function handleSoundToggle(e) {
    showToast(e.target.checked ? '🔊 Sound enabled' : '🔇 Sound disabled', 'success');
}

// Save Run
function saveRun() {
    if (trackerState.locations.length === 0) {
        showToast('No run data to save', 'warning');
        return;
    }

    const runData = {
        ...trackerState.runData,
        date: new Date().toISOString(),
        locations: trackerState.locations,
        alerts: trackerState.alerts
    };

    let savedRuns = JSON.parse(localStorage.getItem('runHistory')) || [];
    savedRuns.push(runData);
    localStorage.setItem('runHistory', JSON.stringify(savedRuns));

    loadRunHistory();
    showToast('💾 Run saved successfully!', 'success');
}

// Share Run
function shareRun() {
    if (trackerState.locations.length === 0) {
        showToast('No run data to share', 'warning');
        return;
    }

    const totalDistance = trackerState.runData.totalDistance.toFixed(2);
    const totalTime = Math.floor(trackerState.runData.totalTime / 1000);
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    const seconds = totalTime % 60;

    const shareText = `🏃 I just completed a run! 
Distance: ${totalDistance} km
Time: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}
Avg Speed: ${trackerState.runData.avgSpeed.toFixed(1)} km/h
Max Speed: ${trackerState.runData.maxSpeed.toFixed(1)} km/h`;

    if (navigator.share) {
        navigator.share({
            title: 'My Running Tracker Run',
            text: shareText
        }).catch(err => console.log('Error sharing:', err));
    } else {
        alert(shareText);
    }

    showToast('📤 Run shared!', 'success');
}

// Download GPX
function downloadGPX() {
    if (trackerState.locations.length === 0) {
        showToast('No route data to download', 'warning');
        return;
    }

    let gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Running Tracker">
  <metadata>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>Running Track</name>
    <trkseg>`;

    trackerState.locations.forEach(loc => {
        gpxContent += `
      <trkpt lat="${loc.lat}" lon="${loc.lng}">
        <ele>${loc.altitude}</ele>
        <time>${new Date(loc.time).toISOString()}</time>
      </trkpt>`;
    });

    gpxContent += `
    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `run-${Date.now()}.gpx`;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast('📥 GPX file downloaded!', 'success');
}

// Load Run History
function loadRunHistory() {
    const savedRuns = JSON.parse(localStorage.getItem('runHistory')) || [];
    const historyContainer = document.getElementById('runHistory');

    if (savedRuns.length === 0) {
        historyContainer.innerHTML = '<p class="no-data">No runs recorded yet</p>';
        return;
    }

    historyContainer.innerHTML = savedRuns.slice(-5).reverse().map(run => `
        <div class="run-item">
            <div class="run-item-header">
                <span>${new Date(run.date).toLocaleDateString()}</span>
                <span class="run-item-date">${new Date(run.date).toLocaleTimeString()}</span>
            </div>
            <div class="run-item-stats">
                <span>📏 ${run.totalDistance.toFixed(2)} km</span>
                <span>⏱️ ${Math.floor(run.totalTime / 60000)} min</span>
                <span>🏃 ${run.avgSpeed.toFixed(1)} km/h</span>
            </div>
        </div>
    `).join('');
}

// Show Toast Notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Update Last Updated
function updateLastUpdated() {
    const now = new Date();
    document.getElementById('lastUpdated').textContent = `Last updated: ${now.toLocaleTimeString()}`;
}

// Handle Page Visibility
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && trackerState.isRunning) {
        updateDisplay();
    }
});
