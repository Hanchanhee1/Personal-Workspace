'use client';

import React, { useState, useEffect } from 'react';
import { Cloud, Droplets, MapPin, Search, Star, X, Loader2, Wind, Eye, CloudRain, CloudSnow, CloudDrizzle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// 날씨 데이터 타입 정의
interface WeatherData {
    temperature: number;
    humidity: number;
    weatherCode: number;
    cityName: string;
    country?: string;
}

// 즐겨찾기 도시 타입 정의
interface FavoriteCity {
    id: string;
    city_name: string;
    latitude: number;
    longitude: number;
    country?: string;
}

const WeatherWidget: React.FC = () => {
    const { user } = useAuth();
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchMode, setSearchMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<FavoriteCity[]>([]);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);

    // 날씨 코드를 한국어 설명으로 변환
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

    // 날씨 코드에 따른 아이콘 선택 (더 큰 사이즈)
    const getWeatherIcon = (code: number) => {
        const size = 80;
        const strokeWidth = 1.5;
        if (code === 0) return <Cloud size={size} strokeWidth={strokeWidth} />;
        if (code <= 3) return <Cloud size={size} strokeWidth={strokeWidth} />;
        if (code <= 48) return <Wind size={size} strokeWidth={strokeWidth} />;
        if (code <= 67) return <CloudRain size={size} strokeWidth={strokeWidth} />;
        if (code <= 77) return <CloudSnow size={size} strokeWidth={strokeWidth} />;
        if (code <= 82) return <CloudDrizzle size={size} strokeWidth={strokeWidth} />;
        if (code <= 86) return <CloudSnow size={size} strokeWidth={strokeWidth} />;
        return <Zap size={size} strokeWidth={strokeWidth} />;
    };

    // 날씨에 따른 배경 그라디언트 및 색상 테마
    const getWeatherTheme = (code: number) => {
        // 맑음
        if (code === 0) return {
            background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
            iconColor: '#FFFFFF',
            textColor: '#FFFFFF'
        };
        // 구름 조금
        if (code <= 3) return {
            background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
            iconColor: '#FFFFFF',
            textColor: '#FFFFFF'
        };
        // 안개
        if (code <= 48) return {
            background: 'linear-gradient(135deg, #e0e0e0 0%, #b0b0b0 100%)',
            iconColor: '#757575',
            textColor: '#424242'
        };
        // 비
        if (code <= 67) return {
            background: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
            iconColor: '#64B5F6',
            textColor: '#FFFFFF'
        };
        // 눈
        if (code <= 86) return {
            background: 'linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)',
            iconColor: '#90CAF9',
            textColor: '#1976D2'
        };
        // 천둥번개
        return {
            background: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)',
            iconColor: '#FDD835',
            textColor: '#FFFFFF'
        };
    };

    // 현재 위치 가져오기
    const getCurrentLocation = () => {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation({ lat: latitude, lon: longitude });
                await fetchWeather(latitude, longitude);
            },
            (error) => {
                console.error('Geolocation error:', error);
                // 기본 위치 (서울)
                fetchWeather(37.5665, 126.9780, '서울');
                setLoading(false);
            }
        );
    };

    // 날씨 데이터 가져오기
    const fetchWeather = async (lat: number, lon: number, cityName?: string) => {
        try {
            setLoading(true);
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`;
            
            const response = await fetch(weatherUrl, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // 도시 이름이 없으면 역지오코딩으로 가져오기 (Nominatim API 사용)
            let city = cityName;
            if (!city) {
                try {
                    const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ko`;
                    const geoResponse = await fetch(geoUrl, {
                        method: 'GET',
                        mode: 'cors',
                        cache: 'no-cache',
                        headers: {
                            'User-Agent': 'WeatherWidget/1.0'
                        }
                    });
                    
                    if (geoResponse.ok) {
                        const geoData = await geoResponse.json();
                        // 도시명 추출 우선순위: city > town > village > county
                        city = geoData.address?.city || 
                               geoData.address?.town || 
                               geoData.address?.village ||
                               geoData.address?.county ||
                               geoData.address?.state ||
                               '알 수 없음';
                    } else {
                        city = '알 수 없음';
                    }
                } catch (geoError) {
                    console.warn('Geocoding error:', geoError);
                    city = '알 수 없음';
                }
            }

            setWeather({
                temperature: Math.round(data.current.temperature_2m),
                humidity: data.current.relative_humidity_2m,
                weatherCode: data.current.weather_code,
                cityName: city || '알 수 없음',
            });
            setCurrentLocation({ lat, lon });
        } catch (error) {
            console.error('Weather fetch error:', error);
            // Fallback 데이터
            setWeather({
                temperature: 24,
                humidity: 42,
                weatherCode: 0,
                cityName: cityName || '서울',
            });
        } finally {
            setLoading(false);
        }
    };

    // 도시 검색
    const searchCity = async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=ko&format=json`
            );
            const data = await response.json();
            setSearchResults(data.results || []);
        } catch (error) {
            console.error('City search error:', error);
            setSearchResults([]);
        }
    };

    // 도시 선택
    const selectCity = async (city: any) => {
        setSearchMode(false);
        setSearchQuery('');
        setSearchResults([]);
        await fetchWeather(city.latitude, city.longitude, city.name);
    };

    // 즐겨찾기 추가
    const addToFavorites = async () => {
        if (!user || !weather || !currentLocation) return;

        try {
            const { error } = await supabase.from('favorite_cities').insert({
                user_id: user.id,
                city_name: weather.cityName,
                latitude: currentLocation.lat,
                longitude: currentLocation.lon,
                country: weather.country,
            });

            if (!error) {
                loadFavorites();
            }
        } catch (error) {
            console.error('Add favorite error:', error);
        }
    };

    // 즐겨찾기 불러오기
    const loadFavorites = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('favorite_cities')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setFavorites(data);
            }
        } catch (error) {
            console.error('Load favorites error:', error);
        }
    };

    // 즐겨찾기 삭제
    const removeFavorite = async (id: string) => {
        try {
            await supabase.from('favorite_cities').delete().eq('id', id);
            loadFavorites();
        } catch (error) {
            console.error('Remove favorite error:', error);
        }
    };

    // 컴포넌트 마운트 시 현재 위치 날씨 가져오기
    useEffect(() => {
        getCurrentLocation();
        if (user) {
            loadFavorites();
        }
    }, [user]);

    // 검색어 변경 시 디바운스 처리
    useEffect(() => {
        const timer = setTimeout(() => searchCity(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // 로딩 상태
    if (loading) {
        return (
            <div className="minimal-card h-full flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Loader2 size={32} />
                </motion.div>
            </div>
        );
    }

    // 검색 모드
    if (searchMode) {
        return (
            <motion.div 
                className="minimal-card h-full flex flex-col p-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
            >
                {/* 검색 입력 */}
                <div className="flex items-center gap-2 mb-4">
                    <Search size={20} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="도시 이름 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="minimal-input flex-1"
                        autoFocus
                    />
                    <motion.button 
                        onClick={() => setSearchMode(false)}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1"
                    >
                        <X size={20} />
                    </motion.button>
                </div>

                {/* 검색 결과 */}
                <div className="flex-1 overflow-y-auto">
                    <AnimatePresence mode="popLayout">
                        {searchResults.map((city, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => selectCity(city)}
                                whileHover={{ scale: 1.02, x: 4 }}
                                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-lg mb-2"
                            >
                                <div className="font-medium">{city.name}</div>
                                <div className="text-sm text-gray-500">
                                    {city.admin1}, {city.country}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* 즐겨찾기 목록 */}
                    {favorites.length > 0 && (
                        <motion.div 
                            className="mt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h4 className="text-label mb-2">⭐ 즐겨찾기</h4>
                            <AnimatePresence mode="popLayout">
                                {favorites.map((fav, index) => (
                                    <motion.div
                                        key={fav.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-lg mb-2 flex justify-between items-center"
                                    >
                                        <div onClick={() => fetchWeather(fav.latitude, fav.longitude, fav.city_name)}>
                                            <div className="font-medium">{fav.city_name}</div>
                                        </div>
                                        <motion.button 
                                            onClick={() => removeFavorite(fav.id)}
                                            whileHover={{ scale: 1.2, rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-1"
                                        >
                                            <X size={16} />
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        );
    }

    // 메인 날씨 화면
    const theme = weather ? getWeatherTheme(weather.weatherCode) : getWeatherTheme(0);
    
    // MSN 날씨 열기
    const openMSNWeather = () => {
        const cityName = weather?.cityName || '서울';
        window.open(`https://www.msn.com/ko-kr/weather/forecast/in-${encodeURIComponent(cityName)}`, '_blank');
    };
    
    return (
        <motion.div 
            className="minimal-card h-full flex flex-col p-6 overflow-hidden"
            style={{
                background: theme.background,
                color: theme.textColor,
                position: 'relative',
                cursor: 'pointer'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            onClick={openMSNWeather}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
        >
            {/* 상단: 도시명 및 액션 버튼 */}
            <motion.div 
                className="flex justify-between items-center mb-6"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onClick={(e) => e.stopPropagation()} // 버튼 클릭 시 위젯 클릭 이벤트 방지
            >
                <h3 className="text-label" style={{ color: theme.textColor, opacity: 0.9, fontSize: '1.1rem', letterSpacing: '0.02em' }}>
                    {weather?.cityName.toUpperCase()}
                </h3>
                
                <div className="flex items-center gap-2">
                    {/* 검색 버튼 */}
                    <motion.button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setSearchMode(true);
                        }}
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2.5 rounded-xl transition-colors"
                        style={{ 
                            background: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            color: '#FFFFFF',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="도시 검색"
                    >
                        <Search size={16} strokeWidth={2.5} />
                    </motion.button>
                    
                    {/* 즐겨찾기 버튼 */}
                    {user && (
                        <motion.button 
                            onClick={(e) => {
                                e.stopPropagation();
                                addToFavorites();
                            }}
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2.5 rounded-xl transition-colors"
                            style={{ 
                                background: 'rgba(255, 255, 255, 0.15)',
                                backdropFilter: 'blur(10px)',
                                color: '#FFFFFF',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title="즐겨찾기에 추가"
                        >
                            <Star size={16} strokeWidth={2.5} />
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* 중앙: 날씨 아이콘 + 온도 */}
            <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-8">
                    {/* 큰 날씨 아이콘 (왼쪽) */}
                    <motion.div 
                        style={{ color: theme.iconColor }}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                            duration: 0.6
                        }}
                        whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                        {weather && getWeatherIcon(weather.weatherCode)}
                    </motion.div>
                    
                    {/* 온도 표시 (오른쪽) */}
                    <div style={{ marginLeft: '30px' }}>
                        <motion.div 
                            key={weather?.temperature}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ 
                                type: "spring", 
                                stiffness: 200, 
                                damping: 15 
                            }}
                            style={{ 
                                fontSize: '4rem', 
                                fontWeight: 200, 
                                lineHeight: 1,
                                color: theme.textColor
                            }}
                        >
                            {weather?.temperature}°
                        </motion.div>
                        
                        {/* 날씨 설명 */}
                        <motion.div 
                            className="text-body mt-2" 
                            style={{ 
                                color: theme.textColor, 
                                fontSize: '1.2rem',
                                opacity: 0.9
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 0.9, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {weather && getWeatherDescription(weather.weatherCode)}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* 하단: 습도 정보 */}
            <motion.div
                className="flex items-center gap-3"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    color: theme.textColor
                }}
            >
                <Droplets size={18} />
                <span style={{ fontSize: '0.95rem' }}>습도 {weather?.humidity}%</span>
            </motion.div>
        </motion.div>
    );
};

export default WeatherWidget;
