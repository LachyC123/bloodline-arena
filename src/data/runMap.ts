/**
 * Run Map - Branching path nodes for roguelite progression
 * Each league segment generates a map of connected nodes
 */

export type NodeType = 'fight' | 'elite' | 'shop' | 'clinic' | 'event' | 'forge' | 'rival' | 'champion';

export interface MapNode {
  id: string;
  type: NodeType;
  x: number;  // Position in the map (0-1)
  y: number;  // Row (0 = start, increases upward)
  connections: string[];  // Node IDs this connects to
  completed: boolean;
  biomeId?: string;
  contractIds?: string[];
  enemyId?: string;
  eventId?: string;
}

export interface RunMap {
  league: string;
  nodes: MapNode[];
  currentNodeId: string | null;
  startNodeIds: string[];
  bossNodeId: string;
}

// Node type configurations
export const NODE_CONFIGS: Record<NodeType, { icon: string; name: string; description: string }> = {
  fight: { icon: '⚔️', name: 'Fight', description: 'Standard arena battle' },
  elite: { icon: '💀', name: 'Elite Fight', description: 'Tough enemy, better rewards' },
  shop: { icon: '🛒', name: 'Merchant', description: 'Buy weapons, armor, items' },
  clinic: { icon: '🏥', name: 'Clinic', description: 'Heal wounds and injuries' },
  event: { icon: '❓', name: 'Event', description: 'A mysterious encounter' },
  forge: { icon: '🔥', name: 'Forge', description: 'Upgrade equipment' },
  rival: { icon: '👊', name: 'Rival', description: 'Face your nemesis' },
  champion: { icon: '👑', name: 'Champion', description: 'League boss battle' }
};

// League-specific generation parameters
const LEAGUE_PARAMS: Record<string, {
  rows: number;
  nodesPerRow: [number, number];
  eliteChance: number;
  shopCount: number;
  forgeCount: number;
  clinicCount: number;
  eventCount: number;
  hasRival: boolean;
}> = {
  bronze: {
    rows: 6,
    nodesPerRow: [2, 3],
    eliteChance: 0.15,
    shopCount: 1,
    forgeCount: 1,
    clinicCount: 1,
    eventCount: 1,
    hasRival: false
  },
  silver: {
    rows: 7,
    nodesPerRow: [2, 4],
    eliteChance: 0.20,
    shopCount: 2,
    forgeCount: 1,
    clinicCount: 1,
    eventCount: 2,
    hasRival: true
  },
  gold: {
    rows: 8,
    nodesPerRow: [3, 4],
    eliteChance: 0.25,
    shopCount: 2,
    forgeCount: 2,
    clinicCount: 2,
    eventCount: 2,
    hasRival: true
  },
  champion: {
    rows: 5,
    nodesPerRow: [2, 3],
    eliteChance: 0.40,
    shopCount: 1,
    forgeCount: 1,
    clinicCount: 1,
    eventCount: 1,
    hasRival: true
  }
};

/**
 * Generate a new run map for a league
 */
