"use client";

import { useEffect, useState } from 'react';
import { supabase, type Machine } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, MapPin } from 'lucide-react';
import Link from 'next/link';
import { FailurePredictionDialog } from '@/components/failure-prediction-dialog';

export default function Home() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('name');

      if (error) throw error;
      setMachines(data || []);
    } catch (error) {
      console.error('Error fetching machines:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'maintenance':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading machines...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Machine Monitoring Dashboard
            </h1>
            <p className="text-slate-600">
              Real-time monitoring and predictive maintenance
            </p>
          </div>
          <FailurePredictionDialog />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machines.map((machine) => (
            <Link key={machine.id} href={`/machine/${machine.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-400">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{machine.name}</CardTitle>
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(machine.status)} text-white border-0`}
                    >
                      {machine.status}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1 mt-2">
                    <MapPin className="h-3 w-3" />
                    {machine.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Activity className="h-4 w-4" />
                    <span>Click to view real-time metrics</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {machines.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No machines found</p>
          </div>
        )}
      </div>
    </div>
  );
}
