import { useSimulator } from '../context/SimulatorContext';
import { Settings, Play, Square, Activity, Zap, Server } from 'lucide-react';

export default function AdminSimulator() {
  const { isRunning, setIsRunning, qps, setQps } = useSimulator();

  const handleQpsChange = (e) => {
    setQps(Number(e.target.value));
  };

  const getStatusColor = () => {
    if (!isRunning) return 'text-slate-500';
    if (qps > 50) return 'text-status-red';
    if (qps > 20) return 'text-status-amber';
    return 'text-status-green';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="text-accent" /> Simulator Control
        </h1>
        <p className="text-slate-400 mt-1">Control the synthetic traffic generator for the platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-base-panel border border-slate-700 rounded-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
              <Activity className={getStatusColor()} /> Engine Status
            </h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
              isRunning ? 'bg-status-green/10 text-status-green border-status-green/20' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {isRunning ? 'RUNNING' : 'STOPPED'}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setIsRunning(true)}
              disabled={isRunning}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                isRunning 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-status-green hover:bg-emerald-600 text-white'
              }`}
            >
              <Play className="w-5 h-5" /> Start Engine
            </button>
            <button
              onClick={() => setIsRunning(false)}
              disabled={!isRunning}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                !isRunning 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-status-red hover:bg-red-600 text-white'
              }`}
            >
              <Square className="w-5 h-5" /> Stop Engine
            </button>
          </div>
        </div>

        <div className="bg-base-panel border border-slate-700 rounded-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
              <Zap className="text-accent" /> Traffic Load
            </h2>
            <div className="text-2xl font-mono text-accent">{qps} <span className="text-sm text-slate-500">QPS</span></div>
          </div>

          <div className="space-y-6">
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={qps} 
              onChange={handleQpsChange}
              disabled={!isRunning}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent disabled:opacity-50"
            />
            
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>1 QPS</span>
              <span>50 QPS</span>
              <span>100 QPS</span>
            </div>

            {qps > 80 && isRunning && (
              <div className="p-3 bg-status-red/10 border border-status-red/20 rounded text-sm text-status-red flex items-start gap-2">
                <Server className="w-4 h-4 shrink-0 mt-0.5" />
                <p>High load warning: DSP timeouts may increase at this traffic level.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}