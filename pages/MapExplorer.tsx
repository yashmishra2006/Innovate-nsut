import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { Layer } from '../types';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import L from 'leaflet';
import { STREET_VIEW_LOCATIONS, getStreetViewLocationsByLayers, StreetViewLocation } from '../data/streetViewLocations';
import { fetchDelhiAQIStations, getAQIColor, getAQILevel, Station } from '../services/xmlAqiService';

// Mock Data
const MOCK_LOCATIONS = {
  center: [28.6139, 77.2090] as [number, number], // New Delhi
  project: [28.6129, 77.2290] as [number, number],
  ev_stations: [
    [28.6100, 77.2000],
    [28.6200, 77.2100],
    [28.6150, 77.1900],
    [28.6050, 77.2150],
  ] as [number, number][],
  trees: [
    [28.6145, 77.2095], [28.6140, 77.2085], [28.6135, 77.2100], [28.6155, 77.2080],
    [28.6160, 77.2110], [28.6125, 77.2070], [28.6110, 77.2090], [28.6130, 77.2060],
  ] as [number, number][],
  solar_potential: [
    [28.6180, 77.2050],
    [28.6190, 77.2060],
    [28.6170, 77.2040],
  ] as [number, number][],
  corridor_path: [
    [28.6129, 77.2290],
    [28.6100, 77.2250],
    [28.6080, 77.2200],
    [28.6050, 77.2150],
    [28.6000, 77.2100]
  ] as [number, number][]
};

const layersData: Layer[] = [
  { id: 'ev', name: 'EV Count', icon: 'ev_station', active: false, colorClass: 'text-blue-600', bgClass: 'bg-blue-100' },
  { id: 'tree', name: 'Tree Cover', icon: 'forest', active: true, colorClass: 'text-green-600', bgClass: 'bg-green-100' },
  { id: 'solar', name: 'Solar Potential', icon: 'wb_sunny', active: false, colorClass: 'text-yellow-600', bgClass: 'bg-yellow-100' },
  { id: 'hotspot', name: 'Hotspot Layer', icon: 'device_thermostat', active: true, colorClass: 'text-red-600', bgClass: 'bg-red-100' },
  { id: 'aqi', name: 'Air Quality Index', icon: 'air', active: false, colorClass: 'text-orange-600', bgClass: 'bg-orange-100' },
  { id: 'corridor', name: 'Green Corridors', icon: 'alt_route', active: true, colorClass: 'text-white', bgClass: 'bg-primary', isAi: true },
  { id: 'shade', name: 'Shade Coverage', icon: 'beach_access', active: false, colorClass: 'text-purple-600', bgClass: 'bg-purple-100' },
];

