import React, { useState } from 'react';
import { ReportProps } from "../../Page/Calendar/Calendar";
import { report } from 'process';

export const Complete: React.FC<ReportProps> = ({ selectedReport }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [comments, setComments] = useState<string[]>(Array(selectedReport.plans.length).fill(''));
    const [reportContent, setReportContent] = useState(selectedReport.report);

    const handleCancelClick = () => {
        selectedReport.onChangeDetail("plan");
    }

    const handleCompletion = async () => {
        if (!selectedDate) {
            alert('実施日を選択してください。');
            return;
        }
        
        try {
            const url = new URL('https://lsdlueq272y5yboojqgls6dcsi0ejsla.lambda-url.ap-northeast-1.on.aws/report');
            const filter = JSON.stringify({ id: selectedReport.id });
            url.searchParams.append('filter', filter);

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: {
                        date: selectedDate,
                        comments: comments,
                        report: reportContent
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Success:', data);
            selectedReport.onChangeDetail("result");
        } catch (error) {
            console.error('Error:', error);
        }
        
    };

    const handleCommentChange = (index: number, value: string) => {
        const newComments = [...comments];
        newComments[index] = value;
        setComments(newComments);
    };

    return (
        <div className="p-4 bg-white shadow-md rounded-lg overflow-wrap-break-word">
            <h1 className="text-2xl font-bold mb-4">作業予定-完了</h1>
            <p className="mb-2">顧客：{selectedReport.customer}</p>
            <p className="mb-2">
                圃場：{selectedReport.field.name} ({selectedReport.field.area}a) /
                <a href={selectedReport.field.url} target="_blank" rel="noreferrer noopener" className="text-blue-500 hover:underline">Mapを表示</a>
            </p>
            <p className="mb-2">実施日：</p>
            <ul className="mb-4 list-none p-0">
                {selectedReport.plans.map((plan, index) => (
                    <li key={index} className="mb-2">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="selectedDate"
                                value={plan}
                                checked={selectedDate === plan}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="mr-2"
                            />
                            {plan}
                        </label>
                        <textarea
                            placeholder="延期理由等のコメントを記載"
                            value={comments[index]}
                            onChange={(e) => handleCommentChange(index, e.target.value)}
                            className="mt-2 p-2 border rounded w-full"
                        />
                    </li>
                ))}
            </ul>
            <label htmlFor="content" className="block mb-2">内容：</label>
            <textarea 
                id="content" 
                value={reportContent} 
                onChange={(e) => setReportContent(e.target.value)} 
                className="p-2 border rounded w-full mb-4"
            ></textarea>
            <div className="flex space-x-4">
                <button onClick={() => handleCompletion()} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">作業完了</button>
                <button onClick={handleCancelClick} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700">キャンセル</button>
            </div>
        </div>
    );
}
