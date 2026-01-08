/**
 * Codex / Collection Book - Track all discoveries
 * Persists in meta save across runs
 */

export type CodexCategory = 
  | 'enemies' 
  | 'mutators' 
  | 'affixes' 
  | 'decrees' 
  | 'biomes' 
  | 'signatures' 
  | 'weapons' 
  | 'armor';

export interface CodexEntry {
  id: string;
  category: CodexCategory;
  name: string;
  icon: string;
  description: string;
  rarity?: string;
  discoveredAt?: number;  // Timestamp
}

export interface CodexProgress {
  [category: string]: {
    discovered: string[];  // Entry IDs
    total: number;
  };
}

// Helper to generate codex entries from existing data
export function generateCodexEntries(): Map<CodexCategory, CodexEntry[]> {
  const entries = new Map<CodexCategory, CodexEntry[]>();
  
  // These would be populated from the actual data files
  // For now, provide a structure that can be filled
  
  entries.set('enemies', []);
  entries.set('mutators', []);
  entries.set('affixes', []);
  entries.set('decrees', []);
  entries.set('biomes', []);
  entries.set('signatures', []);
  entries.set('weapons', []);
  entries.set('armor', []);
  
  return entries;
}

export function getCodexProgress(discovered: string[], total: number): number {
  if (total === 0) return 0;
  return Math.round((discovered.length / total) * 100);
}

export function getCategoryIcon(category: CodexCategory): string {
  const icons: Record<CodexCategory, string> = {
    enemies: '💀',
    mutators: '🧬',
    affixes: '✨',
    decrees: '📜',
    biomes: '🏛️',
    signatures: '⚡',
    weapons: '⚔️',
    armor: '🛡️'
  };
  return icons[category] || '📖';
}

export function getCategoryName(category: CodexCategory): string {
  const names: Record<CodexCategory, string> = {
    enemies: 'Enemy Classes',
    mutators: 'Enemy Mutators',
    affixes: 'Item Affixes',
    decrees: 'Arena Decrees',
    biomes: 'Arena Biomes',
    signatures: 'Signature Moves',
    weapons: 'Weapons',
    armor: 'Armor'
  };
  return names[category] || category;
}
