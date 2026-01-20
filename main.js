// main.js - Main entry point for the application

import { audioManager } from './audio.js';
import { uiManager } from './ui.js';

// Initialize the application
console.log('Application initialized');

// Make managers globally accessible FIRST
window.audioManager = audioManager;
window.uiManager = uiManager;

// NOW load the song list (after audioManager is available)
console.log('Loading song list...');
uiManager.loadSongList();

console.log('All managers loaded successfully!');
console.log('Available kadrils:', Object.keys(audioManager.kadrils));
