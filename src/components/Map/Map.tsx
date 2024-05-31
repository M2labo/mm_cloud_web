import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, useMap, Polygon, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { getUrl } from "@aws-amplify/storage";
import { LatLngTuple } from "leaflet";
import { Images } from '../../components/Images/Images';

// mmId、date、logIdを使用してROUTE.csvファイルのURLを取得し、その内容をテキストとして返す関数
async function getMavlink(mmId: string | undefined, date: string | undefined, logId: string | undefined): Promise<string> {
    const urlResponse = await getUrl({ key: `${mmId}/${date?.slice(0, 4)}/${date?.slice(4, 8)}/${logId}/ROUTE.csv` });
    const response = await fetch(urlResponse.url.href);
    return response.text();
}

// APIエンドポイントからポリゴンデータを取得する関数
async function fetchPolygons(): Promise<any> {
    const response = await fetch('https://lsdlueq272y5yboojqgls6dcsi0ejsla.lambda-url.ap-northeast-1.on.aws/all_field');
    const data = await response.json();
    return data;
}

// マップの中心を変更するコンポーネント
interface ChangeMapCenterProps {
    position: LatLngTuple;
}

function ChangeMapCenter({ position }: ChangeMapCenterProps) {
    const map = useMap();
    map.panTo(position);
    return null;
}

// Mapコンポーネント
export const Map: React.FC<{ mmId: string | undefined; date: string | undefined; logId: string | undefined }> = ({ mmId, date, logId }) => {
    const [dataFrame, setDataFrame] = useState<string[][]>([]);
    const [multiPolyline, setMultiPolyline] = useState<LatLngTuple[][]>([[]]);
    const [position, setPosition] = useState<LatLngTuple>([0, 0]);
    const [polygons, setPolygons] = useState<{ id: number; name: string; customer: string; customer_id: number; polygon: LatLngTuple[] }[]>([]);

    // mmId、date、logIdが変更されたときにROUTE.csvファイルを取得し、dataFrameにセットする
    useEffect(() => {
        let isSubscribed = true;
        getMavlink(mmId, date, logId)
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

    // dataFrameが変更されたときに、multiPolylineとpositionを更新する
    useEffect(() => {
        const newMultiPolyline: LatLngTuple[][] = [[]];
        let newPosition: LatLngTuple = [0, 0];

        dataFrame.forEach(row => {
            const lat = parseFloat(row[0]) / 10000000;
            const lng = parseFloat(row[1]) / 10000000;

            if (!isNaN(lat) && !isNaN(lng)) {
                newMultiPolyline[0].push([lat, lng]);
                newPosition = [lat, lng];
            }
        });

        setMultiPolyline(newMultiPolyline);
        setPosition(newPosition);
    }, [dataFrame]);

    // コンポーネントがマウントされたときにポリゴンデータを取得し、polygonsにセットする
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

    return (
        <div>
            <MapContainer center={position} zoom={18} maxZoom={25} style={{ height: "50vh" }}>
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* CSVファイルから取得した経路データを表示 */}
                <Polyline pathOptions={{ color: 'lime' }} positions={multiPolyline} />
                {/* APIから取得したポリゴンデータを表示 */}
                {polygons.map(polygon => (
                    <Polygon key={polygon.id} pathOptions={{ color: 'red' }} positions={polygon.polygon}>
                        <Popup>
                            {polygon.customer} {polygon.name}
                        </Popup>
                    </Polygon>
                ))}
                {/* マップの中心を変更 */}
                <ChangeMapCenter position={position} />
            </MapContainer>
            <Images />
        </div>
    );
};
