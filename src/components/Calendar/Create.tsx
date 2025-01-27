import React, { useState, useEffect } from 'react';

interface Customer {
    id: number;
    name: string;
    fields: {
        id: number;
        name: string;
    }[];
}

interface CreateProps {
    selectedDate?: string;
    onChangeDetail: (detail:string,id:number) => void;
}

export const Create: React.FC<CreateProps> = ({ selectedDate, onChangeDetail }) => {
    const [customer, setCustomer] = useState<string>('選択してください');
    const [fieldOptions, setFieldOptions] = useState<{ id: number, name: string }[]>([]);
    const [selectedField, setSelectedField] = useState('選択してください');
    const [dates, setDates] = useState([selectedDate]);
    const [content, setContent] = useState('');
    const [customers, setCustomers] = useState<Customer[]>([]);

    useEffect(() => {
        // APIからデータを取得する
        fetch('https://h6sf4fa6rn3kbutj3gicfua5si0hmzda.lambda-url.ap-northeast-1.on.aws/all_customer')
            .then(response => response.json())
            .then((data: any) => {
                console.log("create"); 
                console.log(data); // レスポンスデータの形式を確認
                if (data && data.result && Array.isArray(data.result.customers)) {
                    setCustomers(data.result.customers);
                } else {
                    console.error('Unexpected data format:', data);
                }
            })
            .catch(error => console.error('Error fetching fields:', error));
    }, []);

    useEffect(() => {
        // selectedDateが変更されたときにdatesを更新
        if (selectedDate) {
            setDates([selectedDate]);
        }
    }, [selectedDate]);

    const handleCustomerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCustomer = event.target.value;
        setCustomer(selectedCustomer);

        const customerObj = customers.find(cust => cust.id.toString() === selectedCustomer);
        if (customerObj) {
            setFieldOptions(customerObj.fields);
        } else {
            setFieldOptions([]);
        }
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

    const handleDeleteDate = (index: number) => {
        const newDates = [...dates];
        newDates.splice(index, 1);
        setDates(newDates);
    };

    const handleDateChange = (index: number, value: string) => {
        const newDates = [...dates];
        newDates[index] = value;
        setDates(newDates);
    };

    const handleCreateClick = async () => {
        console.log('Create clicked');
        console.log(customer, selectedField, dates, content);
        try {
            const selectedCustomer = customers.find(cust => cust.id.toString() === customer);
            const selectedFieldObj = fieldOptions.find(field => field.name === selectedField);

            if (!selectedCustomer || !selectedFieldObj) {
                alert('顧客または圃場が正しく選択されていません。');
                return;
            }

            const url = new URL('https://h6sf4fa6rn3kbutj3gicfua5si0hmzda.lambda-url.ap-northeast-1.on.aws/report');
            console.log('Selected customer:', selectedCustomer.id);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: {
                        customer_id: selectedCustomer.id,
                        field_id: selectedFieldObj.id,
                        plans: dates,
                        date: null,
                        report: content
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Success:', data);
            console.log('Plan created:', data.result['id']);
            onChangeDetail("plan", data.result['id']);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="p-4 bg-white shadow-md rounded-lg overflow-wrap-break-word">
            <h1 className="text-2xl font-bold mb-4">作業予定-作成</h1>
            <label htmlFor="customer" className="block mb-2">顧客：</label>
            <select id="customer" value={customer} onChange={handleCustomerChange} className="mb-4 p-2 border rounded w-full">
                <option value="選択してください">選択してください</option>
                {Array.isArray(customers) && customers.map(cust => (
                    <option key={cust.id} value={cust.id.toString()}>{cust.name}</option>
                ))}
            </select>
            <label htmlFor="field" className="block mb-2">圃場：</label>
            {fieldOptions.length > 0 ? (
                <select id="field" value={selectedField} onChange={handleFieldChange} className="mb-4 p-2 border rounded w-full">
                    <option value="選択してください">選択してください</option>
                    {fieldOptions.map(field => (
                        <option key={field.id} value={field.name}>{field.name}</option>
                    ))}
                </select>
            ) : (
                <p className="mb-4">選択した顧客に対応する圃場がありません。</p>
            )}
            <label className="block mb-2 flex-grow">予定日：</label>
            {dates.map((date, index) => (     
                <div key={index} className="mb-4 ">
                    
                    <div className="flex items-center">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => handleDateChange(index, e.target.value)}
                            className="p-2 border rounded flex-grow"
                        />
                        <button type="button" onClick={() => handleDeleteDate(index)} className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">☓</button>
                    </div>
                </div>
            ))}
            <button type="button" onClick={handleAddDate} className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700">予定日を追加</button>
            <label htmlFor="content" className="block mb-2">内容：</label>
            <textarea id="content" value={content} onChange={handleContentChange} className="mb-4 p-2 border rounded w-full"></textarea>
            <div className="flex space-x-4">
                <button type="button" onClick={handleCreateClick} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">作成</button>
                <button type="button" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700">キャンセル</button>
            </div>
        </div>
    );
};
