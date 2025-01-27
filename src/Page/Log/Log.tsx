import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Summary } from '../../components/Log/Summary';
import { Header } from '../../components/Header/Header';

async function fetchSummary(mmId: string | undefined, date: string | undefined): Promise<any> {
    const filter_dict = { mm: mmId, date: date };
    const queryParams = new URLSearchParams({ filter: JSON.stringify(filter_dict) });
    console.log(`https://h6sf4fa6rn3kbutj3gicfua5si0hmzda.lambda-url.ap-northeast-1.on.aws/log?${queryParams}`);
    const response = await fetch(`https://h6sf4fa6rn3kbutj3gicfua5si0hmzda.lambda-url.ap-northeast-1.on.aws/summary?${queryParams}`);
    const data = await response.json();
    return data;
}

export function Log() {
    const navigate = useNavigate();
    const { mmId, date } = useParams(); 
    const [summaries, setSummaries] = useState<any[]>([]);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [comment, setComment] = useState<string>('');

    useEffect(() => {
        let isSubscribed = true;
        console.log(mmId, date);
        fetchSummary(mmId, date)
            .then(data => {
                if (isSubscribed) {
                    const parsedData = JSON.parse(data.result);
                    const sortedData = parsedData.sort((a: any, b: any) => a.time.localeCompare(b.time)); // 初回読み込み時に昇順ソート
                    console.log(sortedData);
                    setSummaries(sortedData);
                }
            })
            .catch(console.error);

        return () => { isSubscribed = false; };
    }, [mmId, date]);


    const handleCommentSubmit = async(e: React.FormEvent, time: string) => {
        e.preventDefault();
        // コメント投稿のロジックをここに追加
        console.log(`コメントを投稿: ${time}, ${comment}`);
        try {
            const url = new URL('https://h6sf4fa6rn3kbutj3gicfua5si0hmzda.lambda-url.ap-northeast-1.on.aws/log');

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: {
                        mm: mmId,
                        date: date,
                        time: time,
                        driving_time: summaries[editIndex!].driving_time,
                        distance: summaries[editIndex!].distance,
                        flow_volume: summaries[editIndex!].flow_volume,
                        power: summaries[editIndex!].power,
                        route_id: summaries[editIndex!].route_id,
                        comment: comment
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Success:', data);
            // console.log('comment posted:', data.result['id']);

        } catch (error) {
            console.error('Error:', error);
        }
        // 送信後の処理 (例: 編集モード解除、コメントフィールドのクリア)
        setEditIndex(null);
        summaries[editIndex!].comment = comment;
        setComment('');
    };

    const handleDetailNavigate = (time: string) => {
        navigate(`/detail/${mmId}/${date}/${time}`);
    };

    return (
        <>
            <Header />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4 text-center md:text-left">時刻</h1>
                <ul className="list-none">
                    {summaries.map((summary, index) => (
                        <li key={index} className="mb-4">
                            <div 
                                className="p-4 bg-white shadow-md rounded-lg my-4 cursor-pointer" 
                                onClick={() => handleDetailNavigate(summary.time)}
                            >
                                <p className="text-lg font-semibold mb-2">{`${summary.time?.slice(0, 2)}:${summary.time?.slice(2, 4)}:${summary.time?.slice(4, 6)}`}</p>
                                {summary.customer_name && summary.field_name && summary.route_name && (
                                    <p className='mb-2'>顧客：{summary.customer_name}, ほ場：{summary.field_name}, ルート：{summary.route_name}</p>
                                )}
                                <p className='mb-2'>
                                    走行時間：{summary.driving_time.toFixed(0)}秒, 
                                    走行距離：{summary.distance.toFixed(0)}m, 
                                    散布量：{summary.flow_volume.toFixed(1)}L, 
                                    消費電力：{summary.power.toFixed(1)}Wh
                                </p>
                                {editIndex === index ? (
                                    <div className="flex flex-col md:flex-row items-start md:items-center">
                                        <p className="mr-2 mb-2 md:mb-0">コメント：</p>
                                        <input 
                                            type="text" 
                                            className="border rounded p-1 mb-2 md:mb-0 mr-2 w-full md:w-auto" 
                                            value={comment}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                setComment(e.target.value);
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                        />
                                        <div>
                                            <button 
                                                type="submit" 
                                                className="p-1 bg-blue-500 text-white rounded" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCommentSubmit(e, summary.time);
                                                }}
                                            >
                                                保存
                                            </button>
                                            <button 
                                                type="button" 
                                                className="p-1 bg-blue-500 text-white rounded ml-2" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditIndex(null);
                                                    setComment('');
                                                }}
                                            >
                                                キャンセル
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col md:flex-row items-start md:items-center">
                                        {summary.comment && (
                                            <p className="mr-2 mb-2 md:mb-0">コメント：{summary.comment}</p>
                                        )}
                                        <button 
                                            type="button" 
                                            className="p-1 bg-blue-500 text-white rounded ml-0 md:ml-2" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditIndex(index);
                                                setComment(summary.comment || '');
                                            }}
                                        >
                                            {summary.comment ? "編集" : "コメントを投稿"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
