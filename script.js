// Phone Control Dashboard - JavaScript

// Initialize all elements and event listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    updateDeviceInfo();
    setupEventListeners();
    setupBatteryMonitoring();
    setupNetworkMonitoring();
    setupOrientationMonitoring();
});

// Initialize the application
function initializeApp() {
    console.log('Phone Control Dashboard initialized');
    loadSavedSettings();
    updateLastUpdated();
}

// Setup all event listeners
function setupEventListeners() {
    // Brightness control
    document.getElementById('brightnessSlider').addEventListener('input', handleBrightnessChange);

    // Volume control
    document.getElementById('volumeSlider').addEventListener('input', handleVolumeChange);

    // Flashlight toggle
    document.getElementById('toggleFlashlight').addEventListener('click', toggleFlashlight);

    // Sound mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', handleSoundModeChange);
    });

    // Device settings toggles
    document.getElementById('airplaneMode').addEventListener('change', handleSettingChange);
    document.getElementById('mobileData').addEventListener('change', handleSettingChange);
    document.getElementById('wifi').addEventListener('change', handleSettingChange);
    document.getElementById('bluetooth').addEventListener('change', handleSettingChange);
    document.getElementById('autoRotate').addEventListener('change', handleSettingChange);
    document.getElementById('darkMode').addEventListener('change', toggleDarkMode);

    // Action buttons
    document.getElementById('vibrateBtn').addEventListener('click', vibrateDevice);
    document.getElementById('screenshotBtn').addEventListener('click', takeScreenshot);
    document.getElementById('lockScreenBtn').addEventListener('click', lockScreen);

    // Quick actions
    document.getElementById('callEmergency').addEventListener('click', callEmergency);
    document.getElementById('openCamera').addEventListener('click', openCamera);
    document.getElementById('openSettings').addEventListener('click', openSettings);
    document.getElementById('openGallery').addEventListener('click', openGallery);

    // Screen timeout
    document.getElementById('screenTimeout').addEventListener('change', handleScreenTimeout);
}

// Update device information
function updateDeviceInfo() {
    const userAgent = navigator.userAgent;
    let deviceInfo = 'Web Browser';

    if (/Android/i.test(userAgent)) {
        deviceInfo = 'Android Device';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
        deviceInfo = 'iOS Device';
    } else if (/Windows Phone/i.test(userAgent)) {
        deviceInfo = 'Windows Phone';
    }

    document.getElementById('deviceInfo').textContent = deviceInfo;

    // Update battery info if available
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => updateBatteryStatus(battery));
    } else if ('battery' in navigator) {
        updateBatteryStatus(navigator.battery);
    } else {
        // Simulate battery info
        updateBatteryStatus({
            level: 0.8,
            charging: true,
            chargingTime: 3600,
            dischargingTime: 7200
        });
    }
}

// Setup battery monitoring
function setupBatteryMonitoring() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            updateBatteryStatus(battery);
            battery.onlevelchange = () => updateBatteryStatus(battery);
            battery.onchargingchange = () => updateBatteryStatus(battery);
        });
    } else {
        // Simulate battery updates every 5 minutes
        setInterval(() => {
            const simulated = {
                level: Math.random() * 100 / 100,
                charging: Math.random() > 0.5,
                chargingTime: 3600,
                dischargingTime: 7200
            };
            updateBatteryStatus(simulated);
        }, 300000);
    }
}

// Update battery status display
function updateBatteryStatus(battery) {
    const level = Math.round(battery.level * 100);
    const charging = battery.charging ? ' 🔌' : '';
    const status = charging ? 'Charging' : 'Discharging';

    document.getElementById('batteryLevel').textContent = `${level}% - ${status}`;
    document.getElementById('batteryFill').style.width = `${level}%`;

    if (level > 66) {
        document.getElementById('batteryFill').style.background = 
            'linear-gradient(90deg, #10b981, #34d399)';
    } else if (level > 33) {
        document.getElementById('batteryFill').style.background = 
            'linear-gradient(90deg, #f59e0b, #fbbf24)';
    } else {
        document.getElementById('batteryFill').style.background = 
            'linear-gradient(90deg, #ef4444, #fca5a5)';
    }

    saveSettings();
}

