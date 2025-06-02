import React from 'react';
import {Polygon, Polyline} from 'react-leaflet';
import {makePolygonAroundPolyline} from "./makePolygonAroundPolyline";


interface Props {
  uPath?: [number, number][];
}


export const DrivingRoute = ({uPath}: Props) => {
  if(!uPath) return null

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

