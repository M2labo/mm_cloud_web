import React, {ReactNode, useEffect, useState} from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { LatLngTuple } from "leaflet";
import { useUser } from '../../UserContext';

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
    group_id: number;
}  

interface SelectedFieldProps {
    selectedField: Field | null;
    setSelectedField: React.Dispatch<React.SetStateAction<Field | null>>;
    size?: string;
    zoom?: number;
    center?: LatLngTuple;
    children?: ReactNode;
}

// ポリゴンの中心を計算する関数
const calculatePolygonCenter = (polygon: LatLngTuple[]): LatLngTuple => {
    const sum = polygon.reduce((acc, coord) => {
        return [acc[0] + coord[0], acc[1] + coord[1]];
    }, [0, 0] as LatLngTuple);

    return [sum[0] / polygon.length, sum[1] / polygon.length] as LatLngTuple;
};

export const Map: React.FC<SelectedFieldProps> = ({ selectedField, setSelectedField, size, zoom, center, children }) => {
    const { user } = useUser();
    const [position, setPosition] = useState<LatLngTuple>(center ? center : [36.252261, 137.866767]);
    const [currentZoom, setCurrentZoom] = useState<number>(zoom ? zoom : 18);
    const [polygons, setPolygons] = useState<{ id: number; name: string; group: string; group_id: number; polygon: LatLngTuple[] }[]>([]);

    useEffect(() => {
        let isSubscribed = true;

        const polygonsData = user?.fields?.map((field: any) => ({
            id: field.id,
            name: field.name,
            group: field.group,
            group_id: field.group_id,
            polygon: JSON.parse(field.polygon).map((coord: number[]) => [coord[0], coord[1]]) as LatLngTuple[]
        })) || [];
        setPolygons(polygonsData);

        return () => { isSubscribed = false; };
    }, [user]);

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

    const handlePolygonClick = (polygon: { id: number; name: string; group: string; group_id: number; polygon: LatLngTuple[] }) => {
        setSelectedField({ id: polygon.id, name: polygon.name, group_id: polygon.group_id });
    };

    return (
        <div>
            <MapContainer center={position} zoom={currentZoom} minZoom={1} maxZoom={25} style={{ height: size ? size : "50vh", cursor: "default"  }}>
                {children}
                {polygons.map(polygon => (
                    <Polygon 
                        key={polygon.id} 
                        pathOptions={{ color: 'blue' }}
                        positions={polygon.polygon}
                        eventHandlers={{
                            click: () => handlePolygonClick(polygon),
                        }}
                    >
                        <Popup>
                            {polygon.group} {polygon.name}
                        </Popup>
                    </Polygon>
                ))}
                <ChangeMapCenter position={position} zoom={currentZoom} />
            </MapContainer>
        </div>
    );
};
