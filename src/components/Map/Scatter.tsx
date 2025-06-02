import React from "react";
import {Circle} from "react-leaflet";
import {LatLngTuple} from "leaflet";
import {getGradientColor} from "./getGradientColor";

interface Props {
  points?: LatLngTuple[];
}

export const Scatter = ({points}: Props) => {
  return (
    <>
      {points?.map((point, i) => (
        <Circle key={i} center={point} radius={i * 2 + 5} pathOptions={{color: getGradientColor(i / points.length)}}/>
        )
      )}
    </>
  )
}

