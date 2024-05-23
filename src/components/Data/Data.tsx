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
        <div className="m-4">
            <div className="mb-4">
                <button onClick={addGraphTime} className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">時系列グラフを追加</button>
                <button onClick={addGraphCorrelation} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700">相関グラフを追加</button>
            </div>
            <div className="flex overflow-x-auto">
                {graphs.map((graph, index) => (
                    <div key={index} className="border border-gray-200 p-4 m-2 rounded shadow-md w-full md:w-1/2">
                        {graph.type === "time" ? (
                            <>
                                <h2 className="text-xl font-bold mb-2">{index + 1}. 時系列グラフ</h2>
                                <Graph mmId={graph.mmId} date={graph.date} logId={graph.logId} />
                                <button onClick={() => removeGraph(index)} className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">グラフを削除</button>
                            </>
                        ) : graph.type === "correlation" ? (
                            <>
                                <h2 className="text-xl font-bold mb-2">{index + 1}. 相関グラフ</h2>
                                <Correlation mmId={graph.mmId} date={graph.date} logId={graph.logId} />
                                <button onClick={() => removeGraph(index)} className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">グラフを削除</button>
                            </>
                        ) : null}
                    </div>
                ))}
            </div>
            <div className="p-4 mt-4">
                <Table mmId={mmId} date={date} logId={logId} />
            </div>
        </div>
    );
}
