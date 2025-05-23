import {LatLng} from "leaflet";

export const makePolygonAroundPolyline = (polyline: [number, number][], width = 10): LatLng[][] => {
  const polygons: LatLng[][] = []

  for (let i = 0; i < polyline.length - 1; i++) {
    const point1 = polyline[i];
    const point2 = polyline[i + 1];

    const bearing = calculateBearing(point1, point2);
    const offsetPoints = calculateOffsetPoints(point1, point2, width, bearing);

    polygons.push(offsetPoints)
  }

  return polygons
};

// 2点間の方位角を計算する関数
const calculateBearing = (point1: number[], point2: number[]): number => {
  const lat1 = toRad(point1[0]);
  const lon1 = toRad(point1[1]);
  const lat2 = toRad(point2[0]);
  const lon2 = toRad(point2[1]);

  const dLon = lon2 - lon1;

  const x = Math.sin(dLon) * Math.cos(lat2);
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const bearing = Math.atan2(x, y);
  return (toDeg(bearing) + 360) % 360;  // 方位角を0～360度で返す
};

const toRad = (deg: number): number => (deg * Math.PI) / 180;

const toDeg = (rad: number): number => (rad * 180) / Math.PI;

// 2点の間に一定幅のオフセットを作成する関数
const calculateOffsetPoints = (point1: number[], point2: number[], width: number, bearing: number): LatLng[] => {
  const offsetAngle = 90;  // 直角でオフセット

  // 直線ベクトルの方向を計算
  const angleLeft = (bearing + offsetAngle) % 360;
  const angleRight = (bearing - offsetAngle + 360) % 360;

  const offsetDistance = width / 2;

  const leftPoint = offsetPoint(point1, angleLeft, offsetDistance);
  const rightPoint = offsetPoint(point1, angleRight, offsetDistance);
  const leftPoint2 = offsetPoint(point2, angleLeft, offsetDistance);
  const rightPoint2 = offsetPoint(point2, angleRight, offsetDistance);

  return [leftPoint, leftPoint2, rightPoint2, rightPoint]
};

// 指定した点からオフセット方向に一定距離だけ離れた点を計算
const offsetPoint = (point: number[], angle: number, distance: number): LatLng => {
  const R = 6371000;  // 地球の半径（メートル）
  const angularDistance = distance / R;  // オフセット距離を角度に変換

  const bearing = toRad(angle);

  const lat1 = toRad(point[0]);
  const lon1 = toRad(point[1]);

  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(angularDistance) +
    Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing));
  const lon2 = lon1 + Math.atan2(Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
    Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2));

  return new LatLng(toDeg(lat2), toDeg(lon2));
};
