import { getUrl } from "@aws-amplify/storage"
import { MapContainer, TileLayer, Polyline,useMap, Polygon,Popup } from "react-leaflet";
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
                // console.log(newPosition);
            }
        });
        console.log(newMultiPolyline);
        setMultiPolyline(newMultiPolyline);
        setPosition(newPosition); // 更新された位置をセット
    }, [dataFrame]); // dataFrameが更新されたら実行

    const fieldMultiPolyline: LatLngTuple[] = [
        [36.252588, 137.866538],
        [36.252571, 137.867133],
        [36.251148, 137.866879],
        [36.251151, 137.866790],
        [36.251636, 137.866864],
        [36.251686, 137.866425],
        [36.252588, 137.866538],

    ];

    const kurumikitaMultiPolyline: LatLngTuple[] = [
        [36.252678, 137.866275],
        [36.253274, 137.866389],
        [36.253289, 137.866021],
        [36.252692, 137.865930],
        [36.252678, 137.866275]
    ];

    const furuyaMultiPolyline: LatLngTuple[] = [
        [36.252393, 137.861287],
        [36.252470, 137.860546],
        [36.251891, 137.860477],
        [36.251806, 137.861174]
    ];

    const chokoenmaeMultiPolyline: LatLngTuple[] = [
        [36.251413, 137.859801],
        [36.251884, 137.859878],
        [36.251929, 137.859515],
        [36.251517, 137.858947],
        [36.251413, 137.859801]
    ];
    const chokoenminamiMultiPolyline: LatLngTuple[] = [
        [36.251375, 137.859478],
        [36.250442, 137.859309],
        [36.250476, 137.859036],
        [36.251407, 137.859207],
        [36.251375, 137.859478]
    ];
    

    return (
        <div>
            
            <MapContainer center={position} zoom={18} maxZoom={25} style={{ height: "50vh" }}>
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Polyline pathOptions={{ color: 'lime' }} positions={multiPolyline} />
                <Polygon pathOptions={{ color: 'red' }} positions={fieldMultiPolyline} >
                    <Popup>
                        鶴峰農園　車屋
                    </Popup>
                </Polygon>
                <Polygon pathOptions={{ color: 'red' }} positions={kurumikitaMultiPolyline} >
                    <Popup>
                        中村弘道　クルミ北
                    </Popup>
                </Polygon>
                <Polygon pathOptions={{ color: 'red' }} positions={furuyaMultiPolyline} >
                    <Popup>
                        ナカムラフルーツ　車屋
                    </Popup>
                </Polygon>
                <Polygon pathOptions={{ color: 'red' }} positions={chokoenmaeMultiPolyline} >
                    <Popup>
                    鶴峰農園　長幸園前
                    </Popup>
                </Polygon>
                <Polygon pathOptions={{ color: 'red' }} positions={chokoenminamiMultiPolyline} >
                    <Popup>
                    鶴峰農園　長幸園南
                    </Popup>
                </Polygon>
                <ChangeMapCenter position={position} />
            </MapContainer>
            <Images  /> 
        </div>
        
    );
};
