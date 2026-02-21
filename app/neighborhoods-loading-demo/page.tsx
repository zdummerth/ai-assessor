import { NeighborhoodsLoading } from "@/components/neighborhoods-loading";

export default function NeighborhoodsLoadingDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Neighborhoods Loading
          </h1>
          <p className="text-slate-300">
            Animated SVG loader variations using the same map
          </p>
        </div>

        {/* Pulse trace */}
        <div className="bg-slate-700/50 rounded-lg p-4 flex flex-col items-center w-48">
          <p className="text-white mb-4 text-sm font-semibold">pulseTrace</p>
          <NeighborhoodsLoading variant="pulseTrace" />
        </div>

        {/* Neon breathe */}
        <div className="bg-slate-700/50 rounded-lg p-4 flex flex-col items-center w-48">
          <p className="text-white mb-4 text-sm font-semibold">neonBreathe</p>
          <NeighborhoodsLoading variant="neonBreathe" />
        </div>

        {/* Scanline */}
        <div className="bg-slate-700/50 rounded-lg p-4 flex flex-col items-center w-48">
          <p className="text-white mb-4 text-sm font-semibold">scanline</p>
          <NeighborhoodsLoading variant="scanline" />
        </div>

        {/* Sparkle */}
        <div className="bg-slate-700/50 rounded-lg p-4 flex flex-col items-center w-48">
          <p className="text-white mb-4 text-sm font-semibold">sparkle</p>
          <NeighborhoodsLoading variant="sparkle" />
        </div>

        {/* Usage */}
        <div className="bg-slate-700/50 rounded-lg p-8">
          <h2 className="text-white font-semibold mb-4">Usage</h2>
          <pre className="bg-slate-900 text-slate-200 p-4 rounded text-sm overflow-auto">
            {`import { NeighborhoodsLoading } from '@/components/neighborhoods-loading';

// Default
<NeighborhoodsLoading />

// Variants
<NeighborhoodsLoading variant="pulseTrace" />
<NeighborhoodsLoading variant="neonBreathe" />
<NeighborhoodsLoading variant="scanline" />
<NeighborhoodsLoading variant="sparkle" />`}
          </pre>
        </div>
      </div>
    </div>
  );
}
