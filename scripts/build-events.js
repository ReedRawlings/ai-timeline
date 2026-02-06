#!/usr/bin/env node
/**
 * Build script: converts data/events.yaml → src/data/events.json
 * Run before Vite dev/build so the app can import event data as JSON.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const yamlPath = resolve(root, 'data/events.yaml');
const outDir = resolve(root, 'src/data');
const outPath = resolve(outDir, 'events.json');

mkdirSync(outDir, { recursive: true });

const raw = readFileSync(yamlPath, 'utf-8');
const events = yaml.load(raw);

// Sort by date ascending
events.sort((a, b) => new Date(a.date) - new Date(b.date));

writeFileSync(outPath, JSON.stringify(events, null, 2));
console.log(`✅ Built ${events.length} events → src/data/events.json`);
