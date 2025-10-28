import { useState, useEffect, useRef } from "react";
import MapView from "@/components/MapView";
import Controls from "@/components/Controls";
import InfoPanel from "@/components/InfoPanel";
import routeData from "@/data/dummy-route.json";
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
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([
    routeData[0].latitude,
    routeData[0].longitude,
  ]);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [interpolationProgress, setInterpolationProgress] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const typedRouteData = routeData as RoutePoint[];

  // Animation loop for smooth movement
  useEffect(() => {
    if (!isPlaying) return;

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
            
            if (nextIndex >= typedRouteData.length) {
              setIsPlaying(false);
              return prevIndex;
            }

            // Calculate speed between points
            const point1 = typedRouteData[prevIndex];
            const point2 = typedRouteData[nextIndex];
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
            setCurrentSpeed(speed);

            // Update route coordinates
            setRouteCoordinates((prev) => [
              ...prev,
              [point2.latitude, point2.longitude],
            ]);

            // Simulate battery drain
            setBatteryLevel((prev) => Math.max(0, prev - 0.3));

            return nextIndex;
          });

          return 0;
        }

        // Interpolate position
        if (currentIndex < typedRouteData.length - 1) {
          const start: [number, number] = [
            typedRouteData[currentIndex].latitude,
            typedRouteData[currentIndex].longitude,
          ];
          const end: [number, number] = [
            typedRouteData[currentIndex + 1].latitude,
            typedRouteData[currentIndex + 1].longitude,
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
  }, [isPlaying, currentIndex, speedMultiplier, typedRouteData]);

  // Elapsed time tracker
  useEffect(() => {
    if (!isPlaying) return;

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
    if (!isPlaying && currentIndex >= typedRouteData.length - 1) {
      handleRestart();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setInterpolationProgress(0);
    setCurrentPosition([typedRouteData[0].latitude, typedRouteData[0].longitude]);
    setRouteCoordinates([[typedRouteData[0].latitude, typedRouteData[0].longitude]]);
    setCurrentSpeed(0);
    setElapsedTime("00:00:00");
    setBatteryLevel(100);
    startTimeRef.current = null;
  };

  const handleViewFullRoute = () => {
    // This would require access to the map instance
    // For now, it's a placeholder that could be implemented with a map ref
    console.log("View full route clicked");
  };

  const progress = Math.round((currentIndex / (typedRouteData.length - 1)) * 100);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6 z-[1000] bg-card/80 backdrop-blur-md border border-primary/20 rounded-xl shadow-card px-5 py-3"
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

      {/* Map */}
      <MapView
        currentPosition={currentPosition}
        routeCoordinates={routeCoordinates}
        allRoutePoints={typedRouteData}
        isPlaying={isPlaying}
      />

      {/* Controls */}
      <Controls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onRestart={handleRestart}
        onViewFullRoute={handleViewFullRoute}
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
