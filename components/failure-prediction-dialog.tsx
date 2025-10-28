"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type PredictionResult = {
  machineFailure: boolean;
  failureType: string;
};

export function FailurePredictionDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [formData, setFormData] = useState({
    airTemp: '',
    processTemp: '',
    rotationalSpeed: '',
    torque: '',
    type: '',
    toolWear: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('https://temp-api-url.com/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        throw new Error('API call failed');
      }
    } catch (error) {
      const mockResults = [
        { machineFailure: false, failureType: 'No Failure' },
        { machineFailure: true, failureType: 'Heat Dissipation Failure' },
        { machineFailure: true, failureType: 'Power Failure' },
        { machineFailure: true, failureType: 'Overstrain Failure' },
        { machineFailure: true, failureType: 'Tool Wear Failure' },
      ];

      const mockResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setResult(mockResult);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFormData({
      airTemp: '',
      processTemp: '',
      rotationalSpeed: '',
      torque: '',
      type: '',
      toolWear: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Predict Failure</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Machine Failure Prediction</DialogTitle>
          <DialogDescription>
            Enter machine parameters to predict potential failures
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <Alert variant={result.machineFailure ? "destructive" : "default"}>
              {result.machineFailure ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertTitle>
                {result.machineFailure ? 'Failure Predicted' : 'No Failure Detected'}
              </AlertTitle>
              <AlertDescription>
                {result.failureType}
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button onClick={handleReset} className="flex-1">
                New Prediction
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="airTemp">Air Temperature (K)</Label>
              <Input
                id="airTemp"
                type="number"
                step="0.01"
                required
                value={formData.airTemp}
                onChange={(e) => setFormData({ ...formData, airTemp: e.target.value })}
                placeholder="e.g., 298.15"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="processTemp">Process Temperature (K)</Label>
              <Input
                id="processTemp"
                type="number"
                step="0.01"
                required
                value={formData.processTemp}
                onChange={(e) => setFormData({ ...formData, processTemp: e.target.value })}
                placeholder="e.g., 308.15"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rotationalSpeed">Rotational Speed (rpm)</Label>
              <Input
                id="rotationalSpeed"
                type="number"
                step="0.01"
                required
                value={formData.rotationalSpeed}
                onChange={(e) => setFormData({ ...formData, rotationalSpeed: e.target.value })}
                placeholder="e.g., 1500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="torque">Torque (Nm)</Label>
              <Input
                id="torque"
                type="number"
                step="0.01"
                required
                value={formData.torque}
                onChange={(e) => setFormData({ ...formData, torque: e.target.value })}
                placeholder="e.g., 45.2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                required
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select machine type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Low (L)</SelectItem>
                  <SelectItem value="M">Medium (M)</SelectItem>
                  <SelectItem value="H">High (H)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toolWear">Tool Wear (min)</Label>
              <Input
                id="toolWear"
                type="number"
                step="0.01"
                required
                value={formData.toolWear}
                onChange={(e) => setFormData({ ...formData, toolWear: e.target.value })}
                placeholder="e.g., 120"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Predict
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
