import { Header } from '../../components/Header/Header';
import React, { useState, useEffect } from 'react';
import { Graph } from '../../components/Data/Graph';
import { Correlation } from '../../components/Data/Correlation';
import { list } from '@aws-amplify/storage';

interface GraphData {
    mmId: string;
    date: string;
    logId: string;
    type: 'time' | 'correlation';
}

export function Analysis() {
    const [graphs, setGraphs] = useState<GraphData[]>([]);
    const [newGraph, setNewGraph] = useState<GraphData>({ mmId: '', date: '', logId: '', type: 'time' });
    const [mmList, setMmList] = useState<string[]>([]);
    const [dateList, setDateList] = useState<string[]>([]);
    const [logIdList, setLogIdList] = useState<string[]>([]);
    const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);

    useEffect(() => {
        list({
            prefix: 'MM-',
            options: {
                listAll: true
            }
        }).then((data) => {
            const folder: Set<string> = new Set();
            data.items.forEach((file) => {
                const folderName = file.key.split('/')[0];
                folder.add(folderName);
            });
            setMmList(Array.from(folder));
        }).catch((error) => {
            console.log(error);
        });
    }, []);

    useEffect(() => {
        list({
            prefix: newGraph.mmId + '/',
            options: {
                listAll: true
            }
        }).then((data) => {
            const folder: Set<string> = new Set();
            data.items.forEach((file) => {
                const folderName = file.key.split('/').slice(1, 3).join('');
                if (folderName !== 'summary.csv' && folderName !== file.key.split('/').slice(1, 2).join('') + 'summary.csv') {
                    folder.add(folderName);
                }
            });
            setDateList(Array.from(folder));
        }).catch((error) => {
            console.log(error);
        });
    }, [newGraph.mmId]);

    useEffect(() => {
        list({
            prefix: newGraph.mmId + '/' + newGraph.date?.slice(0, 4) + '/' + newGraph.date?.slice(4, 8),
            options: {
                listAll: true
            }
        }).then((data) => {
            const folder: Set<string> = new Set();
            data.items.forEach((file) => {
                const folderName = file.key.split('/').slice(3, 4).join('');
                if (folderName !== 'summary.csv') {
                    folder.add(folderName);
                }
            });
            setLogIdList(Array.from(folder));
        }).catch((error) => {
            console.log(error);
        });
    }, [newGraph.date]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "logIds") {
            const newLogIds = [...selectedLogIds];
            if ((e.target as HTMLInputElement).checked) {
                newLogIds.push(value);
            } else {
                const index = newLogIds.indexOf(value);
                if (index > -1) {
                    newLogIds.splice(index, 1);
                }
            }
            setSelectedLogIds(newLogIds);
        } else {
            setNewGraph({ ...newGraph, [name]: value });
        }
    };

    const addGraph = () => {
        const newGraphs = selectedLogIds.map(logId => ({
            mmId: newGraph.mmId,
            date: newGraph.date,
            logId: logId,
            type: newGraph.type
        }));
        setGraphs([...graphs, ...newGraphs]);
        setNewGraph({ mmId: '', date: '', logId: '', type: 'time' });
        setSelectedLogIds([]);
    };

    const removeGraph = (index: number) => {
        setGraphs(graphs.filter((_, i) => i !== index));
    };

    return (
        <div className="relative">
            <Header />
            <div className="m-4">
                <div className="mb-4">
                    <select
                        name="mmId"
                        value={newGraph.mmId}
                        onChange={handleInputChange}
                        className="mr-2 px-4 py-2 border rounded"
                    >
                        <option value="">MMIDを選択</option>
                        {mmList.map((mmId, index) => (
                            <option key={index} value={mmId}>{mmId}</option>
                        ))}
                    </select>
                    <select
                        name="date"
                        value={newGraph.date}
                        onChange={handleInputChange}
                        className="mr-2 px-4 py-2 border rounded"
                    >
                        <option value="">日付を選択</option>
                        {dateList.map((date, index) => (
                            <option key={index} value={date}>{date}</option>
                        ))}
                    </select>
                    <div className="mb-2">
                        {logIdList.map((logId, index) => (
                            <div key={index}>
                                <label>
                                    <input
                                        type="checkbox"
                                        name="logIds"
                                        value={logId}
                                        checked={selectedLogIds.includes(logId)}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    {logId}
                                </label>
                            </div>
                        ))}
                    </div>
                    <select
                        name="type"
                        value={newGraph.type}
                        onChange={handleInputChange}
                        className="mr-2 px-4 py-2 border rounded"
                    >
                        <option value="time">時系列グラフ</option>
                        <option value="correlation">相関グラフ</option>
                    </select>
                    <button onClick={addGraph} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">グラフを追加</button>
                </div>
                <div className="flex overflow-x-auto">
                    {graphs.map((graph, index) => (
                        <div key={index} className="border border-gray-200 p-4 m-2 rounded shadow-md w-full md:w-1/2">
                            {graph.type === "time" ? (
                                <>
                                    <h2 className="text-xl font-bold mb-2">{index + 1}. 時系列グラフ（{graph.mmId}, 日付-{graph.date}, 時刻-{graph.logId}）</h2>
                                    <Graph mmId={graph.mmId} date={graph.date} logId={graph.logId} />
                                    <button onClick={() => removeGraph(index)} className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">グラフを削除</button>
                                </>
                            ) : graph.type === "correlation" ? (
                                <>
                                    <h2 className="text-xl font-bold mb-2">{index + 1}. 相関グラフ（{graph.mmId}, 日付-{graph.date}, 時刻-{graph.logId}）</h2>
                                    <Correlation mmId={graph.mmId} date={graph.date} logId={graph.logId} />
                                    <button onClick={() => removeGraph(index)} className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">グラフを削除</button>
                                </>
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
