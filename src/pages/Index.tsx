import { useState, useEffect, useRef } from "react";
import MapView from "@/components/MapView";
import Controls from "@/components/Controls";
import InfoPanel from "@/components/InfoPanel";
import routeDataFallback from "@/data/dummy-route.json";
import { haversineDistance, calculateSpeed, interpolateCoordinates } from "@/utils/haversine";
import { motion } from "framer-motion";
import { Truck } from "lucide-react";

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
        {/* Header */}
        <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto absolute top-6 left-6 bg-card/80 backdrop-blur-md border border-primary/20 rounded-xl shadow-card px-5 py-3 max-w-[85vw] sm:max-w-none"
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

      {/* Info Panel */}
      <InfoPanel
        currentLat={currentPosition[0]}
        currentLng={currentPosition[1]}
        currentSpeed={currentSpeed}
        elapsedTime={elapsedTime}
        batteryLevel={batteryLevel}
        progress={progress}
      />
    </div>
  );
};

export default Index;
