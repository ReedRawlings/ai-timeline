/**
 * app.js — Main entry point for the AI Timeline SPA.
 * Loads event data, renders the timeline, initializes interactions and charts.
 */
import '../css/main.css';
import { renderTimeline } from './render-timeline.js';
import { initTimeline, initChartTabs, initEventPopover } from './main.js';
import { initStockChart } from './stock-chart.js';
import { initLayoffChart } from './layoff-chart.js';
import events from '../data/events.json';
import layoffs from '../data/layoffs.json';

// Render timeline DOM from event data
renderTimeline(events);

// Initialize timeline interactions (filters, keyboard nav, grouping, etc.)
initTimeline();

// Initialize chart tab switching (Stocks / Layoffs)
initChartTabs();

// Initialize hover tooltip + click popover
initEventPopover();

// Initialize stock chart with event markers
initStockChart(events);

// Initialize layoff chart from the standalone layoffs dataset
initLayoffChart(layoffs);
