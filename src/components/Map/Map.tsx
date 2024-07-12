import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, useMap, Polygon, Popup, Marker, useMapEvent } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { getUrl } from "@aws-amplify/storage";
import { LatLngTuple, LatLngExpression } from "leaflet";

async function getRoute(mmId: string | undefined, date: string | undefined, logId: string | undefined): Promise<string> {
    const urlResponse = await getUrl({ key: `${mmId}/${date?.slice(0, 4)}/${date?.slice(4, 8)}/${logId}/ROUTE.csv` });
    const response = await fetch(urlResponse.url.href);
    return response.text();
}

async function fetchPolygons(): Promise<any> {
    const response = await fetch('https://lsdlueq272y5yboojqgls6dcsi0ejsla.lambda-url.ap-northeast-1.on.aws/all_field');
    const data = await response.json();
    return data;
}

async function fetchRoute(mmId: string | undefined, date: string | undefined, logId: string | undefined): Promise<any> {
    const fiter_dict = { mm: mmId, date: date, time: logId };
    const queryParams = new URLSearchParams({ filter: JSON.stringify(fiter_dict) });
    console.log(`https://lsdlueq272y5yboojqgls6dcsi0ejsla.lambda-url.ap-northeast-1.on.aws/log?${queryParams}`);
    const response = await fetch(`https://lsdlueq272y5yboojqgls6dcsi0ejsla.lambda-url.ap-northeast-1.on.aws/log?${queryParams}`);
    const data = await response.json();
    return data;
}

interface ChangeMapCenterProps {
    position: LatLngTuple;
}

function ChangeMapCenter({ position }: ChangeMapCenterProps) {
    const map = useMap();
    map.panTo(position);
    return null;
}

const calculateAverage = (numbers: number[]): number => {
    const validNumbers = numbers.filter(num => !isNaN(num));
    const total = validNumbers.reduce((acc, num) => acc + num, 0);
    return validNumbers.length ? total / validNumbers.length : 0;
}

const HoverMarker: React.FC<{ position: LatLngTuple; difference: number; averageDifference: number }> = ({ position, difference, averageDifference }) => {
    return (

        <Popup position={position}>
            ずれ : {(difference*100).toPrecision(3)} cm<br />
            平均 : {(averageDifference * 100).toPrecision(3)} cm
        </Popup>

    );
}

const PolylineWithHover: React.FC<{ positions: LatLngTuple[][], differences: number[] }> = ({ positions, differences }) => {
    const [hoverData, setHoverData] = useState<{ position: LatLngTuple; difference: number } | null>(null);
    const averageDifference = calculateAverage(differences);

    useMapEvent('mousemove', (e) => {
        const { lat, lng } = e.latlng;
        positions.forEach((line, lineIndex) => {
            line.forEach((point, pointIndex) => {
                if (Math.abs(point[0] - lat) < 0.000001 && Math.abs(point[1] - lng) < 0.000001) {
                    setHoverData({ position: [point[0], point[1]], difference: differences[pointIndex] });
                }
            });
        });
    });

    return (
        <>
            <Polyline pathOptions={{ color: 'lime' }} positions={positions} />
            {hoverData && <HoverMarker position={hoverData.position} difference={hoverData.difference} averageDifference={averageDifference} />}
        </>
    );
}

export const Map: React.FC<{ mmId?: string | undefined; date?: string | undefined; logId?: string | undefined; size?: string; zoom?: number; center?: LatLngTuple; }> = ({ mmId, date, logId, size, zoom, center }) => {
    const [dataFrame, setDataFrame] = useState<string[][]>([]);
    const [multiPolyline, setMultiPolyline] = useState<LatLngTuple[][]>([[]]);
    const [routePolyline, setRoutePolyline] = useState<LatLngTuple[][]>([[]]);
    const [position, setPosition] = useState<LatLngTuple>(center ? center : [36.252261, 137.866767]);
    const [polygons, setPolygons] = useState<{ id: number; name: string; customer: string; customer_id: number; polygon: LatLngTuple[] }[]>([]);
    const [differences, setDifferences] = useState<number[]>([]);

    useEffect(() => {
        let isSubscribed = true;
        if (!mmId || !date || !logId) return;
        getRoute(mmId, date, logId)
            .then(data => {
                if (isSubscribed) {
                    const dataRows: string[][] = [];
                    data.split('\n').forEach(line => {
                        const cells = line.split(',');
                        dataRows.push(cells);
                    });
                    setDataFrame(dataRows);
                }
            })
            .catch(console.error);

        return () => { isSubscribed = false; };
    }, [mmId, date, logId]);

    useEffect(() => {
        if (!mmId || !date || !logId) return;
        const newMultiPolyline: LatLngTuple[][] = [[]];
        const newDifferences: number[] = [];
        let newPosition: LatLngTuple = [0, 0];

        dataFrame.forEach(row => {
            const lat = parseFloat(row[0]) / 10000000;
            const lng = parseFloat(row[1]) / 10000000;
            const difference = parseFloat(row[4]);

            if (!isNaN(lat) && !isNaN(lng)) {
                newMultiPolyline[0].push([lat, lng]);
                newDifferences.push(difference);
                newPosition = [lat, lng];
            }
        });

        setMultiPolyline(newMultiPolyline);
        setDifferences(newDifferences);
        setPosition(newPosition);
    }, [dataFrame]);

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
        let isSubscribed = true;
        console.log(mmId, date, logId);
        fetchRoute(mmId, date, logId)
            .then(data => {
                if (isSubscribed) {
                    console.log(data);
                    console.log(JSON.parse(data.result)[0].coordinates);
                    const routeData = JSON.parse(data.result)[0].coordinates.map((coord: number[]) => [coord[0], coord[1]]) as LatLngTuple[];
                    setRoutePolyline([routeData]);
                }
            })
            .catch(console.error);

        return () => { isSubscribed = false; };
    }, []);

    return (
        <div>
            <MapContainer center={position} zoom={zoom ? zoom : 18} maxZoom={25} style={{ height: size ? size : "50vh" }}>
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Polyline pathOptions={{ color: 'grey' }} positions={routePolyline} />
                <PolylineWithHover positions={multiPolyline} differences={differences} />
                {polygons.map(polygon => (
                    <Polygon key={polygon.id} pathOptions={{ color: 'red' }} positions={polygon.polygon}>
                        <Popup>
                            {polygon.customer} {polygon.name}
                        </Popup>
                    </Polygon>
                ))}
                <ChangeMapCenter position={position} />
            </MapContainer>
        </div>
    );
};
