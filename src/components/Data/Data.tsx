import React, { useState } from 'react';
import { Graph } from './Graph';
import { Correlation } from './Correlation';
import { Table } from './Table';
import { useParams } from 'react-router-dom';
import { Mavlink } from '../Mavlink/Mavlink';

export function Data() {
    const { mmId, date, logId } = useParams();
    const type = "time";
    const [graphs, setGraphs] = useState([{ mmId, date, logId, type}]);

    const addGraphTime = () => {
        setGraphs([...graphs, { mmId, date, logId, type:"time" }]);
    };

    const addGraphCorrelation = () => {
        setGraphs([...graphs, { mmId, date, logId, type:"correlation" }]);
    };

    const removeGraph = (index:number) => {
        setGraphs(graphs.filter((_, i) => i !== index));
    };

    return (
        <div style={{margin:"10px"}}>
            <button onClick={addGraphTime} >時系列グラフを追加</button>
            <button onClick={addGraphCorrelation} >相関グラフを追加</button>
            <div style={{display:"flex"}}>
            {graphs.map((graph, index) => (
                <div key={index} style={{ border: "solid 1px", borderColor:"#f5f5f5", padding:"10px", marginTop:"10px"}}>
                    {graph.type === "time" ? (
                        <>
                            <h2>{index + 1}.時系列グラフ</h2>
                            <Graph mmId={graph.mmId} date={graph.date} logId={graph.logId} />
                            <button onClick={() => removeGraph(index)}>グラフを削除</button>
                        </>
                    ) : graph.type === "correlation" ? (
                        <>
                            <h2>{index + 1}.相関グラフ</h2>
                            <Correlation mmId={graph.mmId} date={graph.date} logId={graph.logId} />
                            <button onClick={() => removeGraph(index)}>グラフを削除</button>
                        </>
                    ) : null}
                </div>
            ))}
            </div>
            <div style={{ padding:"10px", marginTop:"10px"}}>
                <Table mmId={mmId} date={date} logId={logId} />
            </div>
            
        </div>
    );
}
