import React from 'react';
import { ReportProps } from "../../Page/Calendar/Calendar";

export const Result: React.FC<ReportProps> = ({ selectedReport }) => {
    const logUrl = `/log/MM-00046/${selectedReport.date.replace(/-/g, '')}`;
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
        <div style={{ overflowWrap: "break-word" }}>
            <h1>作業結果-詳細</h1>
            <p>顧客：{selectedReport.customer}  </p>
            <p>
                圃場：{selectedReport.field.name} ({selectedReport.field.area}a) /&nbsp;
                <a href={selectedReport.field.url} target="_blank" rel="noreferrer noopener">Mapを表示</a>
            </p>
            <p>
                実施日：{selectedReport.date} /&nbsp;
                <a href={logUrl} target="_blank" rel="noreferrer noopener">Logを表示</a>
            </p>
            <p>予定日：</p>
            <ul>
                {selectedReport.plans.map((plan, index) => (
                    <li key={index}>{plan}</li>
                ))}
            </ul>
            <p>内容：{selectedReport.report}</p>
            <button onClick={handleEdit}>編集</button>
            <button onClick={handleUndoCompletion}>予定に戻す</button>
        </div>
    );
};
