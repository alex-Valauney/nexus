// src/test.ts - Initialise l'environnement de test
import 'zone.js/testing';  // Nécessaire pour Angular
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Initialise l'environnement de test Angular
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Définit le contexte pour require.context
// const context = require.context('./', true, /\.spec\.ts$/);

// Charge tous les fichiers de test
// context.keys().forEach(context);