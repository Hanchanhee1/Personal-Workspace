'use client';

import React, { useEffect, useState } from 'react';
import { Cloud, Wind, CloudRain, CloudSnow, CloudDrizzle, Zap } from 'lucide-react';

type WeatherData = {
    temperature: number;
    weatherCode: number;
    cityName: string;
};

const getWeatherDescription = (code: number): string => {
    if (code === 0) return '맑음';
    if (code <= 3) return '구름 조금';
    if (code <= 48) return '안개';
    if (code <= 67) return '비';
    if (code <= 77) return '눈';
    if (code <= 82) return '소나기';
    if (code <= 86) return '눈';
    return '천둥번개';
};

const getWeatherIcon = (code: number) => {
    const size = 16;
    const strokeWidth = 1.6;
    if (code === 0) return <Cloud size={size} strokeWidth={strokeWidth} />;
    if (code <= 3) return <Cloud size={size} strokeWidth={strokeWidth} />;
    if (code <= 48) return <Wind size={size} strokeWidth={strokeWidth} />;
    if (code <= 67) return <CloudRain size={size} strokeWidth={strokeWidth} />;
    if (code <= 77) return <CloudSnow size={size} strokeWidth={strokeWidth} />;
    if (code <= 82) return <CloudDrizzle size={size} strokeWidth={strokeWidth} />;
    if (code <= 86) return <CloudSnow size={size} strokeWidth={strokeWidth} />;
    return <Zap size={size} strokeWidth={strokeWidth} />;
};

const getWeatherBadgeStyle = (code: number) => {
    if (code === 0 || code <= 3) {
        return { background: 'rgba(56, 189, 248, 0.18)', border: '1px solid rgba(56, 189, 248, 0.35)' };
    }
    if (code <= 48) {
        return { background: 'rgba(148, 163, 184, 0.18)', border: '1px solid rgba(148, 163, 184, 0.35)' };
    }
    if (code <= 67) {
        return { background: 'rgba(59, 130, 246, 0.18)', border: '1px solid rgba(59, 130, 246, 0.35)' };
    }
    if (code <= 86) {
        return { background: 'rgba(125, 211, 252, 0.18)', border: '1px solid rgba(125, 211, 252, 0.35)' };
    }
    return { background: 'rgba(234, 179, 8, 0.18)', border: '1px solid rgba(234, 179, 8, 0.35)' };
};

const HeaderWeather: React.FC = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchWeather = async (lat: number, lon: number, cityName?: string) => {
        try {
            setLoading(true);
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`;
            const response = await fetch(weatherUrl, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            let city = cityName;
            if (!city) {
                try {
                    const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ko`;
                    const geoResponse = await fetch(geoUrl, {
                        method: 'GET',
                        mode: 'cors',
                        cache: 'no-cache'
                    });
                    if (geoResponse.ok) {
                        const geoData = await geoResponse.json();
                        city = geoData.address?.city ||
                            geoData.address?.town ||
                            geoData.address?.village ||
                            geoData.address?.county ||
                            geoData.address?.state ||
                            '알 수 없음';
                    }
                } catch {
                    city = city || '알 수 없음';
                }
            }

            setWeather({
                temperature: Math.round(data.current.temperature_2m),
                weatherCode: data.current.weather_code,
                cityName: city || '알 수 없음'
            });
        } catch (error) {
            console.error('Header weather fetch error:', error);
            setWeather({
                temperature: 24,
                weatherCode: 0,
                cityName: cityName || '서울'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!navigator.geolocation) {
            fetchWeather(37.5665, 126.9780, '서울');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeather(position.coords.latitude, position.coords.longitude);
            },
            () => {
                fetchWeather(37.5665, 126.9780, '서울');
            }
        );
    }, []);

    if (loading) {
        return (
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>
                날씨 불러오는 중...
            </div>
        );
    }

    if (!weather) {
        return (
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>
                날씨 정보를 가져오지 못했습니다
            </div>
        );
    }

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => {
                const cityName = weather?.cityName || '서울';
                window.open(`https://www.msn.com/ko-kr/weather/forecast/in-${encodeURIComponent(cityName)}`, '_blank');
            }}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    const cityName = weather?.cityName || '서울';
                    window.open(`https://www.msn.com/ko-kr/weather/forecast/in-${encodeURIComponent(cityName)}`, '_blank');
                }
            }}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.8)',
                padding: '0',
                cursor: 'pointer',
                background: 'transparent',
                border: 'none'
            }}
        >
            <span style={{ display: 'flex', color: '#a5b4fc' }}>{getWeatherIcon(weather.weatherCode)}</span>
            <span style={{ fontWeight: 600, color: '#fff' }}>{weather.temperature}°</span>
            <span>·</span>
            <span>{getWeatherDescription(weather.weatherCode)}</span>
            <span>·</span>
            <span>{weather.cityName}</span>
        </div>
    );
};

export default HeaderWeather;
