"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, type Machine } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type MetricData = {
  time: string;
  value: number;
};

type MetricType = 'airTemp' | 'processTemp' | 'rotationalSpeed' | 'torque';

const METRIC_CONFIG = {
  airTemp: {
    title: 'Air Temperature',
    unit: 'K',
    color: '#3b82f6',
    range: { min: 295, max: 305 }
  },
  processTemp: {
    title: 'Process Temperature',
    unit: 'K',
    color: '#ef4444',
    range: { min: 305, max: 315 }
  },
  rotationalSpeed: {
    title: 'Rotational Speed',
    unit: 'rpm',
    color: '#10b981',
    range: { min: 1200, max: 1800 }
  },
  torque: {
    title: 'Torque',
    unit: 'Nm',
    color: '#f59e0b',
    range: { min: 30, max: 60 }
  }
};

const MAX_DATA_POINTS = 20;

export default function MachinePage() {
  const params = useParams();
  const router = useRouter();
  const [machine, setMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Record<MetricType, MetricData[]>>({
    airTemp: [],
    processTemp: [],
    rotationalSpeed: [],
    torque: []
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchMachine(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    if (machine) {
      startMetricsCollection();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [machine]);

  const fetchMachine = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        router.push('/');
        return;
      }

      setMachine(data);
    } catch (error) {
      console.error('Error fetching machine:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomValue = (metricType: MetricType): number => {
    const config = METRIC_CONFIG[metricType];
    const { min, max } = config.range;
    const value = min + Math.random() * (max - min);
    return Number(value.toFixed(2));
  };

  const startMetricsCollection = () => {
    const updateMetrics = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString();

      setMetrics(prev => {
        const updated: Record<MetricType, MetricData[]> = {} as any;

        (Object.keys(METRIC_CONFIG) as MetricType[]).forEach(metricType => {
          const newDataPoint = {
            time: timeString,
            value: generateRandomValue(metricType)
          };

          const updatedData = [...prev[metricType], newDataPoint];

          if (updatedData.length > MAX_DATA_POINTS) {
            updatedData.shift();
          }

          updated[metricType] = updatedData;
        });

        return updated;
      });
    };

    updateMetrics();
    intervalRef.current = setInterval(updateMetrics, 2000);
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
        <div className="text-lg">Loading machine data...</div>
      </div>
    );
  }

  if (!machine) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                {machine.name}
              </h1>
              <p className="text-slate-600">{machine.location}</p>
            </div>
            <Badge
              variant="outline"
              className={`${getStatusColor(machine.status)} text-white border-0 text-lg px-4 py-2`}
            >
              <Activity className="mr-2 h-4 w-4" />
              {machine.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(Object.keys(METRIC_CONFIG) as MetricType[]).map((metricType) => {
            const config = METRIC_CONFIG[metricType];
            const data = metrics[metricType];

            return (
              <Card key={metricType} className="border-2">
                <CardHeader>
                  <CardTitle>{config.title}</CardTitle>
                  <CardDescription>
                    Real-time monitoring in {config.unit}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {data.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="time"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis
                            domain={[config.range.min - 5, config.range.max + 5]}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={config.color}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            name={`${config.title} (${config.unit})`}
                            animationDuration={300}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-500">
                        Collecting data...
                      </div>
                    )}
                  </div>
                  {data.length > 0 && (
                    <div className="mt-4 p-3 bg-slate-100 rounded-lg">
                      <div className="text-sm text-slate-600">Current Value</div>
                      <div className="text-2xl font-bold" style={{ color: config.color }}>
                        {data[data.length - 1].value} {config.unit}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
