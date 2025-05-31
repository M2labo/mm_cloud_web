import {LatLngTuple} from "leaflet";
import {makeInnerPolyline} from "./makeInnerPolyline";
import {makeHumidity, makeHeatmapData} from "./makeHeatmapData";

interface LocalField {
  id: number;
  name: string;
  group_id?: number;
  polygon: string;
}

export const makeSampleData = (selectedField: LocalField | null) => {
  if (!selectedField || !selectedField.polygon) return null
  const polygon: number[][] = JSON.parse(selectedField.polygon)

  const scatterPoints = makeSamplePoints(selectedField)
  const uPath = makeInnerPolyline(polygon)
  const temperature = makeHeatmapData(uPath)
  const humidity = makeHumidity(uPath)

  return {
    polygon,
    scatterPoints,
    uPath,
    temperature,
    humidity
  }
}

const makeSamplePoints = (field: LocalField) => {
  const polygons: number[][] = JSON.parse(field.polygon)
  const samplePoints: LatLngTuple[] = []

  for (let i = 1; i < polygons.length; i++) {
    samplePoints.push([(polygons[0][0] + polygons[i][0]) / 2, (polygons[0][1] + polygons[i][1]) / 2])
  }

  return samplePoints
}