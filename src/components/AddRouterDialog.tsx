import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useNetwork } from '@/context/NetworkContext';
import { RouterType, PortSpeed, ROUTER_TYPE_LABELS } from '@/types/network';
import { Plus, Trash2 } from 'lucide-react';

interface PortEntry {
  name: string;
  speed: PortSpeed;
}

const AddRouterDialog = () => {
  const { addRouter } = useNetwork();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<RouterType>('CSR');
  const [ports, setPorts] = useState<PortEntry[]>([{ name: 'Gi0/0/0', speed: '10G' }]);

  const addPort = () => {
    setPorts(prev => [...prev, { name: `Gi0/0/${prev.length}`, speed: '10G' }]);
  };

  const removePort = (index: number) => {
    setPorts(prev => prev.filter((_, i) => i !== index));
  };

  const updatePort = (index: number, field: keyof PortEntry, value: string) => {
    setPorts(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const handleSubmit = () => {
    if (!name.trim() || ports.length === 0) return;
    addRouter(name.trim(), type, ports);
    setName('');
    setType('CSR');
    setPorts([{ name: 'Gi0/0/0', speed: '10G' }]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Router
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg">Add New Router</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Router Name</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. CSR-NYC-01"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={v => setType(v as RouterType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['MA', 'FA', 'AA', 'CSR'] as RouterType[]).map(t => (
                    <SelectItem key={t} value={t}>
                      <span className="font-mono font-semibold">{t}</span>
                      <span className="ml-2 text-muted-foreground text-xs">{ROUTER_TYPE_LABELS[t]}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Ports</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPort} className="gap-1 h-7 text-xs">
                <Plus className="h-3 w-3" /> Add Port
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {ports.map((port, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={port.name}
                    onChange={e => updatePort(i, 'name', e.target.value)}
                    placeholder="Port name"
                    className="font-mono text-sm flex-1"
                  />
                  <Select value={port.speed} onValueChange={v => updatePort(i, 'speed', v)}>
                    <SelectTrigger className="w-24 font-mono text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10G">10G</SelectItem>
                      <SelectItem value="100G">100G</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => removePort(i)}
                    disabled={ports.length <= 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={!name.trim()}>
            Add Router
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddRouterDialog;
