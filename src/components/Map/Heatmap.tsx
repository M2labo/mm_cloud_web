import {useMap} from 'react-leaflet';
import L from 'leaflet';
import {useEffect} from 'react';
import {getGradientColor, hexToRgb} from "./getGradientColor";

type Point = { lat: number; lng: number; value: number };

interface Props {
  points: Point[];
  polygon: number[][]
  range: { min: number; max: number };
}

export function Heatmap({points, polygon, range}: Props) {
  const map = useMap();

  useEffect(() => {
    // タイルごとに canvas を描画するクラスを定義
    const CanvasLayer = (L.GridLayer as any).extend({
      createTile(coords: L.Coords, done: L.DoneCallback) {
        const canvas: HTMLCanvasElement = L.DomUtil.create('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d')!;

        // このタイルの緯度経度範囲を取得
        const tileBounds = this._tileCoordsToBounds(coords);
        const nw = tileBounds.getNorthWest();
        const se = tileBounds.getSouthEast();

        // 1px あたりの緯度経度差
        const latStep = (se.lat - nw.lat) / 256;
        const lngStep = (se.lng - nw.lng) / 256;

        // ポリゴン内判定用
        const polyPoints = polygon.map(([lat, lng]) => ({x: lng, y: lat}));

        function pointInPoly(lat: number, lng: number) {
          // シンプルな射影で判定
          let inside = false;
          for (let i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
            const xi = polyPoints[i].x, yi = polyPoints[i].y;
            const xj = polyPoints[j].x, yj = polyPoints[j].y;
            const intersect = ((yi > lat) !== (yj > lat))
              && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
          }
          return inside;
        }

        // 各ピクセルを走査
        const img = ctx.createImageData(256, 256);
        for (let px = 0; px < 256; px++) {
          for (let py = 0; py < 256; py++) {
            const lat = nw.lat + latStep * py;
            const lng = nw.lng + lngStep * px;
            if (!pointInPoly(lat, lng)) continue;

            const value = interpolateIDW(points, {lat, lng});
            // 正規化
            const norm = (value - range.min) / (range.max - range.min);
            const hex = getGradientColor(norm);
            const [r, g, b] = hexToRgb(hex);
            const idx = 4 * (py * 256 + px);
            img.data[idx] = r;
            img.data[idx + 1] = g;
            img.data[idx + 2] = b;
            img.data[idx + 3] = 180;
          }
        }
        ctx.putImageData(img, 0, 0);

        setTimeout(() => done(undefined, canvas), 0);
        return canvas;
      }
    });

    const layer = new CanvasLayer();
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, points, polygon, range]);

  return null;
}

// 緯度経度間の距離（m）を計算
function haversineDistance(a: { lat: number, lng: number }, b: { lat: number, lng: number }) {
  const R = 6371000;
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const phi1 = toRad(a.lat), phi2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// 逆距離加重補間
function interpolateIDW(points: Point[], query: { lat: number, lng: number }, power = 2): number {
  let num = 0, den = 0;
  for (const p of points) {
    const d = haversineDistance(p, query) || 1;  // ゼロ割防止
    const w = 1 / d ** power;
    num += p.value * w;
    den += w;
  }
  return num / den;
}

