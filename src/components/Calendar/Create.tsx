import React, { useState, useEffect } from 'react';

interface CreateProps {
    selectedDate: string;
    onCreated: (title: string, start: string, groupId: string, content: string) => void;
}

export const Create: React.FC<CreateProps> = ({ selectedDate, onCreated }) => {
    const [customer, setCustomer] = useState<string>('選択してください');
    const [fieldOptions, setFieldOptions] = useState<string[]>([]);
    const [selectedField, setSelectedField] = useState('選択してください');
    const [dates, setDates] = useState([selectedDate]);
    const [content, setContent] = useState('');
    const [customers, setCustomers] = useState<string[]>([]);
    const [fieldsByCustomer, setFieldsByCustomer] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        // APIからデータを取得する
        fetch('https://lsdlueq272y5yboojqgls6dcsi0ejsla.lambda-url.ap-northeast-1.on.aws/all_customer')
            .then(response => response.json())
            .then((data: any) => {
                console.log(data); // レスポンスデータの形式を確認

                if (data && data.result) {
                    const { customers, fieldsByCustomer } = data.result;
                    setCustomers(customers || []);
                    setFieldsByCustomer(fieldsByCustomer || {});
                } else {
                    console.error('Unexpected data format:', data);
                }
            })
            .catch(error => console.error('Error fetching fields:', error));
    }, []);

    const handleCustomerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCustomer = event.target.value;
        setCustomer(selectedCustomer);
        setFieldOptions(fieldsByCustomer[selectedCustomer] || []);
    };

    const handleFieldChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedField = event.target.value;
        setSelectedField(selectedField);
    };

    const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(event.target.value);
    };

    const handleAddDate = () => {
        setDates([...dates, '']);
    };

    const handleDateChange = (index: number, value: string) => {
        const newDates = [...dates];
        newDates[index] = value;
        setDates(newDates);
    };

    const handleCreateClick = () => {
        if (customer !== '選択してください' && selectedField !== '選択してください') {
            for (let i = 0; i < dates.length; i++) {
                onCreated(customer + "/" + selectedField, dates[i], 'plan', content);
            }
        } else {
            console.error("データが不完全です。");
        }
    };

    return (
        <div style={{ overflowWrap: "break-word" }}>
            <h1>作業予定-作成</h1>
            <label htmlFor="customer">顧客：</label>
            <select id="customer" value={customer} onChange={handleCustomerChange}>
                <option value="選択してください">選択してください</option>
                {customers.length > 0 && customers.map(cust => (
                    <option key={cust} value={cust}>{cust}</option>
                ))}
            </select>
            <br />

            <label htmlFor="field">圃場：</label>
            {fieldOptions.length > 0 ? (
                <select id="field" value={selectedField} onChange={handleFieldChange}>
                    <option value="選択してください">選択してください</option>
                    {fieldOptions.map(field => (
                        <option key={field} value={field}>{field}</option>
                    ))}
                </select>
            ) : (
                <p>選択した顧客に対応する圃場がありません。</p>
            )}
            <br />

            {dates.map((date, index) => (
                <div key={index}>
                    <label>予定日：</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => handleDateChange(index, e.target.value)}
                    />
                    <br />
                </div>
            ))}
            <button onClick={handleAddDate}>予定日を追加</button>
            <br />

            <label htmlFor="content">内容：</label>
            <textarea id="content" value={content} onChange={handleContentChange}></textarea>
            <br />

            <button onClick={handleCreateClick}>作成</button>
            <button>キャンセル</button>
        </div>
    );
};
