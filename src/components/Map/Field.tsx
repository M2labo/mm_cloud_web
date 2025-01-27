import React, { useState, useEffect } from 'react';

interface Customer {
    id: number;
    name: string;
    fields: {
        id: number;
        name: string;
    }[];
}

interface Field {
    id: number;
    name: string;
    customer_id: number;
}   

// 子コンポーネントのプロップスの型定義
interface SelectedFieldProps {
    selectedField: Field | null;
    setSelectedField: React.Dispatch<React.SetStateAction<Field | null>>;
}

export const Field: React.FC<SelectedFieldProps> = ({ selectedField, setSelectedField }) => {
    const [customer, setCustomer] = useState<string>('選択してください');
    const [fieldOptions, setFieldOptions] = useState<Field[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    useEffect(() => {
        // APIからデータを取得する
        fetch('https://h6sf4fa6rn3kbutj3gicfua5si0hmzda.lambda-url.ap-northeast-1.on.aws/all_customer')
            .then(response => response.json())
            .then((data: any) => {
                if (data && data.result && Array.isArray(data.result.customers)) {
                    setCustomers(data.result.customers);
                } else {
                    console.error('Unexpected data format:', data);
                }
            })
            .catch(error => console.error('Error fetching fields:', error));
    }, []);

    useEffect(() => {
        if (selectedField) {
            setCustomer(selectedField.customer_id.toString());
            const customerObj = customers.find(cust => cust.id.toString() === selectedField.customer_id.toString());
                if (customerObj) {
                    // フィールドにcustomer_idを追加する
                    const fieldsWithCustomerId = customerObj.fields.map(field => ({
                        ...field,
                        customer_id: customerObj.id
                    }));
                    setFieldOptions(fieldsWithCustomerId);
                } else {
                    setFieldOptions([]);
                }

        }
    }, [selectedField]);

    const handleCustomerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCustomer = event.target.value;
        setCustomer(selectedCustomer);

        const customerObj = customers.find(cust => cust.id.toString() === selectedCustomer);
        if (customerObj) {
            // フィールドにcustomer_idを追加する
            const fieldsWithCustomerId = customerObj.fields.map(field => ({
                ...field,
                customer_id: customerObj.id
            }));
            setFieldOptions(fieldsWithCustomerId);
        } else {
            setFieldOptions([]);
        }
    };

    const handleFieldChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedFieldId = event.target.value;
        const selectedFieldObj = fieldOptions.find(field => field.id.toString() === selectedFieldId);
        if (selectedFieldObj) {
            setSelectedField(selectedFieldObj);
        }
    };

    return (
        <div className="p-4 bg-white shadow-2xl border-4 border-gray-800 rounded-lg overflow-wrap-break-word mb-2">
            <label htmlFor="customer" className="block mb-2">顧客：</label>
            <select id="customer" value={customer} onChange={handleCustomerChange} className="mb-4 p-2 border rounded w-full">
                <option value="選択してください">選択してください</option>
                {Array.isArray(customers) && customers.map(cust => (
                    <option key={cust.id} value={cust.id.toString()}>{cust.name}</option>
                ))}
            </select>
            <label htmlFor="field" className="block mb-2">圃場：</label>
            {fieldOptions.length > 0 ? (
                <select id="field" value={selectedField?.id.toString() || '選択してください'} onChange={handleFieldChange} className="mb-4 p-2 border rounded w-full">
                    <option value="選択してください">選択してください</option>
                    {fieldOptions.map(field => (
                        <option key={field.id} value={field.id.toString()}>{field.name}</option>
                    ))}
                </select>
            ) : (
                <p className="mb-4">選択した顧客に対応する圃場がありません。</p>
            )}
        </div>
    );
};
