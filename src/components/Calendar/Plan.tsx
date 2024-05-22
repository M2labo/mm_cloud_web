import { textareafield } from "@aws-amplify/ui/dist/types/theme/tokens/components/textAreaField";
import React, { useState } from 'react';
import { ReportProps } from "../../Page/Calendar/Calendar";



export const Plan: React.FC<ReportProps> = ({ selectedReport }) => {
    const [edit, setEdit] = useState(false);
    const handleCompleteClick = () => {
        selectedReport.onChangeDetail("complete");
    }
    return (
        <div style={{ overflowWrap: "break-word" }}>
            <h1>作業予定-詳細</h1>
            <p>顧客：{selectedReport.customer}  </p>
            <p>
                圃場：{selectedReport.field.name} ({selectedReport.field.area}a) /
                <a href={selectedReport.field.url} target="_blank" rel="noreferrer noopener">Mapを表示</a>
            </p>
            <p>予定日：</p>
            <ul>
                {selectedReport.plans.map((plan, index) => (
                    <li key={index}>{plan}</li>
                ))}
            </ul>
            <p>内容：{selectedReport.report}</p>
            <button onClick={handleCompleteClick}>作業完了</button>
            <button>予定変更</button>
            <button>予定削除</button>

        </div>
    );
}
