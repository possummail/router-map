import { Router, RouterType, ROUTER_TYPE_LABELS } from '@/types/network';
import { useNetwork } from '@/context/NetworkContext';
import { Trash2, Unplug, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const typeStyles: Record<RouterType, { card: string; glow: string; badge: string }> = {
  MA: { card: 'router-card-ma', glow: 'glow-ma', badge: 'bg-router-ma/20 text-router-ma border-router-ma/30' },
  FA: { card: 'router-card-fa', glow: 'glow-fa', badge: 'bg-router-fa/20 text-router-fa border-router-fa/30' },
  AA: { card: 'router-card-aa', glow: 'glow-aa', badge: 'bg-router-aa/20 text-router-aa border-router-aa/30' },
  CSR: { card: 'router-card-csr', glow: 'glow-csr', badge: 'bg-router-csr/20 text-router-csr border-router-csr/30' },
};

const RouterCard = ({ router }: { router: Router }) => {
  const { routers, removeRouter, disconnectPort } = useNetwork();
  const styles = typeStyles[router.type];

  const getConnectedRouterName = (routerId: string) => {
    return routers.find(r => r.id === routerId)?.name ?? 'Unknown';
  };

  return (
    <div className={`rounded-lg border p-4 ${styles.card} ${styles.glow} transition-all hover:scale-[1.01]`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-mono font-bold text-sm">{router.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold border ${styles.badge}`}>
              {router.type}
            </span>
            <span className="text-xs text-muted-foreground">{ROUTER_TYPE_LABELS[router.type]}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-50 hover:opacity-100" onClick={() => removeRouter(router.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Ports ({router.ports.length})</p>
        {router.ports.map(port => (
          <div key={port.id} className="flex items-center gap-2 text-xs font-mono bg-background/40 rounded px-2 py-1.5">
            <Circle className={`h-2 w-2 shrink-0 ${port.connectedTo ? 'fill-green-400 text-green-400' : 'fill-muted-foreground/30 text-muted-foreground/30'}`} />
            <span className="flex-1 truncate">{port.name}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono">
              {port.speed}
            </Badge>
            {port.connectedTo && (
              <>
                <span className="text-muted-foreground text-[10px] truncate max-w-[80px]">
                  → {getConnectedRouterName(port.connectedTo.routerId)}
                </span>
                <button
                  onClick={() => disconnectPort(router.id, port.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Unplug className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouterCard;