const MapExplorer: React.FC = () => {
  const [layers, setLayers] = useState<Layer[]>(layersData);
  const [selectedProject, setSelectedProject] = useState<boolean>(false);
  const [selectedStreetView, setSelectedStreetView] = useState<StreetViewLocation | null>(null);

  // Analysis Mode State
  const [isAnalysisMode, setIsAnalysisMode] = useState(false);
  const [regionAnalysis, setRegionAnalysis] = useState<any>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{ [key: string]: L.LayerGroup }>({});
  const analysisLayerRef = useRef<L.LayerGroup | null>(null);
  const streetViewLayerRef = useRef<L.LayerGroup | null>(null);

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, active: !l.active } : l));
  };

  // Initialize Map
  useEffect(() => {
    const timer = setTimeout(() => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
            zoomControl: false,
            attributionControl: false
        }).setView(MOCK_LOCATIONS.center, 14);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        mapInstanceRef.current = map;

        // Initialize layer groups
        layerGroupsRef.current = {
            ev: L.layerGroup().addTo(map),
            tree: L.layerGroup().addTo(map),
            solar: L.layerGroup().addTo(map),
            hotspot: L.layerGroup().addTo(map),
            aqi: L.layerGroup().addTo(map),
            corridor: L.layerGroup().addTo(map),
            shade: L.layerGroup().addTo(map),
            project: L.layerGroup().addTo(map)
        };

        // Initialize Analysis Layer
        analysisLayerRef.current = L.layerGroup().addTo(map);
        
        // Initialize Street View Layer
        streetViewLayerRef.current = L.layerGroup().addTo(map);

        // EV charging stations icon
        const evIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full border-2 border-white shadow-md"><span class="material-symbols-outlined text-[18px]">ev_station</span></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        // Load EV charging stations from GeoJSON
        fetch('/data/ev_charging_stations.geojson')
          .then(res => res.json())
          .then((data: any) => {
            if (data.features) {
              data.features.forEach((feature: any) => {
                const geom = feature.geometry;
                if (!geom) return;

                if (geom.type === 'Point') {
                  const [lng, lat] = geom.coordinates;
                  L.marker([lat, lng], { icon: evIcon }).addTo(layerGroupsRef.current.ev);
                } else if (geom.type === 'Polygon') {
                  const coords = geom.coordinates?.[0];
                  if (!coords || !coords.length) return;
                  const lngs = coords.map((c: number[]) => c[0]);
                  const lats = coords.map((c: number[]) => c[1]);
                  const avgLng = lngs.reduce((a: number, b: number) => a + b, 0) / lngs.length;
                  const avgLat = lats.reduce((a: number, b: number) => a + b, 0) / lats.length;
                  L.marker([avgLat, avgLng], { icon: evIcon }).addTo(layerGroupsRef.current.ev);
                }
              });
            }
          })
          .catch(err => console.error('Error loading EV stations GeoJSON:', err));

        // Load tree cover data from GeoJSON
        fetch('/data/tree_cover_vegetation.geojson')
          .then(res => res.json())
          .then((data: any) => {
            if (data.features) {
              data.features.forEach((feature: any) => {
                const geom = feature.geometry;
                if (!geom) return;

                if (geom.type === 'Point') {
                  const [lng, lat] = geom.coordinates;
                  L.circleMarker([lat, lng], {
                    radius: 8,
                    color: '#16a34a',
                    fillColor: '#22c55e',
                    fillOpacity: 0.7,
                    weight: 2
                  }).addTo(layerGroupsRef.current.tree);
                } else if (geom.type === 'Polygon') {
                  const coords = geom.coordinates[0].map((c: number[]) => [c[1], c[0]]);
                  L.polygon(coords, {
                    color: '#16a34a',
                    fillColor: '#22c55e',
                    fillOpacity: 0.6,
                    weight: 2
                  }).addTo(layerGroupsRef.current.tree);
                }
              });
            }
          })
          .catch(err => console.error('Error loading tree cover GeoJSON:', err));

        // Load solar panels data from GeoJSON
        fetch('/data/solarPanelsDATA.geojson')
          .then(res => res.json())
          .then((data: any) => {
            if (data.features) {
              data.features.forEach((feature: any) => {
                const geom = feature.geometry;
                const props = feature.properties || {};
                if (!geom) return;

                const solarIcon = L.divIcon({
                  className: 'custom-div-icon',
                  html: `<div class="flex items-center justify-center w-7 h-7 bg-yellow-100 text-yellow-600 rounded-full border-2 border-white shadow-md"><span class="material-symbols-outlined text-[16px]">solar_power</span></div>`,
                  iconSize: [28, 28],
                  iconAnchor: [14, 14],
                });

                if (geom.type === 'Point') {
                  const [lng, lat] = geom.coordinates;
                  L.marker([lat, lng], { icon: solarIcon })
                    .bindPopup(`<div class="text-sm"><strong>Solar Panel</strong><br/>${props.name || 'Installation'}</div>`)
                    .addTo(layerGroupsRef.current.solar);
                } else if (geom.type === 'Polygon') {
                  const coords = geom.coordinates[0].map((c: number[]) => [c[1], c[0]]);
                  const lngs = geom.coordinates[0].map((c: number[]) => c[0]);
                  const lats = geom.coordinates[0].map((c: number[]) => c[1]);
                  const avgLng = lngs.reduce((a: number, b: number) => a + b, 0) / lngs.length;
                  const avgLat = lats.reduce((a: number, b: number) => a + b, 0) / lats.length;
                  L.polygon(coords, {
                    color: '#eab308',
                    fillColor: '#fbbf24',
                    fillOpacity: 0.5,
                    weight: 2
                  }).addTo(layerGroupsRef.current.solar);
                  L.marker([avgLat, avgLng], { icon: solarIcon })
                    .bindPopup(`<div class="text-sm"><strong>Solar Panel</strong><br/>${props.name || 'Installation'}</div>`)
                    .addTo(layerGroupsRef.current.solar);
                }
              });
            }
          })
          .catch(err => console.error('Error loading solar panels GeoJSON:', err));

        [
            [28.6110, 77.2050], [28.6180, 77.2150]
        ].forEach((loc: any) => {
            L.circle(loc, {
            radius: 300,
            color: 'transparent',
            fillColor: '#ef4444',
            fillOpacity: 0.2
            }).addTo(layerGroupsRef.current.hotspot);
        });

        // AQI Layer - Initialize empty, will be populated when toggled
        layerGroupsRef.current.aqi = L.layerGroup();

        // Green Corridor
        const corridorLine = L.polyline(MOCK_LOCATIONS.corridor_path, {
            color: '#11d432',
            weight: 6,
            dashArray: '10, 10',
            opacity: 0.8
        }).addTo(layerGroupsRef.current.corridor);

        // Click on line to open details
        corridorLine.on('click', () => {
             setSelectedProject(true);
             setRegionAnalysis(null); // Close region drawer if open
             map.flyTo(MOCK_LOCATIONS.project, 15, { animate: true });
        });

        // Halo for corridor
        L.polyline(MOCK_LOCATIONS.corridor_path, {
            color: '#11d432',
            weight: 20,
            opacity: 0.2,
            lineCap: 'round'
        }).addTo(layerGroupsRef.current.corridor);

        // Project Pin
        const projectIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="relative flex items-center justify-center w-8 h-8 cursor-pointer group">
                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                    <div class="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg border-2 border-white transform transition-transform group-hover:scale-110">
                        <span class="material-symbols-outlined text-[18px]">star</span>
                    </div>
                    </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        const projectMarker = L.marker(MOCK_LOCATIONS.project, { icon: projectIcon }).addTo(layerGroupsRef.current.project);
        projectMarker.on('click', () => {
            setSelectedProject(true);
            setRegionAnalysis(null);
            map.flyTo([MOCK_LOCATIONS.project[0], MOCK_LOCATIONS.project[1] - 0.005], 15, { animate: true });
        });

        setTimeout(() => {
            map.invalidateSize();
        }, 100);
        }
    }, 100);

    return () => {
        clearTimeout(timer);
    };
  }, []);

  // Analysis Mode Logic
  useEffect(() => {
      const map = mapInstanceRef.current;
      if (!map) return;

      const handleMapClick = (e: L.LeafletMouseEvent) => {
          if (isAnalysisMode && analysisLayerRef.current) {
              // Clear previous
              analysisLayerRef.current.clearLayers();

              const { lat, lng } = e.latlng;

              // Draw selection box/polygon
              const bounds = [
                 [lat + 0.004, lng - 0.004],
                 [lat + 0.004, lng + 0.004],
                 [lat - 0.004, lng + 0.004],
                 [lat - 0.004, lng - 0.004]
              ];

              L.polygon(bounds as any, {
                  color: '#2563eb',
                  weight: 2,
                  fillColor: '#3b82f6',
                  fillOpacity: 0.15,
                  dashArray: '6, 6'
              }).addTo(analysisLayerRef.current);

              L.marker([lat, lng], {
                  icon: L.divIcon({
                      className: 'custom-div-icon',
                      html: `<div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md animate-bounce"></div>`,
                      iconSize: [16, 16]
                  })
              }).addTo(analysisLayerRef.current);

              // Set mock data
              setRegionAnalysis({
                  coordinates: [lat, lng],
                  name: `Sector ${Math.floor(Math.random() * 20) + 1}`,
                  heatScore: Math.floor(Math.random() * 30) + 60, // 60-90
                  greenScore: Math.floor(Math.random() * 40) + 20, // 20-60
                  stats: {
                    trees: Math.floor(Math.random() * 200) + 50,
                    ev: Math.floor(Math.random() * 12),
                    solar: Math.floor(Math.random() * 50) + 10,
                    area: (Math.random() * 2 + 0.5).toFixed(1) // km2
                  },
                  recommendations: [
                     { title: "Increase Tree Canopy", impact: "High", icon: "forest", desc: "Plant 200+ native shade trees to reduce surface temps by 3°C." },
                     { title: "Cool Roof Retrofit", impact: "Medium", icon: "roofing", desc: "Apply reflective coating to industrial roofs in this sector." },
                     { title: "Permeable Pavements", impact: "Medium", icon: "water_drop", desc: "Replace 15% of asphalt with permeable materials." }
                  ]
              });

              setSelectedProject(false); // Close project drawer if open
          }
      };

      map.on('click', handleMapClick);

      // Update cursor
      if (mapContainerRef.current) {
          mapContainerRef.current.style.cursor = isAnalysisMode ? 'crosshair' : 'grab';
      }

      return () => {
          map.off('click', handleMapClick);
      }
  }, [isAnalysisMode]);

  // Update Layers Visibility
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    layers.forEach(layer => {
      const group = layerGroupsRef.current[layer.id];
      if (group) {
        if (layer.active) {
          if (!mapInstanceRef.current!.hasLayer(group)) {
             mapInstanceRef.current!.addLayer(group);
          }
        } else {
          if (mapInstanceRef.current!.hasLayer(group)) {
             mapInstanceRef.current!.removeLayer(group);
          }
        }
      }
    });

    const projectGroup = layerGroupsRef.current['project'];
    const corridorActive = layers.find(l => l.id === 'corridor')?.active;
    if (corridorActive) {
        if (!mapInstanceRef.current!.hasLayer(projectGroup)) mapInstanceRef.current!.addLayer(projectGroup);
    } else {
        if (mapInstanceRef.current!.hasLayer(projectGroup)) mapInstanceRef.current!.removeLayer(projectGroup);
    }

  }, [layers]);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-200 font-display">
      <Navbar />
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Map Container */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full" />

        {/* Analyze Mode Overlay Hint */}
        {isAnalysisMode && !regionAnalysis && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[450] bg-blue-600 text-white px-6 py-2 rounded-full shadow-lg font-bold animate-bounce">
                Click anywhere on the map to analyze region
            </div>
        )}

        {/* Floating Sidebar */}
        <div className="absolute left-6 top-6 bottom-6 z-[400] w-80 flex flex-col gap-4 pointer-events-none">
            {/* Search */}
            <div className="pointer-events-auto bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-2 border border-slate-200">
            <div className="flex items-center gap-2 px-3 h-12">
                <span className="material-symbols-outlined text-slate-400">search</span>
                <input
                type="text"
                placeholder="Search city or coordinates"
                className="bg-transparent border-none focus:ring-0 w-full text-sm font-medium placeholder:text-slate-400 text-slate-800 focus:outline-none"
                defaultValue="New Delhi, India"
                />
            </div>
            </div>

            {/* Layers Panel */}
            <div className="pointer-events-auto flex-1 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB9-Nb3aRjGhOZIvN0KnPMSCH1Zq92I-mzZxS0U1KKqDca_jO2kceKq5myUjsXLytS3mDwBh_8JpgvEr5-6NYLgYbrLTOzglmiYqPQvebCV2LI7wmd61GQw_NzYgECi1g85NUmYby48JcdKPo9ikuUXWOibAvfk_bMHMxfugGKzUE8pdBSb1qocLpcEkNrYyQK12HeixNX7J6sf4CPtwSe1qAlTFPmP8z-lpkN3StUs9scGECNNA_6r-dywHEeiRfgosGIY8YTUeg')"}}></div>
                <div>
                    <h1 className="text-slate-900 text-base font-bold leading-tight">Data Layers</h1>
                    <p className="text-primary text-xs font-medium uppercase tracking-wider">Map Overlays</p>
                </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {layers.map((layer) => (
                    <label
                    key={layer.id}
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${layer.active ? (layer.isAi ? 'bg-primary/10 border border-primary/20' : layer.bgClass.replace('100', '50')) : 'hover:bg-slate-50'}`}
                    onClick={() => toggleLayer(layer.id)}
                    >
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${layer.isAi ? 'bg-primary text-white shadow-sm' : `${layer.bgClass} ${layer.colorClass}`}`}>
                        <span className="material-symbols-outlined text-[20px]">{layer.icon}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">{layer.name}</span>
                            {layer.isAi && <span className="text-[10px] text-primary uppercase font-bold tracking-wider">AI Suggested</span>}
                        </div>
                    </div>
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${layer.active ? 'bg-primary' : 'bg-slate-200'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${layer.active ? 'translate-x-6' : 'translate-x-1'}`}></span>
                    </div>
                    </label>
                ))}
            </div>
            </div>
        </div>

        {/* Right Controls */}
        <div className="absolute right-6 top-6 z-[400] flex flex-col items-end gap-4 pointer-events-none">
            <button
                className={`pointer-events-auto group relative flex items-center justify-center overflow-hidden rounded-full h-12 px-6 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${isAnalysisMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-slate-900 hover:bg-slate-50'}`}
                onClick={() => {
                    setIsAnalysisMode(!isAnalysisMode);
                    if(!isAnalysisMode) {
                        setRegionAnalysis(null);
                        setSelectedProject(false);
                    }
                }}
            >
                <span className="material-symbols-outlined mr-2 text-[20px]">{isAnalysisMode ? 'close' : 'manage_search'}</span>
                <span className="text-sm font-bold tracking-wide">{isAnalysisMode ? 'Exit Analysis Mode' : 'Analyze Region'}</span>
            </button>

            <button
            className="pointer-events-auto group relative flex items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-primary hover:bg-green-500 text-slate-900 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            onClick={() => {
                toggleLayer('corridor');
                if (!layers.find(l=>l.id==='corridor')?.active) {
                    mapInstanceRef.current?.flyTo(MOCK_LOCATIONS.project, 14, { duration: 1.5 });
                }
            }}
            >
                <span className="material-symbols-outlined mr-2 text-[20px] animate-pulse">auto_awesome</span>
                <span className="text-sm font-bold tracking-wide">Suggest Green Corridors</span>
            </button>

            <div className="pointer-events-auto flex flex-col bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-slate-200 overflow-hidden mt-4">
                <button className="flex w-10 h-10 items-center justify-center hover:bg-slate-100 border-b border-slate-100 text-slate-700" onClick={() => mapInstanceRef.current?.zoomIn()}><span className="material-symbols-outlined">add</span></button>
                <button className="flex w-10 h-10 items-center justify-center hover:bg-slate-100 text-slate-700" onClick={() => mapInstanceRef.current?.zoomOut()}><span className="material-symbols-outlined">remove</span></button>
            </div>
        </div>

        {/* Legend */}
        <div className="absolute right-6 bottom-6 z-[400] pointer-events-auto bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-slate-200 p-4 w-64">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Legend</h3>
                <span className="material-symbols-outlined text-slate-400 text-[18px] cursor-pointer">expand_more</span>
            </div>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-[10px] font-medium text-slate-600 mb-1">
                    <span>Urban Heat</span>
                    <span>Intensity</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gradient-to-r from-yellow-200 via-orange-400 to-red-600"></div>
                </div>
                <div>
                    <div className="flex justify-between text-[10px] font-medium text-slate-600 mb-1">
                    <span>Corridor Feasibility</span>
                    <span>AI Score</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gradient-to-r from-slate-200 to-primary"></div>
                </div>
            </div>
        </div>

        {/* 1. PROJECT DETAILS / STREET VIEW CARD */}
        <div
            className={`absolute top-4 right-4 bottom-4 w-[480px] z-[500] flex flex-col bg-surface-light shadow-2xl rounded-2xl border border-gray-200 overflow-hidden transition-transform duration-300 ease-in-out ${selectedProject && !selectedStreetView ? 'translate-x-0' : 'translate-x-[120%]'}`}
        >
            <div className="relative h-64 w-full bg-slate-900 shrink-0">
                <BeforeAfterSlider
                    beforeImage="https://lh3.googleusercontent.com/aida-public/AB6AXuAFH6zu0Et-9Sr7LNGZ9Q4TJ_qqqYygiv3BHgpi6kDsXvunnapFePQ-7YY19y85eCxta4UU9sbrqOAvWxcVpiqoYaQomwpcrWvBEOTfsn0hC2P0hMIYdyQCs_p24K-8CH_OrfQ2-pycbIpol6uk6A9kWM4Az9Lw83mqbVXwa2eq_H4aR8Bmt1UTGuaz-qyKeHojAGWqMmjxEODYUYI_K731styzmAQjkkw9Z2J7oAovwIx_qsmocc1nVhKGws5DaMITrJFGykpcOg"
                    afterImage="https://lh3.googleusercontent.com/aida-public/AB6AXuA_zSknFTIPjy5_EZF6yIggEP5tC0qAKaRybv0DHDRPJ0mN2tjaNZy5vYJ5xUw-ARmRmfR30EUJn8TG2ZBK5KZTB6PkGoBgxm0vU4ZI_Kitnb_u2u8FqAvmp9RoAlpZd84URks9ck-b0yKlbqbryYMFllNwgoQ03QcYZWiOE7_QP5SObleVBq368VbCSv3T0JtCB7q9-IcYjx10yoj5HU1nb1YDDiRv0KumaP_iNeY0V2LM6RyPpYxXEIQkbcwA6sWjv-BBOa4SRg"
                    labelBefore="Current"
                    labelAfter="AI Proposed"
                />
                <button onClick={() => setSelectedProject(false)} className="absolute top-4 right-4 p-2 bg-black/50 text-white hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors z-30">
                   <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
                <div className="absolute bottom-4 left-4 z-30">
                    <span className="px-3 py-1 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">Street View AI</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="flex flex-col gap-2 mb-6">
                    <div className="flex items-center gap-2">
                         <h1 className="text-slate-900 text-2xl font-bold leading-tight">Green Corridor Phase 1</h1>
                         <span className="material-symbols-outlined text-green-500">verified</span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Proposed transformation for West 4th Avenue connector.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <MetricCard icon="forest" label="Trees" value="+145" subValue="Native Species" subColor="text-green-600" />
                    <MetricCard icon="thermostat" label="Cooling" value="-2.4°C" subValue="Surface Temp" subColor="text-blue-500" iconBg="bg-blue-100" iconColor="text-blue-500" />
                </div>

                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Project Highlights</h3>
                <div className="space-y-3">
                    <HighlightRow icon="directions_bike" title="Protected Cycle Lane" desc="2.5km of dedicated lanes connecting north to south." />
                    <HighlightRow icon="water_drop" title="Stormwater Management" desc="Bioswales integrated into medians to reduce runoff." />
                    <HighlightRow icon="solar_power" title="Smart Lighting" desc="Solar-powered adaptive street lights." />
                </div>

                <button className="w-full mt-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">download</span> Download Proposal PDF
                </button>
            </div>
        </div>

        {/* STREET VIEW LOCATION DRAWER */}
        <div
            className={`absolute top-4 right-4 bottom-4 w-[480px] z-[500] flex flex-col bg-surface-light shadow-2xl rounded-2xl border border-gray-200 overflow-hidden transition-transform duration-300 ease-in-out ${selectedStreetView ? 'translate-x-0' : 'translate-x-[120%]'}`}
        >
            {selectedStreetView && (
              <>
                <div className="relative w-full shrink-0">
                  <BeforeAfterSlider
                      beforeImage={selectedStreetView.beforeImage}
                      afterImage={selectedStreetView.afterImage}
                      labelBefore="Before"
                      labelAfter="After"
                  />
                  <button 
                    onClick={() => setSelectedStreetView(null)} 
                    className="absolute top-4 right-4 p-2 bg-black/50 text-white hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors z-30"
                  >
                     <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                  <div className="absolute bottom-4 left-4 z-30">
                      <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">Street View</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <div className="flex flex-col gap-2 mb-6">
                      <div className="flex items-center gap-2">
                           <h1 className="text-slate-900 text-2xl font-bold leading-tight">{selectedStreetView.name}</h1>
                      </div>
                      <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-blue-500 text-[18px]">location_on</span>
                          <p className="text-sm text-gray-500">
                            {selectedStreetView.coords[0].toFixed(4)}, {selectedStreetView.coords[1].toFixed(4)}
                          </p>
                      </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                      <p className="text-sm text-blue-900 leading-relaxed">
                        {selectedStreetView.description}
                      </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">category</span> Transformation Category
                    </h3>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        selectedStreetView.category === 'tree' ? 'bg-green-100 text-green-700' :
                        selectedStreetView.category === 'solar' ? 'bg-yellow-100 text-yellow-700' :
                        selectedStreetView.category === 'corridor' ? 'bg-primary/10 text-primary' :
                        selectedStreetView.category === 'shade' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {selectedStreetView.category}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">lightbulb</span> Key Features
                    </h3>
                    {selectedStreetView.category === 'tree' && (
                      <>
                        <HighlightRow icon="forest" title="Tree Canopy" desc="Added dense urban tree coverage for cooling and air quality." />
                        <HighlightRow icon="park" title="Green Spaces" desc="Integrated pocket parks and vegetation zones." />
                      </>
                    )}
                    {selectedStreetView.category === 'solar' && (
                      <>
                        <HighlightRow icon="solar_power" title="Solar Panels" desc="Rooftop and carport solar installations for clean energy." />
                        <HighlightRow icon="bolt" title="Energy Storage" desc="Grid-tied battery systems for stable power supply." />
                      </>
                    )}
                    {selectedStreetView.category === 'corridor' && (
                      <>
                        <HighlightRow icon="alt_route" title="Green Corridor" desc="Continuous vegetation pathway connecting urban areas." />
                        <HighlightRow icon="pedal_bike" title="Bike Lanes" desc="Dedicated cycling infrastructure for sustainable transport." />
                      </>
                    )}
                    {selectedStreetView.category === 'shade' && (
                      <>
                        <HighlightRow icon="beach_access" title="Shade Structures" desc="Modern canopy systems for pedestrian comfort." />
                        <HighlightRow icon="cool_to_dry" title="Cool Surfaces" desc="Heat-reflective materials to reduce urban heat island effect." />
                      </>
                    )}
                    {selectedStreetView.category === 'mixed' && (
                      <>
                        <HighlightRow icon="forest" title="Tree Coverage" desc="Comprehensive urban forestry integration." />
                        <HighlightRow icon="solar_power" title="Solar Energy" desc="Renewable energy infrastructure deployment." />
                        <HighlightRow icon="alt_route" title="Green Corridors" desc="Connected green spaces for biodiversity." />
                      </>
                    )}
                  </div>

                  <button className="w-full mt-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined">auto_awesome</span> Generate AI Proposal
                  </button>
                </div>
              </>
            )}
        </div>

        {/* 2. REGION ANALYSIS DRAWER */}
        <div
            className={`absolute top-4 right-4 bottom-4 w-[400px] z-[500] flex flex-col bg-surface-light shadow-2xl rounded-2xl border border-gray-200 overflow-hidden transition-transform duration-300 ease-in-out ${regionAnalysis && !selectedStreetView ? 'translate-x-0' : 'translate-x-[120%]'}`}
        >
             <div className="bg-blue-600 p-6 text-white shrink-0 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-10 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                 <div className="relative z-10">
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2 bg-white/20 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-sm">analytics</span> AI Analysis
                        </div>
                        <button onClick={() => setRegionAnalysis(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><span className="material-symbols-outlined">close</span></button>
                     </div>
                     <h2 className="text-2xl font-bold mb-1">{regionAnalysis?.name || "Region Analysis"}</h2>
                     <p className="text-blue-100 text-sm">Based on satellite & sensor data</p>
                 </div>
             </div>

             <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                 {regionAnalysis && (
                     <>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col items-center justify-center gap-1">
                                <span className="text-3xl font-black text-slate-800">{regionAnalysis.heatScore}</span>
                                <span className="text-xs font-bold text-red-500 uppercase">Heat Risk</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col items-center justify-center gap-1">
                                <span className="text-3xl font-black text-slate-800">{regionAnalysis.greenScore}%</span>
                                <span className="text-xs font-bold text-green-500 uppercase">Green Cover</span>
                            </div>
                        </div>

                        {/* REGION COUNTS SECTION */}
                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-500">inventory_2</span> Region Assets
                        </h3>
                        <div className="grid grid-cols-4 gap-2 mb-6 border-b border-gray-200 pb-6">
                            <div className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                                <span className="material-symbols-outlined text-green-600 mb-1">forest</span>
                                <span className="text-lg font-bold text-slate-800">{regionAnalysis.stats.trees}</span>
                                <span className="text-[10px] text-gray-400 uppercase">Trees</span>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                                <span className="material-symbols-outlined text-blue-600 mb-1">ev_station</span>
                                <span className="text-lg font-bold text-slate-800">{regionAnalysis.stats.ev}</span>
                                <span className="text-[10px] text-gray-400 uppercase">EVs</span>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                                <span className="material-symbols-outlined text-yellow-600 mb-1">solar_power</span>
                                <span className="text-lg font-bold text-slate-800">{regionAnalysis.stats.solar}</span>
                                <span className="text-[10px] text-gray-400 uppercase">Solar</span>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                                <span className="material-symbols-outlined text-purple-600 mb-1">square_foot</span>
                                <span className="text-lg font-bold text-slate-800">{regionAnalysis.stats.area}</span>
                                <span className="text-[10px] text-gray-400 uppercase">km²</span>
                            </div>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">auto_awesome</span> AI Recommendations
                        </h3>

                        <div className="space-y-3">
                            {regionAnalysis.recommendations.map((rec: any, idx: number) => (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-primary/30 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded text-lg">{rec.icon}</span>
                                            <span className="font-bold text-slate-800 text-sm">{rec.title}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rec.impact === 'High' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>{rec.impact} Impact</span>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed pl-8">{rec.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 bg-blue-50 border border-blue-100 p-4 rounded-xl">
                            <p className="text-xs text-blue-800 font-medium text-center">Selecting this zone for intervention could reduce local temperatures by an estimated 1.5°C.</p>
                        </div>
                     </>
                 )}
             </div>
        </div>

      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, subValue, subColor, iconBg = "bg-primary/10", iconColor = "text-primary" }: any) => (
    <div className="bg-gray-50 p-4 rounded-xl flex flex-col gap-1 border border-transparent hover:border-primary/30 transition-colors">
       <div className="flex items-center gap-2 mb-1">
          <div className={`${iconBg} p-1.5 rounded-lg ${iconColor}`}>
             <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase">{label}</span>
       </div>
       <p className="text-2xl font-bold text-slate-900">{value}</p>
       <p className={`text-xs ${subColor} font-medium`}>{subValue}</p>
    </div>
);

const HighlightRow = ({ icon, title, desc }: any) => (
    <div className="flex gap-3 items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
        <span className="material-symbols-outlined text-gray-400 mt-0.5">{icon}</span>
        <div>
            <h4 className="text-sm font-bold text-slate-800">{title}</h4>
            <p className="text-xs text-gray-500 leading-snug">{desc}</p>
        </div>
    </div>
);

export default MapExplorer;