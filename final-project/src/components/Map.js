import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

import Key from "../img/key.png";
import heatKey from "../img/heatmapbar.jpg";

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

          map.current.addLayer({
            'id': 'sky',
            'type': 'sky',
            'paint': {
            'sky-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0,
            0,
            5,
            0.3,
            8,
            1
            ],
            // set up the sky layer for atmospheric scattering
            'sky-type': 'atmosphere',
            // explicitly set the position of the sun rather than allowing the sun to be attached to the main light source
            // 'sky-atmosphere-sun': getSunPosition(),
            // set the intensity of the sun as a light source (0-100 with higher values corresponding to brighter skies)
            'sky-atmosphere-sun-intensity': 5
            }
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
          10,
          2
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
          'rgba(153,238,255,0)',
          0.2,
          'rgb(102,179,255)',
          0.4,
          'rgb(51,85,255)',
          0.6,
          'rgb(43,0,255)',
          0.8,
          'rgb(0,34,204)',
          1,
          'rgb(0,21,128)'
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
          'rgb(178,24,43)',
          7,
          'rgb(153,0,0)',
          8,
          'rgb(102,0,0)',
          9,
          'rgb(51,0,0)',
          10,
          'rgb(0,0,0)',
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
          
          new mapboxgl.Popup({ closeButton: false })
            .setLngLat(coordinates)
            .addTo(map.current);
        });

        map.current.on('mouseenter', 'earthquakes-point', () => {
          map.current.getCanvas().style.cursor = 'pointer';
        });
           
          // Change it back to a pointer when it leaves.
        map.current.on('mouseleave', 'earthquakes-point', () => {
          map.current.getCanvas().style.cursor = '';
        });

        // Function to add filters to both the heatmap and point layers
        document.getElementById('filterBtn').onclick = function ()
        {
            var filters = []; // Holds all filters (there are 3 guaranteed)

            // Filter for magnitude value
            if (parseFloat(document.getElementById('magEntry').value)) {
                filters.push([document.getElementById("magSelect").value,
                    ["get", "mag"],
                parseFloat(document.getElementById('magEntry').value)]);
            } else {
                filters.push(["has", "mag"]);
            }

            // Filter for tsunami value
            if (document.getElementById("tsunamiSelect").value === "all") {
                filters.push(["has", "tsunami"]);
            } else {
                filters.push(["==", ["get", "tsunami"], parseInt(document.getElementById("tsunamiSelect").value)]);
            }

            // Filter for felt value
            if (document.getElementById("feltSelect").value === "all") {
                filters.push(["has", "felt"]);
            } else if (document.getElementById("feltSelect").value === "yes") {
                filters.push([">=", ["get", "felt"], 1]);
            } else {
                filters.push(["==", ["to-number", ["get", "felt"]], 0]);
            }

            // Set the 3 above filters to the two earthquake layers
            addFilter(filters);
        };

        // Function to clear any active filters
        document.getElementById('clearBtn').onclick = function ()
        {
            map.current.setFilter('earthquakes-point', null);
            map.current.setFilter('earthquakes-heat', null);
            document.getElementById("magEntry").value = null;
            document.getElementById("magSelect").value = ">=";
            document.getElementById("tsunamiSelect").value = "all";
            document.getElementById("feltSelect").value = "all";
        }

        // Function to show and hide (toggle) filters
        document.getElementById('toggleFiltersBtn').onclick = function ()
        {
            if (document.getElementById('filterSet').style.display === "none") {
                document.getElementById('filterSet').style.display = "block";
                document.getElementById('toggleFiltersBtn').textContent = "Hide Filters";
            } else {
                document.getElementById('filterSet').style.display = "none";
                document.getElementById('toggleFiltersBtn').textContent = "Show Filters";
            }
        }
    });

    // Function to add filters to layers, hard-coded to 3 filters
    function addFilter(filters) {
        map.current.setFilter('earthquakes-point', ["all", filters[0], filters[1], filters[2]]);
        map.current.setFilter('earthquakes-heat', ["all", filters[0], filters[1], filters[2]]); 
    }

    return (
        <div>
            <div className="sidebar">
                Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
            <div className="key">
                
                <img src={Key} alt="Key" />
                <div className="key-text">
                    <p>1.0</p>
                    <p>Quake Magnitude (Point)</p>
                    <p>10.0</p>
                </div>
            </div>

            <div className="secondkey">
                
                <img src={heatKey} alt="heatKey" />
                <div className="heatMap">
                    <p>Least</p>
                    <p>Density of Quakes</p>
                    <p>Most</p>
                </div>
            </div>
            
            <div className="filter">
                <button id="toggleFiltersBtn">
                    Show Filters
                </button>

                <div id="filterSet" style={{ display:'none' }}>
                    <br />======Filters======<br /><br />
                    Enter Magnitude:<br/>
                    <input type="text" id="magEntry" /><br /><br/>
                    Filter Magntidue as Minimum or Maximum:<br/>
                    <select id="magSelect">
                        <option value=">=">Minimum</option>
                        <option value="<=">Maximum</option>
                    </select><br/><br/>
                    Filter by Earthquakes that Caused Tsunamis:<br />
                    <select id="tsunamiSelect">
                        <option value="all">Show All</option>
                        <option value="1">Show Only Earthquakes that Caused Tsunamis</option>
                        <option value="0">Show Only Earthquakes that Didn't Cause Tsunamis</option>
                    </select><br /><br />
                    Filter by Earthquakes that <br /> People Reported to have Felt:<br />
                    <select id="feltSelect">
                        <option value="all">Show All</option>
                        <option value="yes">Show Only Felt Earthquakes</option>
                        <option value="no">Show Only Unfelt Earthquakes</option>
                    </select><br /><br />
                    <button id="filterBtn" background-color='transparent' margin-right="50px">
                        Filter
                    </button>
                    <button id="clearBtn" background-color='transparent'>
                        Clear Filters
                    </button>
                </div>
            </div>
            <div ref={mapContainer} className="map-container" />
        </div>
    )
}
