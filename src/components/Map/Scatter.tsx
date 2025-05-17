import React from "react";
import {Circle} from "react-leaflet";
import {LatLngTuple} from "leaflet";
import {getGradientColor} from "./getGradientColor";

interface Field {
  id: number;
  name: string;
  group_id?: number;
  polygon: string;
}

interface Props {
  selectedField: Field | null;
}

export const Scatter: React.FC<Props> = ({selectedField}) => {
  if (!selectedField || !selectedField.polygon) return null
  const samplePoints = makeSamplePoints(selectedField)

  return (
    <>
      {samplePoints.map((point, i) => (
        <Circle center={point} radius={i * 2 + 5} pathOptions={{color: getGradientColor(i / samplePoints.length)}}/>
        )
      )}
    </>
  )
}

const makeSamplePoints = (field: Field) => {
  const polygons: number[][] = JSON.parse(field.polygon)
  const samplePoints: LatLngTuple[] = []

  for (let i = 1; i < polygons.length; i++) {
    samplePoints.push([(polygons[0][0] + polygons[i][0]) / 2, (polygons[0][1] + polygons[i][1]) / 2])
  }

  return samplePoints
}