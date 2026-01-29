// main.js - Main entry point for the application
// UPDATED VERSION - ar async data loading support

import { audioManager } from './audio.js';
import { uiManager } from './ui.js';

// Initialize the application
console.log('🚀 Application starting...');

// Make managers globally accessible
window.audioManager = audioManager;
window.uiManager = uiManager;

// ASYNC initialization function
async function initializeApp() {
    try {
        console.log('⏳ Waiting for audio data to load...');
        
        // Gaidām, kamēr dati ir ielādēti
        await audioManager.waitForData();
        
        console.log('✅ Audio data loaded successfully!');
        console.log('📋 Available kadrils:', Object.keys(audioManager.kadrils).length);
        
        // Tagad drošī ielādēt dziesmu sarakstu
        console.log('🎵 Loading song list...');
        uiManager.loadSongList();
        
        console.log('✅ All managers loaded successfully!');
        
    } catch (error) {
        console.error('❌ Error initializing application:', error);
        uiManager.updateSystemLog(`Initialization error: ${error.message}`);
    }
}

// Sākam inicializāciju
initializeApp();
