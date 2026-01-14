import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// React에서 Leaflet 아이콘 문제 해결
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapWidget: React.FC = () => {
    // 서울 좌표를 기본값으로 설정
    const position: [number, number] = [37.5665, 126.9780];

    return (
        <div className="minimal-card h-full flex flex-col overflow-hidden relative">
            <div className="absolute z-[9999]" style={{ top: '24px', left: '24px', pointerEvents: 'none' }}>
                <h3 className="text-label" style={{ 
                    background: 'rgba(18, 18, 18, 0.8)', 
                    padding: '8px 12px', 
                    borderRadius: '8px',
                    backdropFilter: 'blur(4px)'
                }}>
                    SAVED PLACES
                </h3>
            </div>

            <div className="flex-1 w-full h-full">
                <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    {/* Dark Matter Theme Tiles */}
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <Marker position={position}>
                        <Popup>
                            <strong>서울</strong>
                        </Popup>
                    </Marker>

                    <Marker position={[37.5116, 127.0591]}>
                        <Popup>
                            <strong>파스타 맛집</strong>
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>
        </div>
    );
};

export default MapWidget;
