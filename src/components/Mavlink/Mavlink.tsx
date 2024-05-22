import { getUrl } from "@aws-amplify/storage"
import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import {Layout, PlotData} from "plotly.js";

async function getMavlink(mmId: string | undefined, date: string | undefined, logId: string | undefined): Promise<string> {
    const urlResponse = await getUrl({ key: `${mmId}/${date?.slice(0,4)}/${date?.slice(4,8)}/${logId}/MAVLINK.csv` });
    const response = await fetch(urlResponse.url.href);
    

    return response.text(); // Return the response text
}

export const Mavlink: React.FC<{ mmId: string | undefined; date: string | undefined; logId: string | undefined }> = ({ mmId, date, logId }) => {
    const [dataFrame, setDataFrame] = useState<string[][]>([]);

    useEffect(() => {
        let isSubscribed = true; // Flag to prevent state update if the component is unmounted
        getMavlink(mmId, date, logId)
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
    }, [mmId, date, logId]); // Dependency array to re-run effect when these props change
    const data1:Partial<PlotData> = {
        x: [1, 2, 3, 4],
        y: [10, 11, 12, 13],
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Primary Y-Axis',
    }
    
    // データ群2 ちなみに群1と群2は自動で色分けしてくれる。便利！
    // 手動で設定したいなら marker:{color:***}
    const data2:Partial<PlotData> = {
        x: [1, 2, 3, 4],
        y: [100, 120, 120, 110],
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Secondary Y-Axis',
        yaxis: 'y2',
    }
    
    // 以下はXYZの軸が欲しかったので無理矢理作った
    const lineX:Partial<PlotData> = {
      type: 'scatter',
      x:[-10,10],
      y:[0,0],

      mode: 'lines',
      line:{color:'black'}
    };
    
    const lineY:Partial<PlotData> = {
      type: 'scatter',
      x:[0,0],
      y:[-10,10],

      mode: 'lines',
      line:{color:'black'}
    };
    
    const lineZ:Partial<PlotData> = {
      type: 'scatter',
      x:[0,0],
      y:[0,0],
      mode: 'lines',
      line:{color:'black'}
    };
    
    const layout1:Partial<Layout> = { 
        width: 600,
        height: 400,
        title: 'Double Y Axis Example',
        legend: {
            x: 0,
            y: 1,
            xanchor: 'left',
            yanchor: 'top'
          },           
        yaxis: { title: 'Primary Y-Axis' },
        yaxis2: {
          title: 'Secondary Y-Axis',
          overlaying: 'y',
          side: 'right',
        },};
    
    // 下にある<Plot data = {}> のdataの型は Partial<PlotData>[]
    // サンプルとしてわかりやすいように型を書いています
    const allData:Partial<PlotData>[] = [data1, data2, ]

    return <div>
        <h1>Mavlink</h1>
        <Plot data={allData} layout={layout1} />
        <table>
            <tbody>
                {dataFrame.map((row, i) => (
                    <tr key={i}>
                        {row.map((cell, j) => (
                            <td key={j}>{cell}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>;
};