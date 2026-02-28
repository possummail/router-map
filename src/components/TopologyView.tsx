import { useMemo } from 'react';
import { useNetwork } from '@/context/NetworkContext';
import { ROUTER_TYPE_ORDER, RouterType } from '@/types/network';
import { Router } from '@/types/network';

const TYPE_COLORS: Record<RouterType, string> = {
  MA: 'hsl(210, 80%, 55%)',
  FA: 'hsl(150, 60%, 45%)',
  AA: 'hsl(35, 85%, 55%)',
  CSR: 'hsl(180, 65%, 48%)',
};

const TYPE_GLOWS: Record<RouterType, string> = {
  MA: 'hsl(210, 80%, 55%, 0.4)',
  FA: 'hsl(150, 60%, 45%, 0.4)',
  AA: 'hsl(35, 85%, 55%, 0.4)',
  CSR: 'hsl(180, 65%, 48%, 0.4)',
};

interface NodePosition {
  x: number;
  y: number;
  router: Router;
}

const TopologyView = () => {
  const { routers } = useNetwork();

  const { nodes, edges, viewBox } = useMemo(() => {
    const nodeMap = new Map<string, NodePosition>();
    const layerGap = 160;
    const nodeGap = 140;
    const paddingX = 80;
    const paddingY = 60;

    // Group routers by type in hierarchy order
    const layers = ROUTER_TYPE_ORDER.map(type =>
      routers.filter(r => r.type === type)
    );

    const maxPerLayer = Math.max(1, ...layers.map(l => l.length));
    const totalWidth = Math.max(500, maxPerLayer * nodeGap + paddingX * 2);
    const totalHeight = layers.length * layerGap + paddingY * 2;

    layers.forEach((layer, layerIndex) => {
      const y = paddingY + layerIndex * layerGap + 40;
      const layerWidth = layer.length * nodeGap;
      const startX = (totalWidth - layerWidth) / 2 + nodeGap / 2;

      layer.forEach((router, i) => {
        nodeMap.set(router.id, {
          x: startX + i * nodeGap,
          y,
          router,
        });
      });
    });

    // Build edges from port connections (deduplicated)
    const edgeSet = new Set<string>();
    const edgeList: { from: NodePosition; to: NodePosition; portInfo: string }[] = [];

    routers.forEach(router => {
      router.ports.forEach(port => {
        if (port.connectedTo) {
          const key = [router.id, port.connectedTo.routerId].sort().join('-');
          if (!edgeSet.has(key)) {
            edgeSet.add(key);
            const from = nodeMap.get(router.id);
            const to = nodeMap.get(port.connectedTo.routerId);
            if (from && to) {
              const toPort = routers
                .find(r => r.id === port.connectedTo!.routerId)
                ?.ports.find(p => p.id === port.connectedTo!.portId);
              edgeList.push({
                from,
                to,
                portInfo: `${port.name} (${port.speed}) ↔ ${toPort?.name ?? '?'} (${toPort?.speed ?? '?'})`,
              });
            }
          }
        }
      });
    });

    return {
      nodes: Array.from(nodeMap.values()),
      edges: edgeList,
      viewBox: `0 0 ${totalWidth} ${totalHeight}`,
    };
  }, [routers]);

  if (routers.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        Add routers to see the topology graph.
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto rounded-lg border border-border/50 bg-card/30">
      <svg viewBox={viewBox} className="w-full min-h-[400px]" style={{ maxHeight: '600px' }}>
        <defs>
          {ROUTER_TYPE_ORDER.map(type => (
            <filter key={type} id={`glow-${type}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor={TYPE_GLOWS[type]} result="color" />
              <feComposite in="color" in2="blur" operator="in" result="shadow" />
              <feMerge>
                <feMergeNode in="shadow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => (
          <g key={i}>
            <line
              x1={edge.from.x}
              y1={edge.from.y}
              x2={edge.to.x}
              y2={edge.to.y}
              stroke="hsl(215, 15%, 30%)"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
            <title>{edge.portInfo}</title>
            {/* Midpoint label */}
            <text
              x={(edge.from.x + edge.to.x) / 2 + 8}
              y={(edge.from.y + edge.to.y) / 2}
              fill="hsl(215, 15%, 45%)"
              fontSize="8"
              fontFamily="'JetBrains Mono', monospace"
              dominantBaseline="middle"
            >
              {edge.portInfo}
            </text>
          </g>
        ))}

        {/* Nodes */}
        {nodes.map(node => {
          const color = TYPE_COLORS[node.router.type];
          const connectedPorts = node.router.ports.filter(p => p.connectedTo).length;
          const totalPorts = node.router.ports.length;

          return (
            <g key={node.router.id} filter={`url(#glow-${node.router.type})`}>
              {/* Node circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r="28"
                fill="hsl(220, 18%, 12%)"
                stroke={color}
                strokeWidth="2"
              />
              {/* Type label */}
              <text
                x={node.x}
                y={node.y - 4}
                textAnchor="middle"
                fill={color}
                fontSize="12"
                fontWeight="bold"
                fontFamily="'JetBrains Mono', monospace"
              >
                {node.router.type}
              </text>
              {/* Port count */}
              <text
                x={node.x}
                y={node.y + 10}
                textAnchor="middle"
                fill="hsl(215, 15%, 50%)"
                fontSize="8"
                fontFamily="'JetBrains Mono', monospace"
              >
                {connectedPorts}/{totalPorts}
              </text>
              {/* Name below */}
              <text
                x={node.x}
                y={node.y + 44}
                textAnchor="middle"
                fill="hsl(210, 20%, 75%)"
                fontSize="10"
                fontWeight="500"
                fontFamily="'JetBrains Mono', monospace"
              >
                {node.router.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default TopologyView;
