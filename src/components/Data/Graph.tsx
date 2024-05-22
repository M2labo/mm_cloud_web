import { getUrl } from "@aws-amplify/storage"
import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import {Layout, PlotData} from "plotly.js";

async function getMavlink(mmId: string | undefined, date: string | undefined, logId: string | undefined, type: string | undefined): Promise<string> {
    const urlResponse = await getUrl({ key: `${mmId}/${date?.slice(0,4)}/${date?.slice(4,8)}/${logId}/${type}.csv` });
    const response = await fetch(urlResponse.url.href);
    

    return response.text(); // Return the response text
}

export const Graph: React.FC<{ mmId: string | undefined; date: string | undefined; logId: string | undefined;}> = ({ mmId, date, logId }) => {
    const [type, setType] = useState<string>("MAVLINK");
    const [dataFrame, setDataFrame] = useState<string[][]>([]);
    const [xAxis, setXAxis] = useState<number>(0);
    const [xAxisName, setXAxisName] = useState<string>("");
    const [xAxis2, setXAxis2] = useState<number>(0);
    const [yAxis, setYAxis] = useState<number>(0);
    const [yAxisName, setYAxisName] = useState<string>("");
    const [yAxis2, setYAxis2] = useState<number>(0);
    const [yAxisName2, setYAxisName2] = useState<string>("");
    const [items, setItems] = useState<string[]>([]);
    const [xData, setXData] = useState<number[]>([]);
    const [xData2, setXData2] = useState<number[]>([]);
    const [yData, setYData] = useState<number[]>([]);
    const [yData2, setYData2] = useState<number[]>([]);
    const [allData, setAllData] = useState<Partial<PlotData>[]>([]);
    const [layout, setLayout] = useState<Partial<Layout>>({ title: ''});
    const [xAxisMin, setXAxisMin] = useState<number>(0);
    const [xAxisMax, setXAxisMax] = useState<number>(0);
    const [max, setMax] = useState<number>(0);
    const [min, setMin] = useState<number>(0);
    const [average, setAverage] = useState<number>(0);
    const [variance, setVariance] = useState<number>(0);
    const [max2, setMax2] = useState<number>(0);
    const [min2, setMin2] = useState<number>(0);
    const [average2, setAverage2] = useState<number>(0);
    const [variance2, setVariance2] = useState<number>(0);

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


    //ボタン用のデータをセット
    useEffect(() => {
        if (!dataFrame || dataFrame.length === 0) {
            // dataFrameが未定義または空の場合、このエフェクトをスキップ
            return;
        }
        const newItems: string[] = [];
        dataFrame[0].forEach(row => {
            newItems.push(row);
        });
        setItems(newItems);
    }, [dataFrame]); // dataFrameが更新されたら実行 

    //グラフをセット
    useEffect(() => {
        const newX: number[] = [];
        const newX2: number[] = [];
        const newY: number[] = [];
        const newY2: number[] = [];

        dataFrame.forEach(row => {
            const x = row[xAxis];
            const y = row[yAxis];
            const x2 = row[xAxis2];
            const y2 = row[yAxis2];
            if (!isNaN(parseFloat(x)) && !isNaN(parseFloat(y))) {
                newX.push(parseFloat(x));
                newY.push(parseFloat(y));
            }
            if (!isNaN(parseFloat(x2)) && !isNaN(parseFloat(y2))) {
                newX2.push(parseFloat(x2));
                newY2.push(parseFloat(y2));
            }
        });
        console.log("newX");
        console.log(newX);
        setXData(newX);
        setXData2(newX2);
        setYData(newY);
        setYData2(newY2); 
        const newData:Partial<PlotData> = {
            type: 'scatter',
            x: newX,
            y: newY,
            marker:{symbol:'circle', opacity:1, size:3},
            mode: 'markers',
            name: yAxisName,
        }
        const newData2:Partial<PlotData> = {
            type: 'scatter',
            x: newX2,
            y: newY2,
            marker:{symbol:'circle', opacity:1, size:3},
            mode: 'markers',
            name:  yAxisName2,
            yaxis: 'y2',
        }
        setAllData([newData, newData2]);
        console.log("allData");
        console.log(allData)
        setLayout({ 
            xaxis: { 
                title: xAxisName,
                rangeslider: {},
             },
            yaxis: { title: yAxisName },
            yaxis2: {
            title: yAxisName2,
            overlaying: 'y',
            side: 'right',
            },
            margin: { t: 0 , b: 0}
        });
    }, [dataFrame, xAxis, yAxis, yAxis2, xAxisName, yAxisName, yAxisName2]);

    useEffect(() => {
        const filteredY = yData.filter((_:any, index:any) => xData[index] >= xAxisMin && xData[index] <= xAxisMax);
        const filteredY2 = yData2.filter((_:any, index:any) => xData2[index] >= xAxisMin && xData2[index] <= xAxisMax);
        console.log(filteredY);
        console.log(filteredY2);
        // 平均を計算
        const average = filteredY.reduce((acc:any, curr:any) => acc + curr, 0) / filteredY.length;
        setAverage(average);
        const average2 = filteredY2.reduce((acc:any, curr:any) => acc + curr, 0) / filteredY2.length;
        setAverage2(average2);
        console.log(average);
        console.log(average2);

        // 分散を計算
        const variance = filteredY.reduce((acc:any, curr:any) => acc + (curr - average) ** 2, 0) / filteredY.length;
        setVariance(variance);
        const variance2 = filteredY2.reduce((acc:any, curr:any) => acc + (curr - average2) ** 2, 0) / filteredY2.length
        setVariance2(variance2);

        // 最大値と最小値を計算
        const max = Math.max(...filteredY);
        setMax(max);
        const max2 = Math.max(...filteredY2);
        setMax2(max2);
        const min = Math.min(...filteredY);
        setMin(min);
        const min2 = Math.min(...filteredY2);
        setMin2(min2);

    }, [dataFrame, xAxis, yAxis, yAxis2, xAxisName, yAxisName, yAxisName2, xAxisMin, xAxisMax, allData]);
    // ボタンがクリックされたときの動作
    const selectX = (item:string, index:number) => {
        console.log(`${index} button clicked`);
        setXAxis(index);
        setXAxisName(item);
        setXAxis2(index);
        setXAxisName(item);
    };
    const selectY1 = (item:string, index:number) => {
        console.log(`${index} button clicked`);
        setYAxis(index);
        setYAxisName(item);
    };
    const selectY2 = (item:string, index:number) => {
        console.log(`${index} button clicked`);
        setYAxis2(index);
        setYAxisName2(item);
    };
    const handleRelayout = (event: any) => {
        // event['xaxis.range[0]'] と event['xaxis.range[1]'] に新しい範囲の開始日と終了日が含まれます
        const xaxisRange:any = event['xaxis.range'];
        if (xaxisRange) {
            // 新しい範囲の最小値と最大値を取得
            setXAxisMin(xaxisRange[0]);
            setXAxisMax(xaxisRange[1]);
                    };
    };

    return <div>
        <select onChange={(e) => setType(e.target.value)} style={{display:"block"}}>
            <option value="MAVLINK">MAVLINK</option>
            <option value="CAN">CAN</option>
            <option value="SYSTEM">SYSTEM</option>
        </select>
        <p>選択範囲 : {xAxisMin} - {xAxisMax}</p>
        <p>Y軸① : 最大{max.toFixed(6)}, 最小{min.toFixed(6)},平均{average.toFixed(6)}, 分散{variance.toFixed(6)}</p>
        <p>Y軸② : 最大{max2.toFixed(6)}, 最小{min2.toFixed(6)},平均{average2.toFixed(6)}, 分散{variance2.toFixed(6)}</p>
        
        <Plot data={allData} layout={layout} onRelayout={(e) => handleRelayout(e)} />
        <div style={{width:"100%", maxWidth:"700px", margin:"10px"}}>
            <p>X軸を選択</p>
            {items.map((item, index) => (
                <button key={index} onClick={() => selectX(item, index)}
                style={{ backgroundColor: xAxis === index ? '#B0E0E6' : 'initial' }}>
                    {item}
                </button>
            ))}
            <p>Y軸①を選択</p>
            {items.map((item, index) => (
                <button key={index} onClick={() => selectY1(item, index)}
                style={{ backgroundColor: yAxis === index ? '#B0E0E6' : 'initial' }}>
                    {item}
                </button>
            ))}
            <p>Y軸②を選択</p>
            {items.map((item, index) => (
                <button key={index} onClick={() => selectY2(item, index)}
                style={{ backgroundColor: yAxis2 === index ? '#B0E0E6' : 'initial' }}>
                    {item}
                </button>
            ))}
        </div>
    </div>;
};