import { useNetwork } from '@/context/NetworkContext';
import { ROUTER_TYPE_ORDER, ROUTER_TYPE_LABELS, RouterType } from '@/types/network';
import AddRouterDialog from '@/components/AddRouterDialog';
import ConnectDialog from '@/components/ConnectDialog';
import RouterCard from '@/components/RouterCard';
import { Network, Server } from 'lucide-react';

const typeColors: Record<RouterType, string> = {
  MA: 'text-router-ma',
  FA: 'text-router-fa',
  AA: 'text-router-aa',
  CSR: 'text-router-csr',
};

const Index = () => {
  const { routers } = useNetwork();

  const routersByType = ROUTER_TYPE_ORDER.map(type => ({
    type,
    label: ROUTER_TYPE_LABELS[type],
    routers: routers.filter(r => r.type === type),
  }));

  const totalRouters = routers.length;
  const totalPorts = routers.reduce((sum, r) => sum + r.ports.length, 0);
  const connectedPorts = routers.reduce((sum, r) => sum + r.ports.filter(p => p.connectedTo).length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Network className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-bold font-mono tracking-tight">NetInventory</h1>
              <p className="text-xs text-muted-foreground">Network Router Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-4 mr-4 text-xs font-mono text-muted-foreground">
              <span>{totalRouters} routers</span>
              <span>{totalPorts} ports</span>
              <span>{connectedPorts / 2} links</span>
            </div>
            <ConnectDialog />
            <AddRouterDialog />
          </div>
        </div>
      </header>

      {/* Topology flow indicator */}
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground mb-6">
          {ROUTER_TYPE_ORDER.map((type, i) => (
            <div key={type} className="flex items-center gap-2">
              <span className={`font-semibold ${typeColors[type]}`}>{type}</span>
              {i < ROUTER_TYPE_ORDER.length - 1 && (
                <span className="text-muted-foreground/40">←</span>
              )}
            </div>
          ))}
        </div>

        {/* Router sections by type */}
        {totalRouters === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Server className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h2 className="text-lg font-semibold text-muted-foreground mb-1">No routers yet</h2>
            <p className="text-sm text-muted-foreground/60 mb-6">Add your first router to start building your network inventory.</p>
            <AddRouterDialog />
          </div>
        ) : (
          <div className="space-y-8">
            {routersByType.map(({ type, label, routers: typeRouters }) => (
              typeRouters.length > 0 && (
                <section key={type}>
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className={`font-mono font-bold text-sm ${typeColors[type]}`}>{type}</h2>
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs text-muted-foreground/50">({typeRouters.length})</span>
                    <div className="flex-1 topology-line" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {typeRouters.map(router => (
                      <RouterCard key={router.id} router={router} />
                    ))}
                  </div>
                </section>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
