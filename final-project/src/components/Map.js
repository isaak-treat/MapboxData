import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

import Key from "../img/key.png";
import Filter from "./Filter"

mapboxgl.accessToken = 'pk.eyJ1IjoiaXNhYWt0cmVhdHkiLCJhIjoiY2t1Mzhta2xnMW00MzJvczhmNzAxYmFmMyJ9.H05SHwWlCus6O_MBcXFnUQ';

export default function Map() {

    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(-99.0000);
    const [lat, setLat] = useState(38.0000);
    const [zoom, setZoom] = useState(4.00);

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
        map.current.on('load', () => {
          // Add a geojson point source.
          // Heatmap layers also work with a vector tile source.
          map.current.addSource('earthquakes', {
          'type': 'geojson',
          'data': 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson'
          });



        // Used for map layering... static, shouldn't ever need to be touched
        const layers = map.current.getStyle().layers;
        const labelLayerId = layers.find(
          (layer) => layer.type === 'symbol' && layer.layout['text-field']
        ).id;
        
        // 3D Buildings
        map.current.addLayer(
        {
            'id': 'add-3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
              'fill-extrusion-color': '#aaa',

              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.6
            }
          },
          labelLayerId
        );

        // Heatmap
        map.current.addLayer(
        {
          'id': 'earthquakes-heat',
          'type': 'heatmap',
          'source': 'earthquakes',
          'maxzoom': 9,
          'paint': {
          // Increase the heatmap weight based on frequency and property magnitude
          'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'mag'],
          0,
          0,
          6,
          1
          ],
          // Increase the heatmap color weight weight by zoom level
          // heatmap-intensity is a multiplier on top of heatmap-weight
          'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0,
          1,
          9,
          3
          ],
          // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
          // Begin color ramp at 0-stop with a 0-transparancy color
          // to create a blur-like effect.
          'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(33,102,172,0)',
          0.2,
          'rgb(103,169,207)',
          0.4,
          'rgb(209,229,240)',
          0.6,
          'rgb(253,219,199)',
          0.8,
          'rgb(239,138,98)',
          1,
          'rgb(178,24,43)'
          ],
          // Adjust the heatmap radius by zoom level
          'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0,
          2,
          9,
          20
          ],
          // Transition from heatmap to circle layer by zoom level
          'heatmap-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7,
          1,
          9,
          0
          ]
          }
          },
          'waterway-label'
          );
           
          map.current.addLayer(
          {
          'id': 'earthquakes-point',
          'type': 'circle',
          'source': 'earthquakes',
          'minzoom': 7,
          'paint': {
          // Size circle radius by earthquake magnitude and zoom level
          'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7,
          ['interpolate', ['linear'], ['get', 'mag'], 1, 1, 6, 4],
          16,
          ['interpolate', ['linear'], ['get', 'mag'], 1, 5, 6, 50]
          ],
          // Color circle by earthquake magnitude
          'circle-color': [
          'interpolate',
          ['linear'],
          ['get', 'mag'],
          1,
          'rgba(33,102,172,0)',
          2,
          'rgb(103,169,207)',
          3,
          'rgb(209,229,240)',
          4,
          'rgb(253,219,199)',
          5,
          'rgb(239,138,98)',
          6,
          'rgb(178,24,43)'
          ],
          'circle-stroke-color': 'white',
          'circle-stroke-width': 1,
          // Transition from heatmap to circle layer by zoom level
          'circle-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7,
          0,
          8,
          1
          ]
          }
          },
          'waterway-label'
          );
        });


        // Adds moving map functionality
        map.current.on('move', () => {
          setLng(map.current.getCenter().lng.toFixed(4));
          setLat(map.current.getCenter().lat.toFixed(4));
          setZoom(map.current.getZoom().toFixed(2));
        });

        map.current.on('click', 'earthquakes-point', (e) => {
          // Copy coordinates array.
          const coordinates = e.features[0].geometry.coordinates.slice();
          const magnitude = e.features[0].properties.mag;
          const Tsunami = e.features[0].properties.tsunami;
          
          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML("<h3>Magnitude: <h3>" + magnitude + "<h1></h1>" + "<h3>Tsunami: <h3>" + ( Tsunami == 0 ? "<h3>No" : "<h3>Yes" ) )
            .addTo(map.current);
        });

        map.current.on('mouseenter', 'earthquakes-point', () => {
          map.current.getCanvas().style.cursor = 'pointer';
        });
           
          // Change it back to a pointer when it leaves.
        map.current.on('mouseleave', 'earthquakes-point', () => {
          map.current.getCanvas().style.cursor = '';
        });
      });

    return(
        <div>
            <div className="sidebar">
                Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
            <div className="key">
                <img src={Key} alt="Key" />
                <div className="key-text">
                    <p>1.0</p>
                    <p>6.0</p>
                </div>
            </div>
            <div className="filter">
                <Filter />
            </div>
            <div ref={mapContainer} className="map-container" />
        </div>
    )
}
