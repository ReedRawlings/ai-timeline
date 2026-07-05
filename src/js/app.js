/**
 * app.js — Entry point for the Timeline page (index.html).
 * Loads event data and renders the Atlas + Dispatch timeline.
 * The Layoffs and Stocks trackers now live on their own pages
 * (layoffs.html / stocks.html), each with its own entry module.
 */
import '../css/main.css';
import { initAtlasDispatch } from './atlas-dispatch.js';
import events from '../data/events.json';

// Render the Atlas strip + Dispatch pane from event data
initAtlasDispatch(events);
