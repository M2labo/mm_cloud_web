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
        <div className="p-4 bg-white shadow-md rounded-lg overflow-wrap-break-word">
            <h1 className="text-2xl font-bold mb-4">作業予定-作成</h1>
            <label htmlFor="customer" className="block mb-2">顧客：</label>
            <select id="customer" value={customer} onChange={handleCustomerChange} className="mb-4 p-2 border rounded w-full">
                <option value="選択してください">選択してください</option>
                {customers.length > 0 && customers.map(cust => (
                    <option key={cust} value={cust}>{cust}</option>
                ))}
            </select>
            <label htmlFor="field" className="block mb-2">圃場：</label>
            {fieldOptions.length > 0 ? (
                <select id="field" value={selectedField} onChange={handleFieldChange} className="mb-4 p-2 border rounded w-full">
                    <option value="選択してください">選択してください</option>
                    {fieldOptions.map(field => (
                        <option key={field} value={field}>{field}</option>
                    ))}
                </select>
            ) : (
                <p className="mb-4">選択した顧客に対応する圃場がありません。</p>
            )}
            {dates.map((date, index) => (
                <div key={index} className="mb-4">
                    <label className="block mb-2">予定日：</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => handleDateChange(index, e.target.value)}
                        className="p-2 border rounded w-full"
                    />
                </div>
            ))}
            <button onClick={handleAddDate} className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700">予定日を追加</button>
            <label htmlFor="content" className="block mb-2">内容：</label>
            <textarea id="content" value={content} onChange={handleContentChange} className="mb-4 p-2 border rounded w-full"></textarea>
            <div className="flex space-x-4">
                <button onClick={handleCreateClick} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">作成</button>
                <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700">キャンセル</button>
            </div>
        </div>
    );
};
