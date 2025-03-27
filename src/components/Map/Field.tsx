import React, { useState, useEffect } from 'react';

interface Field {
  id: number;
  name: string;
  group_id?: number;
  polygon: string;
}

interface SelectedFieldProps {
  selectedField: Field | null;
  setSelectedField: React.Dispatch<React.SetStateAction<Field | null>>;
}

export const Field: React.FC<SelectedFieldProps> = ({ selectedField, setSelectedField }) => {
  const [fieldOptions, setFieldOptions] = useState<Field[]>([]);

  const fetchFieldsByGroup = (groupId: string) => {
    if (!groupId) return;
    
    const filter = JSON.stringify({ group_id: groupId });
    fetch(`https://xeqdcwoajut7yi6v6pjeucmc640azjxy.lambda-url.ap-northeast-1.on.aws/field?filter=${encodeURIComponent(filter)}`)
      .then(response => response.json())
      .then((data: any) => {
        if (data?.result?.fields && Array.isArray(data.result.fields)) {
          setFieldOptions(data.result.fields);
        } else {
          console.error('Unexpected data format:', data);
        }
      })
      .catch(error => console.error('Error fetching fields:', error));
  };

  useEffect(() => {
    fetchFieldsByGroup('24'); // 初期値としてgroup_idを24に固定
  }, []);

  const handleFieldChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFieldId = event.target.value;
    const selectedFieldObj = fieldOptions.find(field => field.id.toString() === selectedFieldId);
    if (selectedFieldObj) {
      setSelectedField(selectedFieldObj);
    }
  };

  return (
    <div className="p-4 bg-white shadow-2xl border-4 border-gray-800 rounded-lg overflow-wrap-break-word mb-2">
      <label htmlFor="field" className="block mb-2">圃場：</label>
      {fieldOptions.length > 0 ? (
        <select
          id="field"
          value={selectedField?.id.toString() || '選択してください'}
          onChange={handleFieldChange}
          className="mb-4 p-2 border rounded w-full"
        >
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
