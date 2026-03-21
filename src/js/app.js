/**
 * app.js — Main entry point for the AI Timeline SPA.
 * Loads event data, renders the timeline, initializes interactions and charts.
 */
import '../css/main.css';
import { renderTimeline } from './render-timeline.js';
import { initTimeline, initChartTabs, initEventDrawer } from './main.js';
import { initStockChart } from './stock-chart.js';
import { initLayoffChart } from './layoff-chart.js';
import events from '../data/events.json';

// Render timeline DOM from event data
renderTimeline(events);

// Initialize timeline interactions (filters, keyboard nav, grouping, etc.)
initTimeline();

// Initialize chart tab switching (Stocks / Layoffs)
initChartTabs();

// Initialize event drawer (replaces hover portal overlay)
initEventDrawer();

// Initialize stock chart with event markers
initStockChart(events);

// Initialize layoff chart (renders when Layoffs tab is visible)
initLayoffChart(events);
