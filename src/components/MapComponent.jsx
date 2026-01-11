import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "@iconify/react";
import { geocodeLocation } from "../services/geocodingService";
import L from "leaflet";

// Fix for default marker icon issues in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// map component for displaying collector tasks on map
export default function MapComponent({ tasks }) {
  const [coordinates, setCoordinates] = useState({});
  const [loading, setLoading] = useState(true);

  // geocode task locations on tasks change
  useEffect(() => {
    const geocodeTasks = async () => {
      setLoading(true);
      const newCoords = {};

      for (const task of tasks) {
        const baseAddress = task.location || task.pickupAddress;

        // Skip if no address provided
        if (!baseAddress) continue;

        // Construct full address for better geocoding accuracy
        // Only append context if not already present to avoid duplication
        const fullAddress = baseAddress.toLowerCase().includes("kano")
          ? baseAddress
          : `${baseAddress}, Kano, Nigeria`;

        if (fullAddress && !coordinates[fullAddress]) {
          try {
            const coords = await geocodeLocation(fullAddress);
            newCoords[fullAddress] = coords;
          } catch (error) {
            console.error(`Failed to geocode ${fullAddress}:`, error);
            // use default coordinates for Kano if geocoding fails
            // Add a tiny random offset to default to prevent perfect overlap on fallback too
            const randomOffset = (Math.random() - 0.5) * 0.002;
            newCoords[fullAddress] = {
              lat: 12.0022 + randomOffset,
              lng: 8.5919 + randomOffset,
            };
          }
        }
      }

      setCoordinates((prev) => ({ ...prev, ...newCoords }));
      setLoading(false);
    };

    if (tasks.length > 0) {
      geocodeTasks();
    } else {
      setLoading(false);
    }
  }, [tasks]);

  // handle navigation to external maps app
  const handleNavigate = (coords) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
    window.open(url, "_blank");
  };

  // default center on Kano, Nigeria
  const defaultCenter = [12.0022, 8.5919];

  // Helper to group tasks by their resolved coordinates
  const getClusteredTasks = () => {
    const clusters = {};

    tasks.forEach((task) => {
      const baseAddress = task.location || task.pickupAddress;
      if (!baseAddress) return;

      const fullAddress = baseAddress.toLowerCase().includes("kano")
        ? baseAddress
        : `${baseAddress}, Kano, Nigeria`;

      const coords = coordinates[fullAddress];

      if (coords) {
        // Create a key based on lat/lng to group exact matches
        const key = `${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;
        if (!clusters[key]) {
          clusters[key] = {
            baseCoords: coords,
            tasks: [],
          };
        }
        clusters[key].tasks.push({ ...task, fullAddress });
      }
    });
    return clusters;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const clusters = getClusteredTasks();

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      className="h-full w-full rounded-xl"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {Object.values(clusters).map((cluster) => {
        // If multiple tasks at this location, spread them out in a circle
        const count = cluster.tasks.length;
        const radius = 0.0003 * count; // Adjust spread based on count

        return cluster.tasks.map((task, index) => {
          let finalLat = cluster.baseCoords.lat;
          let finalLng = cluster.baseCoords.lng;

          // Apply jitter if more than one task
          if (count > 1) {
            const angle = (index / count) * 2 * Math.PI;
            finalLat += radius * Math.cos(angle);
            finalLng += radius * Math.sin(angle);
          }

          return (
            <Marker key={task.id} position={[finalLat, finalLng]}>
              <Popup>
                <div className="space-y-2 min-w-[200px]">
                  <h3 className="font-bold text-gray-900 border-b pb-1">
                    {task.userName || "Resident"}
                  </h3>
                  <div className="text-sm space-y-1">
                    {/*<p className="text-gray-600 font-medium">{task.location}</p>*/}
                    <p className="text-gray-500 text-xs">{task.fullAddress}</p>
                    <p className="text-primary font-bold">
                      Amount: ₦{task.amount?.toLocaleString() || 0}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNavigate(cluster.baseCoords)}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    <Icon icon="hugeicons:navigation-01" className="w-4 h-4" />
                    Navigate to Location
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        });
      })}
    </MapContainer>
  );
}
