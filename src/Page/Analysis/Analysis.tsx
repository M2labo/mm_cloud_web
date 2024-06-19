import { Header } from '../../components/Header/Header';
import React, { useState, useEffect } from 'react';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import { Graph } from '../../components/Data/Graph';
import { Correlation } from '../../components/Data/Correlation';
import { list } from '@aws-amplify/storage';
import { FaRegCheckSquare } from "react-icons/fa";
import { FaRegSquare } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";
import { FaRegFile } from "react-icons/fa";
import { FaRegFolder } from "react-icons/fa";
import { FaRegFolderOpen } from "react-icons/fa";

interface GraphData {
    mmId: string;
    date: string;
    logId: string;
    type: 'time' | 'correlation';
    defaultType: string;
    defaultXAxis: number;
    defaultYAxis: number;
    defaultYAxis2?: number;
}

const MAVLINK_OPTIONS = ['count', 'Time', 'groundspeed', 'servo1_raw', 'servo3_raw', 'servo15_raw', 
                        'satellites_visible_GPS1', 'satellites_visible_GPS2', 'fix_type_GPS1', 'fix_type_GPS2', 
                        'altitude', 'lat', 'lng', 'pitch', 'roll', 'yaw', 'base_mode', 'seq',
                        'vibration_x', 'vibration_y', 'vibration_z'];

const CAN_OPTIONS = ['count', 'Time', 'Mode', 'Sprayer', 'Flow Rate', 'Level', 'Angle', 'Stop Flag', 'State', 'A', 'V', 'W', 'Bat',
                     'L_speed', 'L_direction', 'R_speed', 'R_direction', 'Steer', 'L_Amp', 'R_Amp', 'X', 'Y', 'Speed'];

const SYSTEM_OPTIONS = ['count', 'Time', 'Temp', 'CPU%', 'Network', 'SSID'];

