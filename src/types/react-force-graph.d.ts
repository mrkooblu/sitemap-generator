declare module 'react-force-graph' {
    import { Component } from 'react';
  
    interface GraphNode {
      id: string;
      name?: string;
      val?: number;
      color?: string;
      [key: string]: any;
    }
  
    interface GraphLink {
      source: string | GraphNode;
      target: string | GraphNode;
      [key: string]: any;
    }
  
    interface GraphData {
      nodes: GraphNode[];
      links: GraphLink[];
    }
  
    interface ForceGraphProps {
      graphData: GraphData;
      nodeRelSize?: number;
      nodeId?: string;
      nodeLabel?: string | ((node: GraphNode) => string);
      nodeColor?: string | ((node: GraphNode) => string);
      nodeVal?: string | number | ((node: GraphNode) => number);
      linkSource?: string;
      linkTarget?: string;
      linkLabel?: string | ((link: GraphLink) => string);
      linkWidth?: number | ((link: GraphLink) => number);
      linkColor?: string | ((link: GraphLink) => string);
      backgroundColor?: string;
      width?: number;
      height?: number;
      onNodeClick?: (node: GraphNode) => void;
      onLinkClick?: (link: GraphLink) => void;
      cooldownTicks?: number;
      linkDirectionalParticles?: number;
      linkDirectionalParticleSpeed?: number | ((link: GraphLink) => number);
      nodeLabelColor?: string | ((node: GraphNode) => string);
      [key: string]: any;
    }
  
    export class ForceGraph2D extends Component<ForceGraphProps> {}
    export class ForceGraph3D extends Component<ForceGraphProps> {}
    export class ForceGraphVR extends Component<ForceGraphProps> {}
    export class ForceGraphAR extends Component<ForceGraphProps> {}
  } 