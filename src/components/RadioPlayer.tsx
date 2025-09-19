import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Play, Pause, Radio, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RadioStation {
  name: string;
  url: string;
}

const RadioPlayer = () => {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load stations from JSON file
    fetch('/stations.json')
      .then(response => response.json())
      .then(data => {
        setStations(data);
        if (data.length > 0) {
          setCurrentStation(data[0]);
        }
      })
      .catch(error => {
        console.error('Error loading stations:', error);
        toast({
          title: "Error",
          description: "Failed to load radio stations",
          variant: "destructive",
        });
      });
  }, [toast]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('loadstart', () => setIsLoading(true));
      audioRef.current.addEventListener('canplay', () => setIsLoading(false));
      audioRef.current.addEventListener('error', () => {
        setIsLoading(false);
        setIsPlaying(false);
        toast({
          title: "Playback Error",
          description: "Unable to play this station",
          variant: "destructive",
        });
      });
    }
  }, [toast]);

  const handlePlay = async () => {
    if (!currentStation || !audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.src = currentStation.url;
        await audioRef.current.play();
        setIsPlaying(true);
        toast({
          title: "Now Playing",
          description: currentStation.name,
        });
      }
    } catch (error) {
      console.error('Playback error:', error);
      setIsPlaying(false);
      toast({
        title: "Playback Error",
        description: "Unable to play this station",
        variant: "destructive",
      });
    }
  };

  const handleStationChange = (stationName: string) => {
    const station = stations.find(s => s.name === stationName);
    if (station) {
      setCurrentStation(station);
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-8 bg-gradient-to-br from-radio-gradient-start to-radio-gradient-end border-0 shadow-2xl shadow-radio-shadow/20">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Radio className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">PWA Radio</h1>
          </div>
          
          {/* Current Station Display */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <p className="text-sm text-white/80 mb-1">Now Playing</p>
            <p className="text-lg font-semibold text-white truncate">
              {currentStation?.name || "Select a station"}
            </p>
            {isPlaying && (
              <div className="flex items-center justify-center space-x-1 mt-2">
                <div className="w-1 h-4 bg-radio-playing rounded animate-pulse"></div>
                <div className="w-1 h-6 bg-radio-playing rounded animate-pulse delay-100"></div>
                <div className="w-1 h-3 bg-radio-playing rounded animate-pulse delay-200"></div>
                <div className="w-1 h-5 bg-radio-playing rounded animate-pulse delay-300"></div>
              </div>
            )}
          </div>
        </div>

        {/* Station Selector */}
        <div className="space-y-2">
          <label className="text-white/90 text-sm font-medium">Select Station</label>
          <Select onValueChange={handleStationChange} value={currentStation?.name || ""}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-md">
              <SelectValue placeholder="Choose a radio station" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-lg border-0">
              {stations.map((station) => (
                <SelectItem key={station.name} value={station.name}>
                  {station.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={handlePlay}
            disabled={!currentStation || isLoading}
            size="lg"
            variant="secondary"
            className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 border-white/30 backdrop-blur-md transition-all duration-300 hover:scale-105"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </Button>
        </div>

        {/* Volume Indicator */}
        {isPlaying && (
          <div className="flex items-center justify-center space-x-2 text-white/70">
            <Volume2 className="w-4 h-4" />
            <span className="text-sm">Streaming live</span>
          </div>
        )}
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        preload="none"
        className="hidden"
      />
    </Card>
  );
};

export default RadioPlayer;