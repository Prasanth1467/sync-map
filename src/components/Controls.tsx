import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onRestart: () => void;
  speedMultiplier: number;
  onSpeedChange: (speed: number) => void;
}

const Controls = ({
  isPlaying,
  onPlayPause,
  onRestart,
  speedMultiplier,
  onSpeedChange,
}: ControlsProps) => {
  const speeds = [1, 2, 4];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pointer-events-auto absolute top-6 right-6 z-[1000] bg-card/80 backdrop-blur-md border border-primary/20 rounded-xl shadow-card p-4 space-y-3"
    >
      <div className="flex gap-2">
        <Button
          onClick={onPlayPause}
          variant={isPlaying ? "secondary" : "default"}
          size="icon"
          className="transition-all hover:scale-105"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>

        <Button
          onClick={onRestart}
          variant="secondary"
          size="icon"
          className="transition-all hover:scale-105"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="w-4 h-4 text-accent" />
          <span className="font-medium">Speed</span>
        </div>
        <div className="flex gap-2">
          {speeds.map((speed) => (
            <Button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              variant={speedMultiplier === speed ? "default" : "secondary"}
              size="sm"
              className="flex-1 transition-all hover:scale-105"
            >
              {speed}x
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Controls;
