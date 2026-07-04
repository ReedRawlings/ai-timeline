/**
 * app.js — Main entry point for the AI Timeline SPA.
 * Loads event data, renders the Atlas + Dispatch timeline, initializes charts.
 */
import '../css/main.css';
import { initAtlasDispatch } from './atlas-dispatch.js';
import { initChartTabs } from './chart-tabs.js';
import { initStockChart } from './stock-chart.js';
import { initLayoffChart } from './layoff-chart.js';
import events from '../data/events.json';
import layoffs from '../data/layoffs.json';

// Render the Atlas strip + Dispatch pane from event data
initAtlasDispatch(events);

// Initialize chart tab switching (Stocks / Layoffs)
initChartTabs();

// Initialize stock chart with event markers
initStockChart(events);

// Initialize layoff chart from the standalone layoffs dataset
initLayoffChart(layoffs);
