import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Router, RouterType, Port, PortSpeed } from '@/types/network';

interface NetworkContextType {
  routers: Router[];
  addRouter: (name: string, type: RouterType, ports: { name: string; speed: PortSpeed }[]) => void;
  removeRouter: (id: string) => void;
  connectPorts: (fromRouterId: string, fromPortId: string, toRouterId: string, toPortId: string) => void;
  disconnectPort: (routerId: string, portId: string) => void;
}

const NetworkContext = createContext<NetworkContextType | null>(null);

export const useNetwork = () => {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error('useNetwork must be used within NetworkProvider');
  return ctx;
};

let idCounter = 0;
const genId = () => `id-${++idCounter}-${Date.now()}`;

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [routers, setRouters] = useState<Router[]>([]);

  const addRouter = useCallback((name: string, type: RouterType, ports: { name: string; speed: PortSpeed }[]) => {
    const newRouter: Router = {
      id: genId(),
      name,
      type,
      ports: ports.map(p => ({ id: genId(), name: p.name, speed: p.speed })),
    };
    setRouters(prev => [...prev, newRouter]);
  }, []);

  const removeRouter = useCallback((id: string) => {
    setRouters(prev => {
      // Disconnect all ports connected to this router
      const updated = prev.map(r => ({
        ...r,
        ports: r.ports.map(p =>
          p.connectedTo?.routerId === id ? { ...p, connectedTo: undefined } : p
        ),
      }));
      return updated.filter(r => r.id !== id);
    });
  }, []);

  const connectPorts = useCallback((fromRouterId: string, fromPortId: string, toRouterId: string, toPortId: string) => {
    setRouters(prev =>
      prev.map(r => {
        if (r.id === fromRouterId) {
          return {
            ...r,
            ports: r.ports.map(p =>
              p.id === fromPortId ? { ...p, connectedTo: { routerId: toRouterId, portId: toPortId } } : p
            ),
          };
        }
        if (r.id === toRouterId) {
          return {
            ...r,
            ports: r.ports.map(p =>
              p.id === toPortId ? { ...p, connectedTo: { routerId: fromRouterId, portId: fromPortId } } : p
            ),
          };
        }
        return r;
      })
    );
  }, []);

  const disconnectPort = useCallback((routerId: string, portId: string) => {
    setRouters(prev => {
      let targetRouterId = '';
      let targetPortId = '';
      const router = prev.find(r => r.id === routerId);
      const port = router?.ports.find(p => p.id === portId);
      if (port?.connectedTo) {
        targetRouterId = port.connectedTo.routerId;
        targetPortId = port.connectedTo.portId;
      }
      return prev.map(r => {
        if (r.id === routerId) {
          return { ...r, ports: r.ports.map(p => p.id === portId ? { ...p, connectedTo: undefined } : p) };
        }
        if (r.id === targetRouterId) {
          return { ...r, ports: r.ports.map(p => p.id === targetPortId ? { ...p, connectedTo: undefined } : p) };
        }
        return r;
      });
    });
  }, []);

  return (
    <NetworkContext.Provider value={{ routers, addRouter, removeRouter, connectPorts, disconnectPort }}>
      {children}
    </NetworkContext.Provider>
  );
};
