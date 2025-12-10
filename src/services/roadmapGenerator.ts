
import { Node, Roadmap } from '../types';

export const generateRoadmap = (title: string, flatNodes: Node[]): Roadmap => {
    // 1. Sort Nodes based on Hierarchy (Level) then Weight (Importance) then Difficulty
    // Lower level = higher in hierarchy (0 is root)
    // Higher weight = more important
    // Easy difficulty comes first for better flow
    
    const sortedNodes = [...flatNodes].sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        if ((a.weight || 0) !== (b.weight || 0)) return (b.weight || 0) - (a.weight || 0); // Descending weight
        
        const diffScore = { 'easy': 0, 'medium': 1, 'hard': 2 };
        const scoreA = diffScore[a.difficulty || 'medium'];
        const scoreB = diffScore[b.difficulty || 'medium'];
        return scoreA - scoreB;
    });

    // 2. Reconstruct Hierarchy
    // Heuristic: A node at level N is a child of the *last* node at level N-1.
    const structuredNodes: Node[] = [];
    const lastParentByLevel: Record<number, string> = {};

    sortedNodes.forEach(node => {
        const n = { ...node };
        if (n.level > 0) {
            n.parentId = lastParentByLevel[n.level - 1];
        }
        lastParentByLevel[n.level] = n.id;
        structuredNodes.push(n);
    });

    return {
        id: `rm_${Date.now()}`,
        title,
        nodes: structuredNodes,
        generatedAt: new Date().toISOString(),
        timetable: []
    };
};
