import { useEffect } from 'react';
import { Users } from 'lucide-react';

export function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-white">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-5 shadow-2xl shadow-amber-500/20 animate-[bounce_1s_ease-in-out_infinite]">
          <Users className="w-10 h-10 text-neutral-950" strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-bold tracking-[0.2em] text-amber-400 mb-2">Team Manage</h1>
        <p className="text-sm text-neutral-500 tracking-wide">Powered by Darsik Films</p>
      </div>
    </div>
  );
}