export function generateRunMap(league: string, seed?: number): RunMap {
  const params = LEAGUE_PARAMS[league] || LEAGUE_PARAMS.bronze;
  const rng = createSeededRng(seed || Date.now());
  
  const nodes: MapNode[] = [];
  let nodeIdCounter = 0;
  
  // Create rows of nodes
  const rows: string[][] = [];
  
  for (let row = 0; row < params.rows; row++) {
    const [minNodes, maxNodes] = params.nodesPerRow;
    const numNodes = minNodes + Math.floor(rng() * (maxNodes - minNodes + 1));
    const rowNodes: string[] = [];
    
    for (let i = 0; i < numNodes; i++) {
      const nodeId = `node_${nodeIdCounter++}`;
      const x = (i + 0.5) / numNodes;  // Evenly space horizontally
      
      // Determine node type
      let type: NodeType = 'fight';
      
      // Boss row is always champion
      if (row === params.rows - 1 && i === Math.floor(numNodes / 2)) {
        type = 'champion';
      } else if (row > 0 && row < params.rows - 1) {
        // Roll for elite
        if (rng() < params.eliteChance) {
          type = 'elite';
        }
      }
      
      nodes.push({
        id: nodeId,
        type,
        x,
        y: row,
        connections: [],
        completed: false
      });
      
      rowNodes.push(nodeId);
    }
    
    rows.push(rowNodes);
  }
  
  // Connect nodes between rows
  for (let row = 0; row < rows.length - 1; row++) {
    const currentRow = rows[row];
    const nextRow = rows[row + 1];
    
    currentRow.forEach((nodeId, i) => {
      const node = nodes.find(n => n.id === nodeId)!;
      
      // Connect to 1-2 nodes in next row
      const connectCount = 1 + (rng() > 0.5 ? 1 : 0);
      const possibleTargets = [...nextRow];
      
      for (let c = 0; c < connectCount && possibleTargets.length > 0; c++) {
        // Prefer nearby nodes
        const weights = possibleTargets.map(targetId => {
          const target = nodes.find(n => n.id === targetId)!;
          const dist = Math.abs(target.x - node.x);
          return 1 - dist * 0.5;  // Closer = higher weight
        });
        
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let r = rng() * totalWeight;
        let selectedIdx = 0;
        
        for (let j = 0; j < weights.length; j++) {
          r -= weights[j];
          if (r <= 0) {
            selectedIdx = j;
            break;
          }
        }
        
        const targetId = possibleTargets.splice(selectedIdx, 1)[0];
        node.connections.push(targetId);
      }
    });
  }
  
  // Place special nodes (replace some fight nodes)
  placeSpecialNodes(nodes, params, rng);
  
  // Place rival if applicable
  if (params.hasRival) {
    const midRow = Math.floor(params.rows * 0.6);
    const eligibleNodes = nodes.filter(n => n.y === midRow && n.type === 'fight');
    if (eligibleNodes.length > 0) {
      eligibleNodes[Math.floor(rng() * eligibleNodes.length)].type = 'rival';
    }
  }
  
  return {
    league,
    nodes,
    currentNodeId: null,
    startNodeIds: rows[0],
    bossNodeId: nodes.find(n => n.type === 'champion')?.id || nodes[nodes.length - 1].id
  };
}

function placeSpecialNodes(nodes: MapNode[], params: typeof LEAGUE_PARAMS['bronze'], rng: () => number): void {
  const specialCounts: Partial<Record<NodeType, number>> = {
    shop: params.shopCount,
    forge: params.forgeCount,
    clinic: params.clinicCount,
    event: params.eventCount
  };
  
  const eligibleNodes = nodes.filter(n => n.type === 'fight' && n.y > 0 && n.y < nodes.reduce((m, n) => Math.max(m, n.y), 0));
  const shuffled = [...eligibleNodes].sort(() => rng() - 0.5);
  
  let idx = 0;
  for (const [type, count] of Object.entries(specialCounts)) {
    for (let i = 0; i < count && idx < shuffled.length; i++, idx++) {
      shuffled[idx].type = type as NodeType;
    }
  }
}

function createSeededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ===== HELPER FUNCTIONS =====

export function getNodeById(map: RunMap, nodeId: string): MapNode | undefined {
  return map.nodes.find(n => n.id === nodeId);
}

export function getAccessibleNodes(map: RunMap): MapNode[] {
  if (!map.currentNodeId) {
    // At start, return starting nodes
    return map.nodes.filter(n => map.startNodeIds.includes(n.id));
  }
  
  const current = getNodeById(map, map.currentNodeId);
  if (!current) return [];
  
  return map.nodes.filter(n => current.connections.includes(n.id) && !n.completed);
}

export function completeNode(map: RunMap, nodeId: string): void {
  const node = getNodeById(map, nodeId);
  if (node) {
    node.completed = true;
    map.currentNodeId = nodeId;
  }
}

export function isMapComplete(map: RunMap): boolean {
  const bossNode = getNodeById(map, map.bossNodeId);
  return bossNode?.completed || false;
}

export function getMapProgress(map: RunMap): { completed: number; total: number } {
  const total = map.nodes.length;
  const completed = map.nodes.filter(n => n.completed).length;
  return { completed, total };
}
