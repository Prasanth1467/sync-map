import { useState, useEffect, useRef } from "react";
import MapView from "@/components/MapView";
import Controls from "@/components/Controls";
import InfoPanel from "@/components/InfoPanel";
import routeDataFallback from "@/data/dummy-route.json";
import { haversineDistance, calculateSpeed, interpolateCoordinates } from "@/utils/haversine";
import { motion } from "framer-motion";
import { Truck, Play, Pause, RotateCcw, X } from "lucide-react";

interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: string;
}

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [routeData, setRouteData] = useState<RoutePoint[]>([]);
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([0, 0]);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [interpolationProgress, setInterpolationProgress] = useState(0);
  // Mobile UI state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Load route data: try public/dummy-route.json, fallback to bundled file
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch("/dummy-route.json", { cache: "no-cache" });
        if (!res.ok) throw new Error("not found");
        const data: RoutePoint[] = await res.json();
        if (isMounted) {
          setRouteData(data);
          setCurrentPosition([data[0].latitude, data[0].longitude]);
          setRouteCoordinates([[data[0].latitude, data[0].longitude]]);
        }
      } catch {
        const data = routeDataFallback as RoutePoint[];
        if (isMounted) {
          setRouteData(data);
          setCurrentPosition([data[0].latitude, data[0].longitude]);
          setRouteCoordinates([[data[0].latitude, data[0].longitude]]);
        }
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Animation loop for smooth movement
  useEffect(() => {
    if (!isPlaying || routeData.length === 0) return;

    const animationInterval = 50; // Update every 50ms for smooth animation
    const baseStepDuration = 2000; // 2 seconds per point at 1x speed
    const stepDuration = baseStepDuration / speedMultiplier;
    const progressIncrement = animationInterval / stepDuration;

    const interval = setInterval(() => {
      setInterpolationProgress((prev) => {
        const newProgress = prev + progressIncrement;

        if (newProgress >= 1) {
          // Move to next point
          setCurrentIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;
            
            if (nextIndex >= routeData.length) {
              setIsPlaying(false);
              return prevIndex;
            }

            // Calculate speed between points
            const point1 = routeData[prevIndex];
            const point2 = routeData[nextIndex];
            const distance = haversineDistance(
              point1.latitude,
              point1.longitude,
              point2.latitude,
              point2.longitude
            );
            const time1 = new Date(point1.timestamp).getTime();
            const time2 = new Date(point2.timestamp).getTime();
            const timeDiff = (time2 - time1) / 1000;
            const speed = calculateSpeed(distance, timeDiff) * speedMultiplier;
            const clampedSpeed = Math.min(speed, 120); // clamp to reasonable road speed
            setCurrentSpeed(clampedSpeed);

            // Update route coordinates
            setRouteCoordinates((prev) => [
              ...prev,
              [point2.latitude, point2.longitude],
            ]);

            // Simulate battery drain
            setBatteryLevel((prev) => {
              const next = Math.max(0, prev - 0.3);
              return Math.round(next * 10) / 10; // keep 1 decimal to avoid floating errors
            });

            return nextIndex;
          });

          return 0;
        }

        // Interpolate position
        if (currentIndex < routeData.length - 1) {
          const start: [number, number] = [
            routeData[currentIndex].latitude,
            routeData[currentIndex].longitude,
          ];
          const end: [number, number] = [
            routeData[currentIndex + 1].latitude,
            routeData[currentIndex + 1].longitude,
          ];
          const newPosition = interpolateCoordinates(start, end, newProgress);
          setCurrentPosition(newPosition);
        }

        return newProgress;
      });
    }, animationInterval);

    intervalRef.current = interval;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentIndex, speedMultiplier, routeData]);

  // Elapsed time tracker
  useEffect(() => {
    if (!isPlaying || routeData.length === 0) return;

    if (!startTimeRef.current) {
      startTimeRef.current = new Date();
    }

    const timeInterval = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current.getTime();
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        setElapsedTime(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (!isPlaying && routeData.length > 0 && currentIndex >= routeData.length - 1) {
      handleRestart();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setInterpolationProgress(0);
    if (routeData.length > 0) {
      setCurrentPosition([routeData[0].latitude, routeData[0].longitude]);
      setRouteCoordinates([[routeData[0].latitude, routeData[0].longitude]]);
    }
    setCurrentSpeed(0);
    setElapsedTime("00:00:00");
    setBatteryLevel(100);
    startTimeRef.current = null;
  };

  // Removed view-full-route button and handler

  const progress = routeData.length > 1 ? Math.round((currentIndex / (routeData.length - 1)) * 100) : 0;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Overlay wrapper prevents map interaction from being blocked */}
      <div className="pointer-events-none absolute inset-0 z-[1000]">
        {/* Desktop header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:block pointer-events-auto absolute top-6 left-6 bg-card/80 backdrop-blur-md border border-primary/20 rounded-xl shadow-card px-5 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Truck className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Vehicle Tracker</h1>
              <p className="text-sm text-muted-foreground">Nashik - Deolali Route</p>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Map */}
      {routeData.length > 0 && (
      <MapView
        currentPosition={currentPosition}
        routeCoordinates={routeCoordinates}
        allRoutePoints={routeData}
        isPlaying={isPlaying}
      />)}

      {/* Controls */}
      <Controls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onRestart={handleRestart}
        speedMultiplier={speedMultiplier}
        onSpeedChange={setSpeedMultiplier}
      />

      {/* Desktop Info Panel */}
      <div className="hidden md:block">
      <InfoPanel
        currentLat={currentPosition[0]}
        currentLng={currentPosition[1]}
        currentSpeed={currentSpeed}
        elapsedTime={elapsedTime}
        batteryLevel={batteryLevel}
        progress={progress}
      />
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="md:hidden">
        {/* Collapsed bar */}
        {!isSheetOpen && (
          <motion.button
            onClick={() => setIsSheetOpen(true)}
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-auto fixed bottom-14 left-4 z-[1050] bg-slate-800/90 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg px-3 py-2 flex items-center gap-3"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-white/60 uppercase tracking-wide">Speed</span>
              <span className="text-xs font-semibold text-white">{currentSpeed.toFixed(1)} km/h</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-white/60 uppercase tracking-wide">Battery</span>
              <span className="text-xs font-semibold text-white">{Math.round(batteryLevel)}%</span>
            </div>
          </motion.button>
        )}

        {/* Expanded sheet -> left drawer on mobile */}
        {isSheetOpen && (
          <>
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
              className="pointer-events-auto fixed inset-y-0 left-0 z-[1100] w-[88vw] max-w-sm"
            >
              <div className="h-full bg-slate-800/90 backdrop-blur-lg border-r border-white/10 shadow-lg p-4 rounded-r-2xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-1 w-12 rounded-full bg-white/30" />
                  <button
                    aria-label="Close"
                    onClick={() => setIsSheetOpen(false)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/15 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <InfoPanel
                  variant="sheet"
                  currentLat={currentPosition[0]}
                  currentLng={currentPosition[1]}
                  currentSpeed={currentSpeed}
                  elapsedTime={elapsedTime}
                  batteryLevel={batteryLevel}
                  progress={progress}
                />
              </div>
            </motion.div>
            {/* click-away area */}
            <button
              aria-label="Close"
              onClick={() => setIsSheetOpen(false)}
              className="fixed inset-0 z-[1090] h-full w-full bg-black/20"
            />
          </>
        )}

        {/* Speed FAB */}
        <div className="pointer-events-auto fixed bottom-24 left-4 z-[1120] space-y-3">
          {/* Play/Pause and Reset cluster */}
          <div className="flex items-center justify-start gap-2">
            <button
              onClick={handleRestart}
              aria-label="Restart"
              className="h-10 w-10 rounded-full bg-slate-800/90 text-white shadow-lg border border-white/10 flex items-center justify-center"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onClick={handlePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
              className={`h-12 w-12 rounded-full text-white shadow-lg border border-white/10 flex items-center justify-center ${
                isPlaying ? "bg-rose-600/90" : "bg-emerald-600/90"
              }`}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
          </div>
          <button
            onClick={() => setIsSpeedMenuOpen((v) => !v)}
            className="h-12 w-12 rounded-full bg-slate-800/90 text-white shadow-lg border border-white/10 flex items-center justify-center"
          >
            <span className="text-sm font-semibold">{speedMultiplier}x</span>
          </button>
          {isSpeedMenuOpen && (
            <div className="mt-2 rounded-2xl bg-slate-800/95 text-white border border-white/10 shadow-lg p-2 flex gap-2">
              {[1, 2, 4].map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    setSpeedMultiplier(speed);
                    setIsSpeedMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-xl text-sm ${
                    speedMultiplier === speed ? "bg-white/20" : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Index;
