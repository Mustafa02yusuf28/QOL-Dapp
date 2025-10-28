import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MOCK_LOCATIONS_DATA, calculateQoLScore } from '../data/metrics';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Mock API function
async function fetchLocations() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return MOCK_LOCATIONS_DATA.map(location => ({
    ...location,
    overallQoLScore: calculateQoLScore(location)
  }));
}

// Color mapping for QoL scores
function getScoreColor(score: number) {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 60) return '#eab308'; // yellow
  if (score >= 40) return '#f97316'; // orange
  return '#ef4444'; // red
}

interface InteractiveMapProps {
  onLocationSelect: (locationId: string | null) => void;
  selectedLocation: string | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ onLocationSelect, selectedLocation }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map centered on Mohali, India
    const map = L.map(mapContainerRef.current, {
      center: [30.7046, 76.7179], // Mohali coordinates
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Add tile layer with dark theme
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'dark-map-tiles', // Custom class for styling
    }).addTo(map);

    // Add dark filter overlay
    const style = document.createElement('style');
    style.textContent = `
      .dark-map-tiles {
        filter: brightness(0.6) contrast(1.2) saturate(0.3);
      }
    `;
    document.head.appendChild(style);

    mapRef.current = map;

    // Cleanup
    return () => {
      map.remove();
      document.head.removeChild(style);
    };
  }, []);

  // Add markers when locations data is available
  useEffect(() => {
    if (!mapRef.current || !locations) return;

    const map = mapRef.current;
    
    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Custom icon for each location based on QoL score
    locations.forEach(location => {
      const isSelected = selectedLocation === location.id;
      
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: ${isSelected ? '60px' : '50px'};
            height: ${isSelected ? '60px' : '50px'};
            background: linear-gradient(135deg, ${getScoreColor(location.overallQoLScore)}, ${getScoreColor(location.overallQoLScore)}aa);
            border: ${isSelected ? '3px' : '2px'} solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px ${getScoreColor(location.overallQoLScore)}aa;
            transition: all 0.3s ease;
          ">
            <div style="
              color: white;
              font-weight: bold;
              font-size: ${isSelected ? '16px' : '14px'};
              text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            ">
              ${location.overallQoLScore}
            </div>
          </div>
        `,
        iconSize: [isSelected ? 60 : 50, isSelected ? 60 : 50],
        iconAnchor: [isSelected ? 30 : 25, isSelected ? 30 : 25],
      });

      const marker = L.marker([location.coordinates.lat, location.coordinates.lng], {
        icon: icon,
      }).addTo(map);

      // Add popup
      marker.bindPopup(`
        <div style="color: #1a1625;">
          <h3 style="margin: 0 0 8px 0; color: ${getScoreColor(location.overallQoLScore)}; font-weight: bold;">
            ${location.name}
          </h3>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            QoL Score: <strong>${location.overallQoLScore}/100</strong>
          </p>
        </div>
      `);

      // Add click handler
      marker.on('click', () => {
        onLocationSelect(location.id);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map(loc => [loc.coordinates.lat, loc.coordinates.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [locations, selectedLocation, onLocationSelect]);

  return (
    <div 
      ref={mapContainerRef}
      className="w-full h-64 rounded-xl overflow-hidden border-2 border-purple-500/30"
      style={{ 
        filter: 'drop-shadow(0 8px 16px rgba(139, 92, 246, 0.2))',
      }}
    />
  );
};

export default InteractiveMap;

