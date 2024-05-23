import { textareafield } from "@aws-amplify/ui/dist/types/theme/tokens/components/textAreaField";
import React, { useState } from 'react';
import { ReportProps } from "../../Page/Calendar/Calendar";



export const Plan: React.FC<ReportProps> = ({ selectedReport }) => {
    const [edit, setEdit] = useState(false);
    const handleCompleteClick = () => {
        selectedReport.onChangeDetail("complete");
    }
    return (
        <div className="p-4 bg-white shadow-md rounded-lg overflow-wrap-break-word">
            <h1 className="text-2xl font-bold mb-4">作業予定-詳細</h1>
            <p className="mb-2">顧客：{selectedReport.customer}</p>
            <p className="mb-2">
                圃場：{selectedReport.field.name} ({selectedReport.field.area}a) /
                <a href={selectedReport.field.url} target="_blank" rel="noreferrer noopener" className="text-blue-500 hover:underline">Mapを表示</a>
            </p>
            <p className="mb-2">予定日：</p>
            <ul className="mb-4 list-disc list-inside">
                {selectedReport.plans.map((plan, index) => (
                    <li key={index}>{plan}</li>
                ))}
            </ul>
            <p className="mb-4">内容：{selectedReport.report}</p>
            <div className="flex space-x-4">
                <button onClick={handleCompleteClick} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">作業完了</button>
                <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-700">予定変更</button>
                <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">予定削除</button>
            </div>
        </div>
    );
}
