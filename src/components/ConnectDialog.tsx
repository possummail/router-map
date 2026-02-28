import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useNetwork } from '@/context/NetworkContext';
import { VALID_CONNECTIONS, RouterType } from '@/types/network';
import { Cable } from 'lucide-react';

const ConnectDialog = () => {
  const { routers, connectPorts } = useNetwork();
  const [open, setOpen] = useState(false);
  const [fromRouterId, setFromRouterId] = useState('');
  const [fromPortId, setFromPortId] = useState('');
  const [toRouterId, setToRouterId] = useState('');
  const [toPortId, setToPortId] = useState('');

  const fromRouter = routers.find(r => r.id === fromRouterId);
  const toRouter = routers.find(r => r.id === toRouterId);

  // Filter valid target routers based on connection rules
  const validTargetType = fromRouter ? VALID_CONNECTIONS[fromRouter.type] : null;
  const validTargets = validTargetType ? routers.filter(r => r.type === validTargetType) : [];

  const availableFromPorts = fromRouter?.ports.filter(p => !p.connectedTo) ?? [];
  const availableToPorts = toRouter?.ports.filter(p => !p.connectedTo) ?? [];

  const handleConnect = () => {
    if (fromRouterId && fromPortId && toRouterId && toPortId) {
      connectPorts(fromRouterId, fromPortId, toRouterId, toPortId);
      setFromRouterId('');
      setFromPortId('');
      setToRouterId('');
      setToPortId('');
      setOpen(false);
    }
  };

  const reset = () => {
    setFromRouterId('');
    setFromPortId('');
    setToRouterId('');
    setToPortId('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Cable className="h-4 w-4" />
          Connect
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg">Connect Routers</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground mb-2">
          CSR → AA → FA → MA
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>From Router</Label>
            <Select value={fromRouterId} onValueChange={v => { setFromRouterId(v); setFromPortId(''); setToRouterId(''); setToPortId(''); }}>
              <SelectTrigger className="font-mono text-sm">
                <SelectValue placeholder="Select source router" />
              </SelectTrigger>
              <SelectContent>
                {routers.filter(r => VALID_CONNECTIONS[r.type] !== null).map(r => (
                  <SelectItem key={r.id} value={r.id}>
                    <span className="font-mono font-semibold">[{r.type}]</span> {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {fromRouter && (
            <div className="space-y-2">
              <Label>From Port</Label>
              <Select value={fromPortId} onValueChange={setFromPortId}>
                <SelectTrigger className="font-mono text-sm">
                  <SelectValue placeholder="Select port" />
                </SelectTrigger>
                <SelectContent>
                  {availableFromPorts.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.speed})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {fromRouter && (
            <div className="space-y-2">
              <Label>To Router <span className="text-muted-foreground text-xs">({validTargetType})</span></Label>
              <Select value={toRouterId} onValueChange={v => { setToRouterId(v); setToPortId(''); }}>
                <SelectTrigger className="font-mono text-sm">
                  <SelectValue placeholder="Select target router" />
                </SelectTrigger>
                <SelectContent>
                  {validTargets.map(r => (
                    <SelectItem key={r.id} value={r.id}>
                      <span className="font-mono font-semibold">[{r.type}]</span> {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {toRouter && (
            <div className="space-y-2">
              <Label>To Port</Label>
              <Select value={toPortId} onValueChange={setToPortId}>
                <SelectTrigger className="font-mono text-sm">
                  <SelectValue placeholder="Select port" />
                </SelectTrigger>
                <SelectContent>
                  {availableToPorts.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.speed})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button onClick={handleConnect} className="w-full" disabled={!fromPortId || !toPortId}>
            Connect Ports
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectDialog;
