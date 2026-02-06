/**
 * app.js — Main entry point for the AI Timeline SPA.
 * Loads event data, renders the timeline, initializes interactions and stock chart.
 */
import '../css/main.css';
import { renderTimeline } from './render-timeline.js';
import { initTimeline } from './main.js';
import { initStockChart } from './stock-chart.js';
import events from '../data/events.json';

// Render timeline DOM from event data
renderTimeline(events);

// Initialize all timeline interactions (filters, overlays, keyboard nav, etc.)
initTimeline();

// Initialize stock chart with event markers
initStockChart(events);
