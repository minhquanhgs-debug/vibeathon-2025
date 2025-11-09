import React, { useMemo } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, InfoWindow } from '@react-google-maps/api';

const RouteMap = ({ routeData, patientLocation }) => {
  // Default center (Joplin, MO)
  const defaultCenter = { lat: 37.0842, lng: -94.5133 };

  // Calculate map center and bounds
  const mapCenter = useMemo(() => {
    if (!routeData || !routeData.route || routeData.route.length === 0) {
      return patientLocation || defaultCenter;
    }

    const locations = [
      patientLocation,
      ...routeData.route.map(node => ({
        lat: node.latitude,
        lng: node.longitude
      }))
    ].filter(Boolean);

    if (locations.length === 0) return defaultCenter;

    // Calculate center point
    const avgLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;

    return { lat: avgLat, lng: avgLng };
  }, [routeData, patientLocation]);

  // Create path for polyline
  const routePath = useMemo(() => {
    if (!routeData || !routeData.route || routeData.route.length === 0) {
      return [];
    }

    const path = [];
    
    // Start from patient location
    if (patientLocation) {
      path.push({ lat: patientLocation.lat, lng: patientLocation.lng });
    }

    // Add service locations in order
    routeData.route.forEach(node => {
      if (node.latitude && node.longitude) {
        path.push({ lat: node.latitude, lng: node.longitude });
      }
    });

    return path;
  }, [routeData, patientLocation]);

  // Map container style
  const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '8px'
  };

  // Map options
  const mapOptions = {
    zoom: 12,
    center: mapCenter,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };

  // Polyline options
  const polylineOptions = {
    strokeColor: '#007bff',
    strokeOpacity: 0.8,
    strokeWeight: 4,
    icons: [
      {
        icon: {
          path: window.google?.maps?.SymbolPath?.FORWARD_CLOSED_ARROW || 'M 0,-1 0,1',
          scale: 3,
          strokeColor: '#007bff'
        },
        offset: '100%',
        repeat: '50px'
      }
    ]
  };

  // Get Google Maps API key from environment or use placeholder
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

  // If no API key, show placeholder
  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return (
      <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Google Maps Integration</h3>
          <p className="text-sm text-gray-600 mb-4">
            Add your Google Maps API key to see the route visualization
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded p-4 text-left text-sm">
            <p className="font-semibold text-blue-800 mb-2">Setup Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Get API key from <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
              <li>Create <code className="bg-blue-100 px-1 rounded">.env</code> in client folder</li>
              <li>Add: <code className="bg-blue-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY=your-key-here</code></li>
              <li>Restart frontend server</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={['places', 'geometry']}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={mapOptions.zoom}
        options={mapOptions}
      >
        {/* Patient location marker */}
        {patientLocation && (
          <Marker
            position={patientLocation}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(40, 40)
            }}
            label={{
              text: 'You',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          />
        )}

        {/* Service location markers */}
        {routeData?.route?.map((node, index) => {
          if (!node.latitude || !node.longitude) return null;

          return (
            <Marker
              key={index}
              position={{ lat: node.latitude, lng: node.longitude }}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new window.google.maps.Size(40, 40)
              }}
              label={{
                text: `${index + 1}`,
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
              title={`${index + 1}. ${node.service_name} - ${node.location}`}
            />
          );
        })}

        {/* Route polyline */}
        {routePath.length > 1 && (
          <Polyline
            path={routePath}
            options={polylineOptions}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default RouteMap;

