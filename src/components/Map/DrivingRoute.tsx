import React from 'react';
import {Polygon, Polyline} from 'react-leaflet';
import {makeInnerPolyline} from "./makeInnerPolyline";
import {makePolygonAroundPolyline} from "./makePolygonAroundPolyline";
import {makeTemperature} from "./makeTemperature";


interface Field {
  id: number;
  name: string;
  group_id?: number;
  polygon: string;
}

interface Props {
  selectedField: Field | null;
}


export const DrivingRoute = ({selectedField}: Props) => {
  if (!selectedField || !selectedField.polygon) return null
  const polygon: number[][] = JSON.parse(selectedField?.polygon)

  const uPath = makeInnerPolyline(polygon)
  const polygonsAroundPolyline = makePolygonAroundPolyline(uPath)

  return (
    <>
      <Polyline positions={uPath} pathOptions={{color: 'black', weight: 3}}/>
      {polygonsAroundPolyline.map((polygonAroundPolyline, i) => (
        <Polygon key={i} positions={polygonAroundPolyline}
                 pathOptions={{
                   color: 'transparent',
                   fillColor: '#6DBF9D',
                   fillOpacity: 0.5,
                 }}/>
      ))}
    </>
  );
};

