import { getUrl } from "@aws-amplify/storage"
import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import {Layout, PlotData} from "plotly.js";

async function getMavlink(mmId: string | undefined, date: string | undefined, logId: string | undefined, type: string | undefined): Promise<string> {
    const urlResponse = await getUrl({ key: `${mmId}/${date?.slice(0,4)}/${date?.slice(4,8)}/${logId}/${type}.csv` });
    const response = await fetch(urlResponse.url.href);
    

    return response.text(); // Return the response text
}

function calculatePearsonCorrelation(x:number[], y:number[]) {
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    const n = x.length;

    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumX2 += x[i] * x[i];
        sumY2 += y[i] * y[i];
    }

    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return numerator / denominator;
}

// 最小二乗法で線形回帰のパラメータを計算する関数
function calculateRegression(x:number[], y:number[]) {
    const n = x.length;
    const xSum = x.reduce((acc, curr) => acc + curr, 0);
    const ySum = y.reduce((acc, curr) => acc + curr, 0);
    const xySum = x.reduce((acc, curr, idx) => acc + curr * y[idx], 0);
    const xxSum = x.reduce((acc, curr) => acc + curr * curr, 0);
    const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;

    return { slope, intercept };
}

export const Correlation: React.FC<{ mmId: string | undefined; date: string | undefined; logId: string | undefined;}> = ({ mmId, date, logId }) => {
    const [type, setType] = useState<string>("MAVLINK");
    const [dataFrame, setDataFrame] = useState<string[][]>([]);
    const [xAxis, setXAxis] = useState<number>(0);
    const [xAxisName, setXAxisName] = useState<string>("");
    const [yAxis, setYAxis] = useState<number>(0);
    const [yAxisName, setYAxisName] = useState<string>("");
    const [items, setItems] = useState<string[]>([]);
    const [xData, setXData] = useState<number[]>([]);
    const [yData, setYData] = useState<number[]>([]);
    const [allData, setAllData] = useState<Partial<PlotData>[]>([]);
    const [layout, setLayout] = useState<Partial<Layout>>({ title: ''});
    const [correlationCoefficient, setCorrelationCoefficient] = useState<number>(0);
    const [slope, setSlope] = useState<number>(0);
    const [intercept, setIntercept] = useState<number>(0);

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
        const newY: number[] = [];
        const newY2: number[] = [];

        dataFrame.forEach(row => {
            const x = row[xAxis];
            const y = row[yAxis];

            if (!isNaN(parseFloat(x)) && !isNaN(parseFloat(y))) {
                newX.push(parseFloat(x));
                newY.push(parseFloat(y));
            }
        });
        console.log("newX");
        console.log(newX);
        setXData(newX);
        setYData(newY);
        const newData:Partial<PlotData> = {
            type: 'scatter',
            x: newX,
            y: newY,
            marker:{symbol:'circle', opacity:1, size:3},
            mode: 'markers',
            name: yAxisName,
        }
        setAllData([newData,{
            x: newX,
            y: newX.map(val => intercept + slope * val),
            type: 'scatter',
            mode: 'lines',
            name: '回帰直線'
        }]);
        setLayout({ 
            xaxis: { 
                title: xAxisName,
                
             },
            yaxis: { title: yAxisName },
  
            margin: { t: 0 , b: 0},
            
        });
    }, [dataFrame, xAxis, yAxis, xAxisName, yAxisName]);

    useEffect(() => {
        // 相関係数の計算
        const correlationCoefficient = calculatePearsonCorrelation(xData, yData);
        console.log('相関係数:', correlationCoefficient);
        setCorrelationCoefficient(correlationCoefficient);
        // 回帰直線の計算
        const params = calculateRegression(xData, yData);
        console.log('回帰直線:', params);
        setSlope(params.slope);
        setIntercept(params.intercept);
        const newData:Partial<PlotData> = {
            type: 'scatter',
            x: xData,
            y: yData,
            marker:{symbol:'circle', opacity:1, size:3},
            mode: 'markers',
            name: yAxisName,
        }
        setAllData([newData,{
            x: xData,
            y: xData.map(val => intercept + slope * val),
            type: 'scatter',
            mode: 'lines',
            name: '回帰直線'
        }]);
    
    }, [dataFrame, xAxis, yAxis, xAxisName, yAxisName, allData]);

        // ボタンがクリックされたときの動作
    const selectX = (item:string, index:number) => {
        console.log(`${index} button clicked`);
        setXAxis(index);
        setXAxisName(item);
    };
    const selectY1 = (item:string, index:number) => {
        console.log(`${index} button clicked`);
        setYAxis(index);
        setYAxisName(item);
    };

    return <div>
        <select onChange={(e) => setType(e.target.value)} style={{display:"block"}}>
            <option value="MAVLINK">MAVLINK</option>
            <option value="CAN">CAN</option>
            <option value="SYSTEM">SYSTEM</option>
        </select>
        <p>相関係数 : {correlationCoefficient.toFixed(6)}</p>
        <p>回帰直線 : 傾き{slope.toFixed(6)}, 切片{intercept.toFixed(6)}</p>
        
        <Plot data={allData} layout={layout} />
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

        </div>
    </div>;
};