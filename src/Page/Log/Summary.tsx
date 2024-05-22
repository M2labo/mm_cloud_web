import { getUrl } from "@aws-amplify/storage"
import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import {Layout, PlotData} from "plotly.js";


async function getMavlink(fileKey: string | undefined): Promise<string> {
    try {
        const urlResponse = await getUrl({ key: `${fileKey}` });
        const response = await fetch(urlResponse.url.href);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log({ fileKey });
        return response.text();
    } catch (error) {
        console.error("Error fetching data: ", error);
        throw new Error(`Failed to fetch data for key ${fileKey}: ${error}`);
    }
}

export const Summary: React.FC<{ fileKey: string }> = ({ fileKey }) => {
    const [dataFrame, setDataFrame] = useState<string[][]>([]);

    useEffect(() => {
        let isSubscribed = true; // Flag to prevent state update if the component is unmounted
        console.log(fileKey);
        getMavlink(fileKey)
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
                    if (JSON.stringify(dataRows) !== JSON.stringify(dataFrame)) {
                        setDataFrame(dataRows);
                    }                  
                }
            })
            .catch(console.error); // Don't forget error handling

        return () => { isSubscribed = false; }; // Cleanup function to prevent setting state on unmounted component
    }, [fileKey]); // Dependency array to re-run effect when these props change
    
    if (dataFrame.length <= 2) {
        return <div>No data available.</div>;
    }

    return <div>
        <p>走行時間：{dataFrame[1][0].substring(0,5)}秒, 走行距離：{dataFrame[1][1].substring(0,5)}m, 散布量：{dataFrame[1][2].substring(0,5)}L, 消費電力：{dataFrame[1][3].substring(0,5)}Wh</p>
        {/* <table style={{border:"1px #808080 solid", borderCollapse:"collapse", marginTop:"10px"}}>
            <tbody>
                {dataFrame.map((row, i) => (
                    <tr key={i} >
                        {row.map((cell, j) => (
                            <td key={j} style={{border:"1px #808080 solid", padding:"5px"}}>{cell}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table> */}
    </div>;
};