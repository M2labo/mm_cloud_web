import { Map } from '../../components/Map/Map';
import { Field } from '../../components/Map/Field';
import { FieldLog } from '../../components/Map/FieldLog';
import React, { useState } from 'react';
import {TileLayer} from "react-leaflet";

interface LocalField {
    id: number;
    name: string;
    group_id?: number;
    polygon: string;
  }

export function MapPage() {
    const [selectedField, setSelectedField] = useState<LocalField | null>(null);

    return (
        <div className="relative h-screen">
            
            <div className="relative">
                <Map zoom={18} size="95vh" center={[36.252261, 137.866767]} selectedField={selectedField as any} setSelectedField={setSelectedField as any}>
                    <TileLayer
                      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                </Map>
                <div className="absolute top-0 right-0 p-4" style={{ zIndex: 1000 }}>
                    <Field selectedField={selectedField} setSelectedField={setSelectedField} />
                
                    <FieldLog fieldId={selectedField ? selectedField.id : null} />
                </div>
            </div>
        </div>
    );
}
