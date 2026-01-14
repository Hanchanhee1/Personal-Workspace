'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet 아이콘 문제 해결을 위한 지연 설정
const MapWidgetContent: React.FC = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [position, setPosition] = useState<[number, number]>([37.5665, 126.9780]);
    const [isLocationReady, setIsLocationReady] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    
    // 마운트 상태 설정
    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    // Leaflet 아이콘 설정 (클라이언트 사이드에서만 수행)
    useEffect(() => {
        if (!isMounted) return;
        
        const setupLeafletIcons = async () => {
            try {
                // ESLint 오류 방지를 위해 동적 import 사용
                const markerIcon = await import('leaflet/dist/images/marker-icon.png');
                const markerShadow = await import('leaflet/dist/images/marker-shadow.png');
                
                // 다양한 import 형식 처리 (StaticImageData 타입 처리)
                const iconUrl = (typeof markerIcon?.default === 'string' 
                    ? markerIcon.default 
                    : markerIcon?.default?.src || '/marker-icon.png') as string;
                const shadowUrl = (typeof markerShadow?.default === 'string'
                    ? markerShadow.default
                    : markerShadow?.default?.src || '/marker-shadow.png') as string;
                
                const defaultIcon = L.icon({
                    iconUrl: iconUrl,
                    shadowUrl: shadowUrl,
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });

                L.Marker.prototype.options.icon = defaultIcon;
            } catch (error) {
                console.warn('Failed to load Leaflet icons:', error);
            }
        };
        
        setupLeafletIcons();
    }, [isMounted]);

    // 현재 위치를 가져와 지도 중심에 반영
    useEffect(() => {
        if (!isMounted) return;

        if (!navigator.geolocation) {
            setLocationError('이 브라우저에서는 위치 기능을 지원하지 않습니다.');
            setIsLocationReady(true);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition([pos.coords.latitude, pos.coords.longitude]);
                setIsLocationReady(true);
            },
            () => {
                setLocationError('위치 권한이 거부되어 기본 위치로 표시됩니다.');
                setIsLocationReady(true);
            },
            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 0
            }
        );
    }, [isMounted]);

    useEffect(() => {
        if (!isMounted || !isLocationReady) return;
        // DOM 렌더링 이후 MapContainer를 마운트해 Leaflet 초기화 오류 방지
        const frameId = requestAnimationFrame(() => setIsMapReady(true));
        return () => cancelAnimationFrame(frameId);
    }, [isMounted, isLocationReady]);

    if (!isMounted || !isLocationReady || !isMapReady) {
        return <div className="minimal-card h-full flex items-center justify-center">Loading Map...</div>;
    }

    return (
        <div className="minimal-card h-full flex flex-col overflow-hidden relative">
            <div className="absolute z-[1000]" style={{ top: '24px', left: '24px', pointerEvents: 'none' }}>
                <h3 className="text-label" style={{ 
                    background: 'rgba(18, 18, 18, 0.8)', 
                    padding: '8px 12px', 
                    borderRadius: '8px',
                    backdropFilter: 'blur(4px)'
                }}>
                    SAVED PLACES
                </h3>
                {locationError && (
                    <div style={{ marginTop: '8px', color: '#fca5a5', fontSize: '0.75rem', background: 'rgba(18, 18, 18, 0.8)', padding: '6px 10px', borderRadius: '8px' }}>
                        {locationError}
                    </div>
                )}
            </div>

            <div className="flex-1 w-full h-full">
                <MapContainer
                    key={`${position[0]}-${position[1]}`}
                    center={position}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
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

export default MapWidgetContent;
