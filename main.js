// main.js - Main entry point for the application

import { audioManager } from './audio.js';
import { uiManager } from './ui.js';

// Initialize the application
console.log('Application initialized');
console.log('Audio manager loaded:', audioManager);
console.log('UI manager loaded:', uiManager);

// Make managers globally accessible
window.audioManager = audioManager;
window.uiManager = uiManager;

// Log when everything is ready
console.log('All managers loaded successfully!');
console.log('Available kadrils:', Object.keys(audioManager.kadrils));
