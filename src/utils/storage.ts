import { Incident } from '../types';
import { SAMPLE_INCIDENTS } from '../data/sampleIncidents';

const STORAGE_KEY_INCIDENTS = 'disastertree_incidents_v1';
const STORAGE_KEY_INGESTION_COUNT = 'disastertree_ingestion_count_v1';
const STORAGE_KEY_LATENCY_HISTORY = 'disastertree_latency_history_v1';

export function getStoredIncidents(): Incident[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INCIDENTS);
    if (!raw) {
      // Preload the 10 sample records
      localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(SAMPLE_INCIDENTS));
      return SAMPLE_INCIDENTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return SAMPLE_INCIDENTS;
    }
    return parsed;
  } catch (e) {
    console.error('Error loading incidents from localStorage', e);
    return SAMPLE_INCIDENTS;
  }
}

export function saveStoredIncidents(incidents: Incident[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(incidents));
  } catch (e) {
    console.error('Error saving incidents to localStorage', e);
  }
}

export function addIncident(newIncident: Incident): Incident[] {
  const current = getStoredIncidents();
  const updated = [newIncident, ...current];
  saveStoredIncidents(updated);
  incrementIngestionCount();
  return updated;
}

export function updateIncidentStatus(
  id: string,
  status: Incident['status'],
  assignedCrew?: string
): Incident[] {
  const current = getStoredIncidents();
  const updated = current.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        status,
        ...(assignedCrew ? { assignedCrew, dispatchTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : {}),
      };
    }
    return item;
  });
  saveStoredIncidents(updated);
  return updated;
}

export function getIngestionCount(): number {
  try {
    const count = localStorage.getItem(STORAGE_KEY_INGESTION_COUNT);
    if (!count) {
      // Default to the 10 sample records count
      const initial = 10;
      localStorage.setItem(STORAGE_KEY_INGESTION_COUNT, initial.toString());
      return initial;
    }
    return parseInt(count, 10) || 10;
  } catch (e) {
    return 10;
  }
}

export function incrementIngestionCount(): void {
  try {
    const current = getIngestionCount();
    localStorage.setItem(STORAGE_KEY_INGESTION_COUNT, (current + 1).toString());
  } catch (e) {
    // Ignore
  }
}

export function recordAiLatency(ms: number): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LATENCY_HISTORY);
    const history: number[] = raw ? JSON.parse(raw) : [1420, 1850, 1610];
    history.push(ms);
    if (history.length > 20) history.shift();
    localStorage.setItem(STORAGE_KEY_LATENCY_HISTORY, JSON.stringify(history));
  } catch (e) {
    // Ignore
  }
}

export function getAverageAiLatencyMs(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LATENCY_HISTORY);
    const history: number[] = raw ? JSON.parse(raw) : [1420, 1850, 1610];
    if (history.length === 0) return 1620;
    const sum = history.reduce((a, b) => a + b, 0);
    return Math.round(sum / history.length);
  } catch (e) {
    return 1620;
  }
}

export function resetToSampleData(): Incident[] {
  try {
    localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(SAMPLE_INCIDENTS));
    localStorage.setItem(STORAGE_KEY_INGESTION_COUNT, '10');
    return SAMPLE_INCIDENTS;
  } catch (e) {
    return SAMPLE_INCIDENTS;
  }
}

export function clearAllData(): Incident[] {
  try {
    localStorage.removeItem(STORAGE_KEY_INCIDENTS);
    localStorage.setItem(STORAGE_KEY_INGESTION_COUNT, '0');
    return [];
  } catch (e) {
    return [];
  }
}
