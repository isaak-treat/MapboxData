import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

mapboxgl.accessToken = 'pk.eyJ1IjoiaXNhYWt0cmVhdHkiLCJhIjoiY2t1Mzhta2xnMW00MzJvczhmNzAxYmFmMyJ9.H05SHwWlCus6O_MBcXFnUQ';

export default function App() {

    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(-99);
    const [lat, setLat] = useState(38);
    const [zoom, setZoom] = useState(4);


    // Initializes Map
    useEffect(() => {
        if (map.current) return; // initialize map only once
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/navigation-night-v1',
          center: [lng, lat],
          zoom: zoom
        });
      });

    // Stores Coordinates
    useEffect(() => {
        if (!map.current) return; // wait for map to initialize
        map.current.on('move', () => {
          setLng(map.current.getCenter().lng.toFixed(4));
          setLat(map.current.getCenter().lat.toFixed(4));
          setZoom(map.current.getZoom().toFixed(2));
        });
      });

      return (
        <div>
            <div className="sidebar">
                Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
            <div ref={mapContainer} className="map-container" />
        </div>
      );
}