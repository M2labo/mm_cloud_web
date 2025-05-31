const R = 6371000; // 地球半径[m]

function toRad(d: number) { return (d * Math.PI) / 180 }
function toDeg(r: number) { return (r * 180) / Math.PI }

// 2点間の初期方位（bearing）を計算
function bearing(lat1: number, lon1: number, lat2: number, lon2: number) {
  const phi1 = toRad(lat1), phi2 = toRad(lat2)
  const delta = toRad(lon2 - lon1)
  const y = Math.sin(delta) * Math.cos(phi2)
  const x = Math.cos(phi1)*Math.sin(phi2) -
    Math.sin(phi1)*Math.cos(phi2)*Math.cos(delta)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

// 指定距離と方位で目的地の緯度経度を返す（球面上の公式）
function destinationPoint(
  lat1: number, lon1: number,
  distance: number, brngDeg: number
) {
  const delta = distance / R
  const theta = toRad(brngDeg)
  const phi1 = toRad(lat1)
  const lambda1 = toRad(lon1)

  const phi2 = Math.asin(
    Math.sin(phi1)*Math.cos(delta) +
    Math.cos(phi1)*Math.sin(delta)*Math.cos(theta)
  )
  const lambda2 = lambda1 + Math.atan2(
    Math.sin(theta)*Math.sin(delta)*Math.cos(phi1),
    Math.cos(delta) - Math.sin(phi1)*Math.sin(phi2)
  )

  return [ toDeg(phi2), ((toDeg(lambda2)+540)%360) - 180 ] as [number, number]
}

export function makeInnerPolyline(
  polygon: number[][],
  offset = 30
): [number, number][] {
  const n = polygon.length
  const inner: [number, number][] = []

  for (let i = 0; i < n; i++) {
    const prev = polygon[(i - 1 + n) % n]
    const curr = polygon[i]
    const next = polygon[(i + 1) % n]

    // 進行方向の bearing
    const b1 = bearing(prev[0], prev[1], curr[0], curr[1])
    const b2 = bearing(curr[0], curr[1], next[0], next[1])

    // 左法線方向は bearing - 90°
    const n1 = (b1 + 270) % 360
    const n2 = (b2 + 270) % 360

    // 2 つの単位ベクトルを合成して正規化
    const x = Math.cos(toRad(n1)) + Math.cos(toRad(n2))
    const y = Math.sin(toRad(n1)) + Math.sin(toRad(n2))
    const α = Math.atan2(y, x) // 二等分線の角度

    // オフセットした地点を計算
    inner.push(destinationPoint(curr[0], curr[1], offset, toDeg(α)))
  }

  const detailedInner: [number, number][] = []

  for (let i = 0; i < inner.length - 1; i++) {
    const [prevLat, prevLng] = inner[i]
    const [nextLat, nextLng] = inner[i + 1]
    for (let j = 0; j < 3; j++) {
      const t = j / 3;
      detailedInner.push([
        prevLat + (nextLat - prevLat) * t,
        prevLng + (nextLng - prevLng) * t
      ]);
    }
  }
  detailedInner.push(inner[inner.length - 1])

  return detailedInner
}