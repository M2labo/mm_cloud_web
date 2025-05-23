import {Map} from '../../components/Map/Map';
import {Field} from '../../components/Map/Field';
import {FieldLog} from '../../components/Map/FieldLog';
import React, {useState} from 'react';
import {TileLayer} from "react-leaflet";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import jaLocale from "@fullcalendar/core/locales/ja";
import FullCalendar from "@fullcalendar/react";
import {Scatter} from "../../components/Map/Scatter";
import {GradientBar} from "../../components/Map/GradientBar";
import {DrivingRoute} from "../../components/Map/DrivingRoute";

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
        <div className="absolute top-0 left-0 w-[30%] h-[60%] z-[2000] bg-white opacity-90">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            fixedWeekCount={false}
            initialView="dayGridMonth"
            height="100%"
            contentHeight="100%"
            aspectRatio={1}
            locales={[jaLocale]}
            locale='ja'
            headerToolbar={{
              left: 'prev,next',
              center: 'title',
              right: 'today',
            }}
          />
        </div>
        <Map zoom={18} size="95vh" center={[36.252261, 137.866767]} selectedField={selectedField as any}
             setSelectedField={setSelectedField as any}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Scatter selectedField={selectedField}/>
          <DrivingRoute selectedField={selectedField} />
        </Map>
        <div className="absolute top-0 right-0 p-4" style={{zIndex: 1000}}>
          <Field selectedField={selectedField} setSelectedField={setSelectedField}/>
          {/*<FieldLog fieldId={selectedField ? selectedField.id : null} />*/}
        </div>
        <div className="absolute top-1/4 right-10 z-[2000]">
          <GradientBar/>
        </div>
      </div>
    </div>
  );
}
