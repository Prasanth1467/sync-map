import { motion } from "framer-motion";
import { MapPin, Clock, Gauge, Battery, Navigation } from "lucide-react";

interface InfoPanelProps {
  currentLat: number;
  currentLng: number;
  currentSpeed: number;
  elapsedTime: string;
  batteryLevel: number;
  progress: number;
  variant?: "overlay" | "sheet"; // overlay (desktop), sheet (mobile embedded)
}

const InfoPanel = ({
  currentLat,
  currentLng,
  currentSpeed,
  elapsedTime,
  batteryLevel,
  progress,
  variant = "overlay",
}: InfoPanelProps) => {
  const getBatteryColor = () => {
    if (batteryLevel > 60) return "text-success";
    if (batteryLevel > 30) return "text-warning";
    return "text-destructive";
  };

  const formatCoordinate = (value: number, decimals = 4) => value.toFixed(decimals);
  const roundedBattery = Math.round(batteryLevel);
  const roundedProgress = Math.round(progress);

  const containerClass =
    variant === "overlay"
      ? "pointer-events-auto absolute bottom-6 left-6 z-[1000] bg-card/80 backdrop-blur-md border border-primary/20 rounded-xl shadow-card p-5 space-y-4 w-72 sm:w-80"
      : "pointer-events-auto bg-card/80 backdrop-blur-md border border-primary/20 rounded-2xl shadow-card p-5 space-y-4 w-full";

  return (
    <motion.div
      initial={{ opacity: 0, y: variant === "overlay" ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={containerClass}
    >
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <Navigation className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Vehicle Status</h2>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Position</p>
            <p className="text-sm font-mono truncate">
              {formatCoordinate(currentLat)}, {formatCoordinate(currentLng)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Gauge className="w-5 h-5 text-info" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Speed</p>
            <p className="text-sm font-semibold">
              {currentSpeed.toFixed(1)} <span className="text-muted-foreground">km/h</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Elapsed Time</p>
            <p className="text-sm font-semibold">{elapsedTime}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Battery className={`w-5 h-5 ${getBatteryColor()}`} />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Battery</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${roundedBattery}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full ${
                    batteryLevel > 60
                      ? "bg-success"
                      : batteryLevel > 30
                      ? "bg-warning"
                      : "bg-destructive"
                  }`}
                />
              </div>
              <span className="text-sm font-semibold w-12 text-right">{roundedBattery}%</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">Route Progress</span>
            <span className="text-sm font-semibold text-accent">{roundedProgress}%</span>
          </div>
          <div className="bg-secondary rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${roundedProgress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-primary"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InfoPanel;
