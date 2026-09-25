import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const color = value => value >= 80 ? '#33ae60' : value >= 70 ? '#9dc958' : '#e6ad42';
export const FieldMap = ({ data, selected, onSelect, snapshot = 2, mode = 'ndvi', compare = false }) => {
  const element = useRef(null);
  const map = useRef(null);
  const shapes = useRef([]);
  const click = useRef(onSelect);
  useEffect(() => { click.current = onSelect; }, [onSelect]);
  useEffect(() => {
    if (!data || !element.current) return;
    const instance = L.map(element.current, { crs: L.CRS.Simple, attributionControl: false, scrollWheelZoom: false, zoomControl: false, minZoom: -2, maxZoom: 2 });
    const bounds = [[0, 0], [800, 1000]];
    L.imageOverlay(data.image, bounds, { alt: 'Reference aerial landscape, illustrative field boundaries' }).addTo(instance);
    instance.fitBounds(bounds);
    map.current = instance;
    const resize = new ResizeObserver(() => instance.invalidateSize()); resize.observe(element.current);
    return () => { resize.disconnect(); instance.remove(); map.current = null; };
  }, [data]);
  useEffect(() => {
    const instance = map.current; if (!instance || !data) return;
    shapes.current.forEach(layer => instance.removeLayer(layer));
    shapes.current = data.fields.map(field => {
      const polygon = L.polygon(field.boundary, { color: field.id === selected ? '#fff8c5' : '#ffffffb0', weight: field.id === selected ? 3 : 1.5, fillColor: color(field.health[snapshot]), fillOpacity: mode === 'ndvi' ? 0.67 : 0.07 }).addTo(instance);
      polygon.bindTooltip(`${field.name} · ${field.health[snapshot]}%`, { permanent: true, direction: 'center', className: 'field-tooltip' });
      polygon.on('click', () => click.current?.(field.id)); return polygon;
    });
  }, [data, selected, snapshot, mode]);
  return <div className={`field-map-tool ${compare ? 'comparison-map' : ''}`}><div ref={element} className="leaflet-field" data-testid={compare ? `compare-map-${snapshot}` : 'field-map'} /><div className="map-control-stack"><button title="Zoom in" aria-label="Zoom in" data-testid={compare ? `compare-zoom-in-${snapshot}` : 'map-zoom-in'} onClick={() => map.current?.zoomIn()}>+</button><button title="Zoom out" aria-label="Zoom out" data-testid={compare ? `compare-zoom-out-${snapshot}` : 'map-zoom-out'} onClick={() => map.current?.zoomOut()}>−</button><button title="Reset view" aria-label="Reset map view" data-testid={compare ? `compare-reset-${snapshot}` : 'map-reset'} onClick={() => map.current?.fitBounds([[0, 0], [800, 1000]])}>⌖</button></div><span className="map-north" aria-hidden="true">N ↑</span><span className="map-watermark" data-testid={compare ? `compare-map-note-${snapshot}` : 'map-demo-watermark'}>ILLUSTRATIVE FIELD MAP</span></div>;
};