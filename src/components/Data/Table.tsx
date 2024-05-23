import { getUrl } from "@aws-amplify/storage"
import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import {Layout, PlotData} from "plotly.js";

async function getMavlink(mmId: string | undefined, date: string | undefined, logId: string | undefined, type: string | undefined): Promise<string> {
    const urlResponse = await getUrl({ key: `${mmId}/${date?.slice(0,4)}/${date?.slice(4,8)}/${logId}/${type}.csv` });
    const response = await fetch(urlResponse.url.href);
    

    return response.text(); // Return the response text
}

export const Table: React.FC<{ mmId: string | undefined; date: string | undefined; logId: string | undefined;}> = ({ mmId, date, logId }) => {
    const [type, setType] = useState<string>("MAVLINK");
    const [dataFrame, setDataFrame] = useState<string[][]>([]);

    useEffect(() => {
        let isSubscribed = true; // Flag to prevent state update if the component is unmounted
        getMavlink(mmId, date, logId, type)
            .then(data => {
                if (isSubscribed) {
                    console.log(data); // Optionally log the data
                    const dataRows: string[][] = [];
                    data.split('\n').forEach((line: string) => {
                        const cells:string[] = [];
                        
                        line.split(',').forEach((cell: string) => {
                            cells.push(cell);
                            console.log(cell);
                        });
                        console.log(cells);
                        dataRows.push(cells);
                    });
                    setDataFrame(dataRows);                    
                }
            })
            .catch(console.error); // Don't forget error handling

        return () => { isSubscribed = false; }; // Cleanup function to prevent setting state on unmounted component
    }, [mmId, date, logId, type]); // Dependency array to re-run effect when these props change

    return (
        <div className="p-4 bg-white shadow-md rounded-lg my-4">
            <h2 className="text-lg font-semibold mb-4">ログを表示</h2>
            <select onChange={(e) => setType(e.target.value)} className="block mb-4 p-2 border rounded">
                <option value="MAVLINK">MAVLINK</option>
                <option value="CAN">CAN</option>
                <option value="SYSTEM">SYSTEM</option>
            </select>
            
            <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse border border-gray-300">
                    <tbody>
                        {dataFrame.map((row, i) => (
                            <tr key={i} className="border border-gray-300">
                                {row.map((cell, j) => (
                                    <td key={j} className="border border-gray-300 p-2">{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};