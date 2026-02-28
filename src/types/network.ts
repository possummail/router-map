export type RouterType = 'MA' | 'FA' | 'AA' | 'CSR';
export type PortSpeed = '10G' | '100G';

export interface Port {
  id: string;
  name: string;
  speed: PortSpeed;
  connectedTo?: {
    routerId: string;
    portId: string;
  };
}

export interface Router {
  id: string;
  name: string;
  type: RouterType;
  ports: Port[];
}

export const ROUTER_TYPE_LABELS: Record<RouterType, string> = {
  MA: 'Metro Aggregator',
  FA: 'Fan Aggregator',
  AA: 'Access Aggregator',
  CSR: 'Cell Site Router',
};

export const ROUTER_TYPE_ORDER: RouterType[] = ['MA', 'FA', 'AA', 'CSR'];

// Valid upstream connections: CSR→AA, AA→FA, FA→MA
export const VALID_CONNECTIONS: Record<RouterType, RouterType | null> = {
  CSR: 'AA',
  AA: 'FA',
  FA: 'MA',
  MA: null,
};
