import React, { useState, useEffect } from 'react';

interface Group {
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
    group_id: number;
}   

// 子コンポーネントのプロップスの型定義
interface SelectedFieldProps {
    selectedField: Field | null;
    setSelectedField: React.Dispatch<React.SetStateAction<Field | null>>;
}

export const Field: React.FC<SelectedFieldProps> = ({ selectedField, setSelectedField }) => {
    const [group, setGroup] = useState<string>('選択してください');
    const [fieldOptions, setFieldOptions] = useState<Field[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);

    useEffect(() => {
        // APIからデータを取得する
        fetch('https://xeqdcwoajut7yi6v6pjeucmc640azjxy.lambda-url.ap-northeast-1.on.aws/all_group')
            .then(response => response.json())
            .then((data: any) => {
                if (data && data.result && Array.isArray(data.result.groups)) {
                    setGroups(data.result.groups);
                } else {
                    console.error('Unexpected data format:', data);
                }
            })
            .catch(error => console.error('Error fetching fields:', error));
    }, []);

    useEffect(() => {
        if (selectedField) {
            setGroup(selectedField.group_id.toString());
            const groupObj = groups.find(group => group.id.toString() === selectedField.group_id.toString());
                if (groupObj) {
                    // フィールドにgroup_idを追加する
                    const fieldsWithGroupId = groupObj.fields.map(field => ({
                        ...field,
                        group_id: groupObj.id
                    }));
                    setFieldOptions(fieldsWithGroupId);
                } else {
                    setFieldOptions([]);
                }

        }
    }, [selectedField]);

    const handleGroupChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedGroup = event.target.value;
        setGroup(selectedGroup);

        const groupObj = groups.find(group => group.id.toString() === selectedGroup);
        if (groupObj) {
            // フィールドにgroup_idを追加する
            const fieldsWithGroupId = groupObj.fields.map(field => ({
                ...field,
                group_id: groupObj.id
            }));
            setFieldOptions(fieldsWithGroupId);
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
            <label htmlFor="group" className="block mb-2">顧客：</label>
            <select id="group" value={group} onChange={handleGroupChange} className="mb-4 p-2 border rounded w-full">
                <option value="選択してください">選択してください</option>
                {Array.isArray(groups) && groups.map(group => (
                    <option key={group.id} value={group.id.toString()}>{group.name}</option>
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