export function Analysis() {
    const [graphs, setGraphs] = useState<GraphData[]>([]);
    const [newGraph, setNewGraph] = useState<GraphData>({ mmId: '', date: '', logId: '', type: 'time', defaultType: 'MAVLINK', defaultXAxis: 0, defaultYAxis: 0});
    const [mmList, setMmList] = useState<string[]>([]);
    const [dateList, setDateList] = useState<{ [key: string]: string[] }>({});
    const [logIdList, setLogIdList] = useState<{ [key: string]: { [key: string]: string[] } }>({});
    const [checked, setChecked] = useState<string[]>([]);
    const [expanded, setExpanded] = useState<string[]>([]);

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
        if (mmList.length > 0) {
            mmList.forEach(mmId => {
                list({
                    prefix: mmId + '/',
                    options: {
                        listAll: true
                    }
                }).then((data) => {
                    const dates: Set<string> = new Set();
                    data.items.forEach((file) => {
                        const folderName = file.key.split('/').slice(1, 3).join('');
                        if (folderName !== 'summary.csv' && folderName !== file.key.split('/').slice(1, 2).join('') + 'summary.csv') {
                            dates.add(folderName);
                        }
                    });
                    setDateList(prev => ({ ...prev, [mmId]: Array.from(dates) }));
                }).catch((error) => {
                    console.log(error);
                });
            });
        }
    }, [mmList]);

    useEffect(() => {
        if (Object.keys(dateList).length > 0) {
            Object.entries(dateList).forEach(([mmId, dates]) => {
                dates.forEach(date => {
                    list({
                        prefix: `${mmId}/${date.slice(0, 4)}/${date.slice(4, 8)}`,
                        options: {
                            listAll: true
                        }
                    }).then((data) => {
                        const logIds: Set<string> = new Set();
                        data.items.forEach((file) => {
                            const folderName = file.key.split('/').slice(3, 4).join('');
                            if (folderName !== 'summary.csv') {
                                logIds.add(folderName);
                            }
                        });
                        setLogIdList(prev => ({
                            ...prev,
                            [mmId]: {
                                ...prev[mmId],
                                [date]: Array.from(logIds)
                            }
                        }));
                    }).catch((error) => {
                        console.log(error);
                    });
                });
            });
        }
    }, [dateList]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewGraph({ ...newGraph, [name]: value });
    };

    const handleCheck = (checked: string[]) => {
        setChecked(checked);
    };

    const addGraph = () => {
        const newGraphs = checked.map(item => {
            const [mmId, date, logId] = item.split('/');
            return {
                mmId,
                date,
                logId,
                type: newGraph.type,
                defaultType: newGraph.defaultType,
                defaultXAxis: newGraph.defaultXAxis,
                defaultYAxis: newGraph.defaultYAxis,
                defaultYAxis2: newGraph.defaultYAxis2? newGraph.defaultYAxis2 : 0
            };
        });
        setGraphs([...graphs, ...newGraphs]);
        setChecked([]);
    };

    const removeGraph = (index: number) => {
        setGraphs(graphs.filter((_, i) => i !== index));
    };

    const removeAllGraphs = () => {
        setGraphs([]);
    };

    const treeData = mmList.map(mmId => ({
        value: mmId,
        label: mmId,
        children: (dateList[mmId] || []).map(date => ({
            value: `${mmId}/${date}`,
            label: date,
            children: (logIdList[mmId] && logIdList[mmId][date] || []).map(logId => ({
                value: `${mmId}/${date}/${logId}`,
                label: logId,
            }))
        }))
    }));

    const getOptions = () => {
        switch (newGraph.defaultType) {
            case 'MAVLINK':
                return MAVLINK_OPTIONS;
            case 'CAN':
                return CAN_OPTIONS;
            case 'SYSTEM':
                return SYSTEM_OPTIONS;
            default:
                return [];
        }
    };

    return (
        <div className="relative">
            <Header />
            <div className="m-4">
                <div className="mb-4">
                    <select
                        name="type"
                        value={newGraph.type}
                        onChange={handleInputChange}
                        className="mr-2 px-4 py-2 border rounded"
                    >
                        <option value="time">時系列グラフ</option>
                        <option value="correlation">相関グラフ</option>
                    </select>
                    <select
                        name="defaultType"
                        value={newGraph.defaultType}
                        onChange={handleInputChange}
                        className="mr-2 px-4 py-2 border rounded"
                    >
                        <option value="MAVLINK">MAVLINK</option>
                        <option value="CAN">CAN</option>
                        <option value="SYSTEM">SYSTEM</option>
                    </select>
                    <select
                        name="defaultXAxis"
                        value={newGraph.defaultXAxis}
                        onChange={handleInputChange}
                        className="mr-2 px-4 py-2 border rounded"
                    >
                        <option value="0">X軸を選択</option>
                        {getOptions().map((option, index) => (
                            <option key={index} value={index+1}>{option}</option>
                        ))}
                    </select>
                    <select
                        name="defaultYAxis"
                        value={newGraph.defaultYAxis}
                        onChange={handleInputChange}
                        className="mr-2 px-4 py-2 border rounded"
                    >   
                        {newGraph.type === 'time' ? (
                            <option value="0">Y軸①を選択</option>
                        ) : 
                            <option value="0">Y軸を選択</option>
                            }   
                        
                        {getOptions().map((option, index) => (
                            <option key={index} value={index+1}>{option}</option>
                        ))}
                    </select>
                    {newGraph.type === 'time' ? (
                        <select
                            name="defaultYAxis2"
                            value={newGraph.defaultYAxis2}
                            onChange={handleInputChange}
                            className="mr-2 px-4 py-2 border rounded"
                        >
                            <option value="0">Y軸②を選択</option>
                            {getOptions().map((option, index) => (
                                <option key={index} value={index+1}>{option}</option>
                            ))}
                        </select>
                        ) : null
                    }
                    
                    <button onClick={addGraph} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">グラフを追加</button>
                    <button onClick={removeAllGraphs} className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">全グラフを削除</button>
                </div>
                
                <div className="flex overflow-x-auto mt-4">
                    <div className='min-w-52 border border-gray-200 p-2 m-2 rounded shadow-md'>
                        <CheckboxTree
                            nodes={treeData}
                            checked={checked}
                            expanded={expanded}
                            onCheck={handleCheck}
                            onExpand={setExpanded}
                            icons={{
                                check: <FaRegCheckSquare />,
                                uncheck: <FaRegSquare />,
                                halfCheck: <FaRegCheckSquare />,
                                expandClose: <FaChevronRight />,
                                expandOpen: <FaChevronDown />,
                                expandAll: <FaChevronRight />,
                                collapseAll: <FaChevronDown />,
                                parentClose: <FaRegFolder />,
                                parentOpen: <FaRegFolderOpen />,
                                leaf: <FaRegFile />
                            }}
                        />
                    </div>
                    {graphs.map((graph, index) => (
                        <div key={index} className="border border-gray-200 p-4 m-2 rounded shadow-md w-full md:w-1/2">
                            {graph.type === "time" ? (
                                <>
                                    <h2 className="text-xl font-bold mb-2">{index + 1}. 時系列グラフ（{graph.mmId}, 日付-{graph.date}, 時刻-{graph.logId}）</h2>
                                    <Graph mmId={graph.mmId} date={graph.date} logId={graph.logId} defaultType={graph.defaultType} defaultXAxis={graph.defaultXAxis} defaultYAxis={graph.defaultYAxis} defaultYAxis2={graph.defaultYAxis2}/>
                                    <button onClick={() => removeGraph(index)} className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">グラフを削除</button>
                                </>
                            ) : graph.type === "correlation" ? (
                                <>
                                    <h2 className="text-xl font-bold mb-2">{index + 1}. 相関グラフ（{graph.mmId}, 日付-{graph.date}, 時刻-{graph.logId}）</h2>
                                    <Correlation mmId={graph.mmId} date={graph.date} logId={graph.logId} defaultType={graph.defaultType} defaultXAxis={graph.defaultXAxis} defaultYAxis={graph.defaultYAxis}/>
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
