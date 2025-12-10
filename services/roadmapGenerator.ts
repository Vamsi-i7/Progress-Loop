
import { Node, Roadmap } from '../types';

export const generateRoadmap = (title: string, flatNodes: Node[]): Roadmap => {
    // The nodes from Gemini come sequentially. We need to link parents.
    // Heuristic: A node at level N is a child of the *last* node at level N-1.
    
    const structuredNodes: Node[] = [];
    const lastParentByLevel: Record<number, string> = {};

    flatNodes.forEach(node => {
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
        generatedAt: new Date().toISOString()
    };
};
