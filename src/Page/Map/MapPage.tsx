import { Map } from '../../components/Map/Map';
import { Field } from '../../components/Map/Field';
import { Header } from '../../components/Header/Header';
import { FieldLog } from '../../components/Map/FieldLog';
import React, { useState } from 'react';

interface Field {
    id: number;
    name: string;
    group_id: number;
}

export function MapPage() {
    const [selectedField, setSelectedField] = useState<Field | null>(null);

    return (
        <div className="relative h-screen">
            <Header />
            <div className="relative">
                <Map zoom={18} size="95vh" center={[36.252261, 137.866767]} selectedField={selectedField} setSelectedField={setSelectedField} />
                <div className="absolute top-0 right-0 p-4" style={{ zIndex: 1000 }}>
                    <Field selectedField={selectedField} setSelectedField={setSelectedField} />
                
                    <FieldLog fieldId={selectedField ? selectedField.id : null} />
                </div>
            </div>
        </div>
    );
}
