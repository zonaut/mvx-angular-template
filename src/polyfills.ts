import 'zone.js';
import { Buffer } from 'buffer';

(window as any).global = window;
window.Buffer = Buffer;
