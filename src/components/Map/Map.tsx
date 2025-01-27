import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { LatLngTuple } from "leaflet";

async function fetchPolygons(): Promise<any> {
    const response = await fetch('https://h6sf4fa6rn3kbutj3gicfua5si0hmzda.lambda-url.ap-northeast-1.on.aws/all_field');
    const data = await response.json();
    return data;
}

interface ChangeMapCenterProps {
    position: LatLngTuple;
    zoom: number;
}

function ChangeMapCenter({ position, zoom }: ChangeMapCenterProps) {
    const map = useMap();
    useEffect(() => {
        map.setView(position, zoom);
    }, [position, zoom, map]);
    return null;
}

interface Field {
    id: number;
    name: string;
    customer_id: number;
}  

interface SelectedFieldProps {
    selectedField: Field | null;
    setSelectedField: React.Dispatch<React.SetStateAction<Field | null>>;
    size?: string;
    zoom?: number;
    center?: LatLngTuple;
}

// ポリゴンの中心を計算する関数
const calculatePolygonCenter = (polygon: LatLngTuple[]): LatLngTuple => {
    const sum = polygon.reduce((acc, coord) => {
        return [acc[0] + coord[0], acc[1] + coord[1]];
    }, [0, 0] as LatLngTuple);

    return [sum[0] / polygon.length, sum[1] / polygon.length] as LatLngTuple;
};

export const Map: React.FC<SelectedFieldProps> = ({ selectedField, setSelectedField, size, zoom, center }) => {
    const [position, setPosition] = useState<LatLngTuple>(center ? center : [36.252261, 137.866767]);
    const [currentZoom, setCurrentZoom] = useState<number>(zoom ? zoom : 18);
    const [polygons, setPolygons] = useState<{ id: number; name: string; customer: string; customer_id: number; polygon: LatLngTuple[] }[]>([]);

    useEffect(() => {
        let isSubscribed = true;
        fetchPolygons()
            .then(data => {
                if (isSubscribed) {
                    const polygonsData = data.result.fields.map((field: any) => ({
                        id: field.id,
                        name: field.name,
                        customer: field.customer,
                        customer_id: field.customer_id,
                        polygon: JSON.parse(field.polygon).map((coord: number[]) => [coord[0], coord[1]]) as LatLngTuple[]
                    }));
                    setPolygons(polygonsData);
                }
            })
            .catch(console.error);

        return () => { isSubscribed = false; };
    }, []);

    useEffect(() => {
        if (selectedField) {
            const field = polygons.find(polygon => polygon.id === selectedField.id);
            if (field) {
                const center = calculatePolygonCenter(field.polygon);
                setPosition(center);
                setCurrentZoom(18); // フィールド選択時のズームレベルを設定
            }
        }
    }, [selectedField, polygons]);

    const handlePolygonClick = (polygon: { id: number; name: string; customer: string; customer_id: number; polygon: LatLngTuple[] }) => {
        setSelectedField({ id: polygon.id, name: polygon.name, customer_id: polygon.customer_id });
    };

    return (
        <div>
            <MapContainer center={position} zoom={currentZoom} maxZoom={25} style={{ height: size ? size : "50vh" }}>
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {polygons.map(polygon => (
                    <Polygon 
                        key={polygon.id} 
                        pathOptions={{ color: 'red' }} 
                        positions={polygon.polygon}
                        eventHandlers={{
                            click: () => handlePolygonClick(polygon),
                        }}
                    >
                        <Popup>
                            {polygon.customer} {polygon.name}
                        </Popup>
                    </Polygon>
                ))}
                <ChangeMapCenter position={position} zoom={currentZoom} />
            </MapContainer>
        </div>
    );
};
