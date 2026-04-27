// src/app/components/WeightSelectorModal.tsx
import { Scale } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { useState } from 'react';

interface WeightSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (weight: string) => void;
  productName: string;
}

export function WeightSelector({ isOpen, onClose, onConfirm, productName }: WeightSelectorProps) {
  const [selectedWeight, setSelectedWeight] = useState<string | null>(null);
  const [customWeight, setCustomWeight] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
  const finalWeight = customWeight ? `${customWeight} kg` : selectedWeight;
  if (finalWeight) {
    onConfirm(finalWeight); // kirim string
  }
};

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <Card className="w-full max-w-xs rounded-3xl shadow-2xl border-none">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="bg-green-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Scale className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Pilih Berat</h3>
            <p className="text-[10px] text-gray-400 mt-1">{productName}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            {['250 gram', '500 gram', '1 kg', '2 kg'].map((w) => (
              <Button
                key={w}
                variant={selectedWeight === w && !customWeight ? "default" : "outline"}
                className={`py-3 text-[10px] font-bold rounded-xl h-auto ${selectedWeight === w && !customWeight ? "bg-green-600" : ""}`}
                onClick={() => { setSelectedWeight(w); setCustomWeight(""); }}
              >
                {w}
              </Button>
            ))}
          </div>

          <Input 
            type="number" placeholder="Manual (kg)" value={customWeight}
            onChange={(e) => { setCustomWeight(e.target.value); setSelectedWeight(null); }}
            className="h-9 text-xs font-bold rounded-xl mb-4"
          />

          <div className="flex flex-col gap-2">
            <Button className="w-full bg-green-600 text-xs py-4 rounded-xl font-bold" disabled={!selectedWeight && !customWeight} onClick={handleConfirm}>
              Konfirmasi
            </Button>
            <Button variant="ghost" className="w-full text-[10px] text-gray-400 font-bold" onClick={onClose}>Batal</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}