// Setup network monitoring
function setupNetworkMonitoring() {
    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
}

// Update network status
function updateNetworkStatus() {
    const online = navigator.onLine;
    const status = online ? 'Online' : 'Offline';
    const statusElement = document.getElementById('networkStatus');
    
    statusElement.textContent = status;
    statusElement.className = online ? 'status-online' : 'status-offline';
}

// Setup orientation monitoring
function setupOrientationMonitoring() {
    updateOrientation();
    window.addEventListener('orientationchange', updateOrientation);
    window.addEventListener('resize', updateOrientation);
}

// Update orientation display
function updateOrientation() {
    const orientation = window.innerHeight > window.innerWidth ? 'Portrait' : 'Landscape';
    document.getElementById('orientation').textContent = orientation;
}

// Handle brightness change
function handleBrightnessChange(e) {
    const value = e.target.value;
    document.getElementById('brightnessValue').textContent = value + '%';
    
    // Apply brightness to the page as demo
    document.body.style.filter = `brightness(${100 + (value - 80) * 0.5}%)`;
    
    showNotification(`Brightness set to ${value}%`);
    saveSettings();
}

// Handle volume change
function handleVolumeChange(e) {
    const value = e.target.value;
    document.getElementById('volumeValue').textContent = value + '%';
    playVolumeIndicator(value);
    showNotification(`Volume set to ${value}%`);
    saveSettings();
}

// Play volume indicator sound
function playVolumeIndicator(volume) {
    // Create a simple beep using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 400 + (volume / 100) * 400;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.log('Audio context not available');
    }
}

// Toggle flashlight
function toggleFlashlight() {
    const btn = document.getElementById('toggleFlashlight');
    const isActive = btn.classList.contains('active');

    if (!isActive) {
        btn.classList.add('active');
        btn.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
        document.body.style.filter = 'brightness(150%)';
        showNotification('🔦 Flashlight ON');
    } else {
        btn.classList.remove('active');
        btn.style.background = '';
        const brightness = document.getElementById('brightnessSlider').value;
        document.body.style.filter = `brightness(${100 + (brightness - 80) * 0.5}%)`;
        showNotification('🔦 Flashlight OFF');
    }
    saveSettings();
}

// Handle sound mode change
function handleSoundModeChange(e) {
    const mode = e.target.dataset.mode;
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');

    const modeText = {
        'sound': '🔊 Sound Mode',
        'vibrate': '📳 Vibrate Mode',
        'silent': '🔇 Silent Mode'
    };

    showNotification(modeText[mode]);
    saveSettings();
}

// Handle general settings change
function handleSettingChange(e) {
    const settingName = e.target.id;
    const isEnabled = e.target.checked;

    const settingText = {
        'airplaneMode': isEnabled ? 'Airplane Mode ON' : 'Airplane Mode OFF',
        'mobileData': isEnabled ? 'Mobile Data ON' : 'Mobile Data OFF',
        'wifi': isEnabled ? 'WiFi ON' : 'WiFi OFF',
        'bluetooth': isEnabled ? 'Bluetooth ON' : 'Bluetooth OFF',
        'autoRotate': isEnabled ? 'Auto-rotate ON' : 'Auto-rotate OFF'
    };

    if (settingText[settingName]) {
        showNotification(settingText[settingName]);
    }

    saveSettings();
}

// Toggle dark mode
function toggleDarkMode(e) {
    const isDarkMode = e.target.checked;
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode-enabled');
        showNotification('🌙 Dark Mode ON');
    } else {
        document.body.classList.remove('dark-mode-enabled');
        showNotification('☀️ Light Mode ON');
    }
    
    saveSettings();
}

// Vibrate device
function vibrateDevice() {
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
        showNotification('📳 Vibrating...');
    } else {
        showNotification('Vibration not supported');
    }
}

// Take screenshot
function takeScreenshot() {
    showNotification('📸 Screenshot taken!');
    // Simulate screenshot action
    setTimeout(() => {
        html2canvas(document.body).catch(() => {
            console.log('Screenshot simulation - in production, use native API');
        });
    }, 500);
}

