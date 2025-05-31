export const makeHeatmapData = (polyline: number[][]): {lat: number, lng: number, value: number}[]=> {
  return polyline.map(([lat, lng]) => ({
    lat,
    lng,
    value: Math.floor(Math.random() * 30) + 10
  }))
}

export const makeHumidity = (polyline: number[][]): {lat: number, lng: number, value: number}[]=> {
  return polyline.map(([lat, lng]) => ({
    lat,
    lng,
    value: Math.floor(Math.random() * 100)
  }))
}
