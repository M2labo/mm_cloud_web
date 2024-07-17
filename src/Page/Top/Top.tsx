import { useNavigate } from 'react-router-dom';
import { list } from '@aws-amplify/storage'
import React, { useEffect, useState } from 'react';
import { Summary } from '../../components/Log/Summary';
import { Header } from '../../components/Header/Header'; 

async function fetchSummary(): Promise<any> {
    // const fiter_dict = {};
    // const queryParams = new URLSearchParams({ filter: JSON.stringify(fiter_dict) });
    // console.log(`https://lsdlueq272y5yboojqgls6dcsi0ejsla.lambda-url.ap-northeast-1.on.aws/log?${queryParams}`);
    const response = await fetch(`https://lsdlueq272y5yboojqgls6dcsi0ejsla.lambda-url.ap-northeast-1.on.aws/summary`);
    const data = await response.json();
    return data;
}

export function Top() {
    const navigate = useNavigate();
    const [mm, setMm] = useState<String[]>([]);
    const [summaries, setSummaries] = useState<any[]>([]);
    // React.useEffect(() => {
    //     list({
    //         prefix: 'MM-',
    //         options: {
    //             listAll: true
    //           }
        
    //     }).then((data) => {
    //         const folder: Set<String> = new Set();
    //         data.items.forEach((file) => {
    //             const folderName = file.key.split('/')[0];
    //             folder.add(folderName);
    //         });
    //         setMm(Array.from(folder));
    //         console.log(folder);
    //     }).catch((error) => {
    //         console.log(error);
    //     });
    // }
    // , []);

    useEffect(() => {
        let isSubscribed = true;
        
        fetchSummary()
            .then(data => {
                if (isSubscribed) {
                    const parsedData = JSON.parse(data.result);
                    const sortedData = parsedData.sort((a: any, b: any) => a.mm.localeCompare(b.mm)); // 初回読み込み時に昇順ソート
                    console.log(sortedData);
                    setSummaries(sortedData);
                }
            })
            .catch(console.error);

        return () => { isSubscribed = false; };
    }, []);
    
    return (
        <>
            <Header />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4 text-center md:text-left">MobileMover</h1>
                {/* <ul className="list-none">
                    {mm.map((mmId, index) => (
                        <li key={index} className="mb-2">
                 
                            <Summary fileKey={`${mmId}/summary.csv`} fileName={mmId.valueOf()} url={`#/mm/${mmId}`} unit="km"/>
                        </li>
                    ))}
                </ul> */}
                <ul className="list-none">
                    {summaries.map((summary, index) => (
                        <li key={index} className="mb-4">
                            <a href={`#/mm/${summary.mm}`}>
                                <div className="p-4 bg-white shadow-md rounded-lg my-4">
                                    <p className="text-lg font-semibold mb-2">{`${summary.mm}`}</p>
                                    <p>
                                    走行時間：{summary.driving_time}時間, 
                                    走行距離：{summary.distance}km, 
                                    散布量：{summary.flow_volume.toFixed(1)}L, 
                                    消費電力：{summary.power.toFixed(1)}Wh
                                    </p>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}