// Lock screen
function lockScreen() {
    showNotification('🔐 Screen locked');
    // Simulate screen lock
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        z-index: 10000;
        cursor: pointer;
    `;
    backdrop.textContent = '🔒';
    backdrop.addEventListener('click', () => backdrop.remove());
    document.body.appendChild(backdrop);
}

// Emergency call
function callEmergency() {
    showNotification('☎️ Emergency call dialing...');
    // In real app, would trigger native dialer
}

// Open camera
function openCamera() {
    showNotification('📷 Opening camera...');
    // In real app, would trigger camera
}

// Open settings
function openSettings() {
    showNotification('⚙️ Opening settings...');
    // In real app, would open device settings
}

// Open gallery
function openGallery() {
    showNotification('🖼️ Opening gallery...');
    // In real app, would open gallery
}

// Handle screen timeout
function handleScreenTimeout(e) {
    const timeout = e.target.value;
    showNotification(`Screen timeout set to ${e.target.options[e.target.selectedIndex].text}`);
    saveSettings();
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #6366f1, #ec4899);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        font-weight: 600;
        max-width: 300px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        brightness: document.getElementById('brightnessSlider').value,
        volume: document.getElementById('volumeSlider').value,
        soundMode: document.querySelector('.mode-btn.active')?.dataset.mode || 'sound',
        airplaneMode: document.getElementById('airplaneMode').checked,
        mobileData: document.getElementById('mobileData').checked,
        wifi: document.getElementById('wifi').checked,
        bluetooth: document.getElementById('bluetooth').checked,
        autoRotate: document.getElementById('autoRotate').checked,
        darkMode: document.getElementById('darkMode').checked,
        screenTimeout: document.getElementById('screenTimeout').value,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('phoneControlSettings', JSON.stringify(settings));
}

// Load saved settings from localStorage
function loadSavedSettings() {
    const saved = localStorage.getItem('phoneControlSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        
        document.getElementById('brightnessSlider').value = settings.brightness || 80;
        document.getElementById('brightnessValue').textContent = (settings.brightness || 80) + '%';
        
        document.getElementById('volumeSlider').value = settings.volume || 70;
        document.getElementById('volumeValue').textContent = (settings.volume || 70) + '%';
        
        if (settings.soundMode) {
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.mode === settings.soundMode) {
                    btn.classList.add('active');
                }
            });
        }
        
        document.getElementById('airplaneMode').checked = settings.airplaneMode || false;
        document.getElementById('mobileData').checked = settings.mobileData !== false;
        document.getElementById('wifi').checked = settings.wifi !== false;
        document.getElementById('bluetooth').checked = settings.bluetooth || false;
        document.getElementById('autoRotate').checked = settings.autoRotate !== false;
        document.getElementById('darkMode').checked = settings.darkMode || false;
        document.getElementById('screenTimeout').value = settings.screenTimeout || '60';
        
        if (settings.darkMode) {
            document.body.classList.add('dark-mode-enabled');
        }
    }
}

// Update last updated timestamp
function updateLastUpdated() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('lastUpdated').textContent = `Last updated: ${timeString}`;
}

// Simulate system storage and memory usage
setInterval(() => {
    const storageUsed = Math.random() * 128;
    const memoryUsed = Math.random() * 8;
    
    document.getElementById('storageValue').textContent = storageUsed.toFixed(1) + ' GB';
    document.getElementById('memoryValue').textContent = memoryUsed.toFixed(1) + ' GB';
    
    const storageFill = (storageUsed / 128) * 100;
    const memoryFill = (memoryUsed / 8) * 100;
    
    document.getElementById('storageFill').style.width = storageFill + '%';
    document.getElementById('memoryFill').style.width = memoryFill + '%';
    
    updateLastUpdated();
}, 5000);

// Add CSS animation styles dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(400px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(400px);
        }
    }
`;
document.head.appendChild(style);

// Handle visibility change to update data periodically
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        updateDeviceInfo();
        updateLastUpdated();
    }
});
