import type { SeverityLevel, IncidentCategory, IncidentRecord } from '../types';

export function getSeverityColor(severity: SeverityLevel): string {
  switch (severity) {
    case 'CRITICAL_EMERGENCY': return '#EF4444';
    case 'WARNING': return '#F59E0B';
    case 'WATCH': return '#8B5CF6';
    case 'ADVISORY': return '#06B6D4';
  }
}

export function getSeverityGlow(severity: SeverityLevel): string {
  switch (severity) {
    case 'CRITICAL_EMERGENCY': return 'rgba(239,68,68,0.5)';
    case 'WARNING': return 'rgba(245,158,11,0.5)';
    case 'WATCH': return 'rgba(139,92,246,0.5)';
    case 'ADVISORY': return 'rgba(6,182,212,0.5)';
  }
}

export function getSeverityLabel(severity: SeverityLevel): string {
  switch (severity) {
    case 'CRITICAL_EMERGENCY': return 'CRITICAL';
    case 'WARNING': return 'WARNING';
    case 'WATCH': return 'WATCH';
    case 'ADVISORY': return 'ADVISORY';
  }
}

export function getCategoryLabel(category: IncidentCategory): string {
  switch (category) {
    case 'NATURAL_DISASTER': return 'Natural Disaster';
    case 'CIVIC_UTILITY': return 'Civic Utility';
    case 'INFRASTRUCTURE': return 'Infrastructure';
    case 'PUBLIC_SAFETY': return 'Public Safety';
  }
}

export function getCategoryIcon(category: IncidentCategory): string {
  switch (category) {
    case 'NATURAL_DISASTER': return '🌊';
    case 'CIVIC_UTILITY': return '⚡';
    case 'INFRASTRUCTURE': return '🚧';
    case 'PUBLIC_SAFETY': return '🚨';
  }
}

export function formatPopulation(n: number): string {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function getStatusColor(status: IncidentRecord['status']): string {
  switch (status) {
    case 'ACTIVE': return '#EF4444';
    case 'EVALUATING': return '#F59E0B';
    case 'CONTAINED': return '#8B5CF6';
    case 'RESOLVED': return '#10B981';
  }
}

export function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function getThreatLevelLabel(index: number): { label: string; color: string } {
  if (index >= 75) return { label: 'CRITICAL', color: '#EF4444' };
  if (index >= 50) return { label: 'HIGH', color: '#F59E0B' };
  if (index >= 25) return { label: 'MODERATE', color: '#8B5CF6' };
  return { label: 'LOW', color: '#10B981' };
}
