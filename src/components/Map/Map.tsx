import { getUrl } from "@aws-amplify/storage"
import { MapContainer, TileLayer, Polyline,useMap } from "react-leaflet";
import React, { useEffect, useState } from 'react';
import { LatLngTuple } from "leaflet"; // Import the type
import 'leaflet/dist/leaflet.css';
import { Images } from '../../components/Images/Images';

async function getMavlink(mmId: string | undefined, date: string | undefined, logId: string | undefined): Promise<string> {
    const urlResponse = await getUrl({ key: `${mmId}/${date?.slice(0,4)}/${date?.slice(4,8)}/${logId}/ROUTE.csv` });
    const response = await fetch(urlResponse.url.href);
    return response.text(); // Return the response text
}

interface ChangeMapCenterProps {
    position: LatLngTuple;
  }
  
  function ChangeMapCenter({ position }: ChangeMapCenterProps) {
    const map = useMap();
    map.panTo(position);
  
    return null;
  }

export const Map: React.FC<{ mmId: string | undefined; date: string | undefined; logId: string | undefined }> = ({ mmId, date, logId }) => {
    const [dataFrame, setDataFrame] = useState<string[][]>([]);
    const [multiPolyline, setMultiPolyline] = useState<LatLngTuple[][]>([[]]);
    const [position, setPosition] = useState<LatLngTuple>([0, 0]); // 初期値を適当な値で設定

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

    useEffect(() => {
        const newMultiPolyline: LatLngTuple[][] = [[]];
        let newPosition: LatLngTuple = [0, 0];

        dataFrame.forEach(row => {
            const lat = parseFloat(row[0]) / 10000000;
            const lng = parseFloat(row[1]) / 10000000;

            if (!isNaN(lat) && !isNaN(lng)) {
                newMultiPolyline[0].push([lat, lng]);
                newPosition = [lat, lng]; // 最後の有効な位置を更新
                console.log(newPosition);
            }
        });

        setMultiPolyline(newMultiPolyline);
        setPosition(newPosition); // 更新された位置をセット
    }, [dataFrame]); // dataFrameが更新されたら実行

    return (
        <div>
            
            <MapContainer center={position} zoom={18} maxZoom={25} style={{ height: "50vh" }}>
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Polyline pathOptions={{ color: 'lime' }} positions={multiPolyline} />
                <ChangeMapCenter position={position} />
            </MapContainer>
            <Images  /> 
        </div>
        
    );
};
