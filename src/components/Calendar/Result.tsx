import React from 'react';
import { ReportProps } from "../../Page/Calendar/Calendar";

export const Result: React.FC<ReportProps> = ({ selectedReport }) => {
    const logUrl = selectedReport.date ? `/log/MM-00046/${selectedReport.date.replace(/-/g, '')}` : '#'
    const handleEdit = () => {
        selectedReport.onChangeDetail("editResult");
    }
    const handleUndoCompletion = async () => {
        
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
                        date: null
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Success:', data);
            selectedReport.onChangeDetail("plan");
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="p-4 bg-white shadow-md rounded-lg overflow-wrap-break-word">
            <h1 className="text-2xl font-bold mb-4">作業結果-詳細</h1>
            <p className="mb-2">顧客：{selectedReport.customer}</p>
            <p className="mb-2">
                圃場：{selectedReport.field.name} ({selectedReport.field.area}a) /&nbsp;
                <a href={selectedReport.field.url} target="_blank" rel="noreferrer noopener" className="text-blue-500 hover:underline">Mapを表示</a>
            </p>
            <p className="mb-2">
                実施日：{selectedReport.date} /&nbsp;
                <a href={`#${logUrl}`} target="_blank" rel="noreferrer noopener" className="text-blue-500 hover:underline">Logを表示</a>
            </p>
            <p className="mb-2">予定日：</p>
            <ul className="mb-4 list-disc list-inside">
                {selectedReport.plans.map((plan, index) => (
                    <li key={index}>{plan}</li>
                ))}
            </ul>
            <p className="mb-4">内容：{selectedReport.report}</p>
            <div className="flex space-x-4">
                <button onClick={handleEdit} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">編集</button>
                <button onClick={handleUndoCompletion} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">予定に戻す</button>
            </div>
        </div>
    );
};
