import { useNavigate } from 'react-router-dom';
import { list } from 'aws-amplify/storage';
import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Summary } from '../../components/Log/Summary';
import { Header } from '../../components/Header/Header';

async function fetchSummary(mmId: string | undefined, date: string | undefined): Promise<any> {
    const fiter_dict = { mm: mmId, date: date};
    const queryParams = new URLSearchParams({ filter: JSON.stringify(fiter_dict) });
    console.log(`https://lsdlueq272y5yboojqgls6dcsi0ejsla.lambda-url.ap-northeast-1.on.aws/log?${queryParams}`);
    const response = await fetch(`https://lsdlueq272y5yboojqgls6dcsi0ejsla.lambda-url.ap-northeast-1.on.aws/summary?${queryParams}`);
    const data = await response.json();
    return data;
}

export function Log() {
    const navigate = useNavigate();
    const [folder, setFolder] = useState<string[]>([]);
    const { mmId, date } = useParams(); 
    const path = `${mmId}/${date?.slice(0,4)}/${date?.slice(4,8)}/`;
    const [summaries, setSummaries] = useState<any[]>([]);

    // useEffect(() => {
    //     console.log(mmId + '/' + date?.slice(0,4) + '/' + date?.slice(4,8));
    //     list({
    //         prefix: mmId + '/' + date?.slice(0,4) + '/' + date?.slice(4,8),
    //         options: {
    //             listAll: true
    //           }

    //     }).then((data) => {
    //         const folder: Set<string> = new Set();
    //         console.log(data);
    //         data.items.forEach((file) => {
    //             const folderName = file.key.split('/').slice(3, 4).join('');
    //             if (folderName !== 'summary.csv') { 
    //                 folder.add(folderName);
    //             }
    //         });
    //         setFolder(Array.from(folder));

    //     }
    //     ).catch((error) => {
    //         console.log(error);
    //     });
    //     }
    // , []);

    useEffect(() => {
        let isSubscribed = true;
        console.log(mmId, date);
        fetchSummary(mmId, date)
            .then(data => {
                if (isSubscribed) {
                    console.log(JSON.parse(data.result)); 
                    setSummaries(JSON.parse(data.result));
                }
            })
            .catch(console.error);

        return () => { isSubscribed = false; };
    }, []);

    return (
        <>
            <Header />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4 text-center md:text-left">時刻</h1>
                {/* <ul className="list-none">
                    {folder.map((folder, index) => (
                        <li key={index} className="mb-4">
                            <Summary fileKey={`${mmId}/${date?.slice(0, 4)}/${date?.slice(4, 8)}/${folder}/summary.csv`} fileName={`${folder?.slice(0, 2)}:${folder?.slice(2, 4)}:${folder?.slice(4, 6)}`} url={`#/detail/${mmId}/${date}/${folder}`} unit="m" />
                        </li>
                    ))}
                </ul> */}
                <ul className="list-none">
                    {summaries.map((summary, index) => (
                        <li key={index} className="mb-4">
                            <a href={`#/detail/${mmId}/${date}/${summary.time}`}>
                                <div className="p-4 bg-white shadow-md rounded-lg my-4">
                                    <p className="text-lg font-semibold mb-2">{`${summary.time?.slice(0, 2)}:${summary.time?.slice(2, 4)}:${summary.time?.slice(4, 6)}`}</p>
                                    <p>
                                    走行時間：{summary.driving_time.toFixed(0)}秒, 
                                    走行距離：{summary.distance.toFixed(0)}m, 
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