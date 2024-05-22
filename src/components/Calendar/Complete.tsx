import React, { useState } from 'react';
import { ReportProps } from "../../Page/Calendar/Calendar";

export const Complete: React.FC<ReportProps> = ({ selectedReport }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [comments, setComments] = useState<string[]>(Array(selectedReport.plans.length).fill(''));

    const handleCancelClick = () => {
        selectedReport.onChangeDetail("plan");
    }

    const handleCompletion = async () => {
        
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
                        comments: comments
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
        <div style={{ overflowWrap: "break-word" }}>
            <h1>作業予定-完了</h1>
            <p>顧客：{selectedReport.customer}  </p>
            <p>
                圃場：{selectedReport.field.name} ({selectedReport.field.area}a) /
                <a href={selectedReport.field.url} target="_blank" rel="noreferrer noopener">Mapを表示</a>
            </p>
            <p>予定日：</p>
            <ul style={{ listStyleType: "none", padding: 0 }}>
                {selectedReport.plans.map((plan, index) => (
                    <li key={index}>
                        <input
                            type="radio"
                            name="selectedDate"
                            value={plan}
                            checked={selectedDate === plan}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                        {plan}
                        <br />
                        <textarea
                            placeholder="コメントを記載"
                            value={comments[index]}
                            onChange={(e) => handleCommentChange(index, e.target.value)}
                            style = {{marginLeft: "40px"}}
                        />
                    </li>
                ))}
            </ul>
            <label htmlFor="content">内容：</label>
            <textarea id="content" defaultValue={selectedReport.report}></textarea>
            <br />
            <button onClick={() => handleCompletion()}>作業完了</button>
            <button onClick={handleCancelClick}>キャンセル</button>
        </div>
    );
}
