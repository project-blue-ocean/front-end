/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-webpack-loader-syntax */
/* eslint-disable react/prop-types */
import React, { useRef, useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import Box from '@mui/material/Box';
import mapboxgl from '!mapbox-gl';

const config = require('../../../config');

export default function Map({ location, startCoords, endCoords }) {
  mapboxgl.accessToken = config.mapbox;
  const mapContainer = useRef(null);
  const map = useRef(null);
  useEffect(async () => {
    if (startCoords.longitude === 0 && endCoords.longitude === 0) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [location.longitude, location.latitude],
        zoom: 12,
      });
    } else if (endCoords.longitude === 0) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [startCoords.longitude, startCoords.latitude],
        zoom: 9,
      });
    } else if (startCoords.longitude === 0) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [endCoords.longitude, endCoords.latitude],
        zoom: 9,
      });
    } else {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [
          (startCoords.longitude + endCoords.longitude) / 2,
          (startCoords.latitude + endCoords.latitude) / 2],
        zoom: 2,
      });
      const bounds = [
        [endCoords.longitude, endCoords.latitude],
        [startCoords.longitude, startCoords.latitude],
      ];
      map.current.fitBounds(bounds, { padding: 50 });
      const response = await axios.get('/directions', {
        params: {
          startCoords, endCoords,
        },
      });
      const data = response.data.routes[0];
      const route = data.geometry.coordinates;
      const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route,
        },
      };
      if (map.current.getSource('route')) {
        map.current.getSource('route').setData(geojson);
      } else {
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: geojson,
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75,
          },
        });
      }
    }
  }, [endCoords, startCoords]);

  return (
    <div>
      <Box
        ref={mapContainer}
        style={{
          width: '60vw',
          height: '30vh',
          maxHeight: '50vh',
        }}
        className="map-container"
      />
    </div>
  );
}
