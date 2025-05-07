import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import {MdEdit, MdDelete} from 'react-icons/md';
import {useUser} from "../../UserContext";
import {AppConstants} from "../../AppConstants";
import {Marker, Polygon, Popup, TileLayer, useMapEvent} from "react-leaflet";
import {Map} from '../../components/Map/Map'
import {LatLngTuple, LeafletMouseEvent} from "leaflet";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Field {
  id: number;
  name: string;
  group_id: number;
}

export const Field = () => {
  const {user, fetchUserData} = useUser();
  const [polygonData, setPolygonData] = useState<{
    id: number,
    name: string,
    points: { lat: number, lng: number }[]
  }[]>([]);
  const [currentPolygon, setCurrentPolygon] = useState<LatLngTuple[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [fieldName, setFieldName] = useState('')
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number>();
  const [editName, setEditName] = useState('');
  const [deleteIndex, setDeleteIndex] = useState<number>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    if (user?.fields) {
      const data = user.fields.map(field => ({
        id: field.id,
        name: field.name,
        points: JSON.parse(field.polygon).map((coord: number[]) => ({lat: coord[0], lng: coord[1]})),
      }));
      data.sort((a, b) => a.id - b.id);
      setPolygonData(data);
    }
  }, [user]);

  useEffect(() => {
    if(selectedField) {
      setSelectedField(null)
    }
  }, [selectedField]);

  const submitPolygon = async () => {
    try {
      const body = {
        data: {
          group_id: user?.groupId,
          name: fieldName,
          polygon: JSON.stringify(currentPolygon),
        },
      };
      await axios.post(`${AppConstants.apiUrl}/field`, body);
      await fetchUserData()
      alert('ポリゴンが正常に作成されました');
      setCurrentPolygon([]);
      setFieldName('')
    } catch {
      alert('ポリゴンの作成に失敗しました');
    }
  };

  const updateFieldName = async (index: number, newName: string) => {
    try {
      const field = polygonData[index];
      const body = {
        data: {
          id: field.id,
          group_id: user?.groupId,
          name: newName,
          polygon: JSON.stringify(field.points.map(point => [point.lat, point.lng])),
        },
      };
      await axios.put(`${AppConstants.apiUrl}/field`, body);
      setPolygonData(prev =>
        prev.map((data, i) => (i === index ? {...data, name: newName} : data))
      );
      alert('ほ場名が変更されました');
      fetchUserData();
    } catch {
      alert('ほ場名の変更に失敗しました');
    }
  };

  const deleteField = async (index: number) => {
    try {
      const id = polygonData[index].id;
      await axios.delete(`${AppConstants.apiUrl}/field`, {params: {id}});
      setPolygonData(prev => prev.filter((_, i) => i !== index));
      alert('ほ場が削除されました');
      fetchUserData()
    } catch {
      alert('ほ場の削除に失敗しました');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1">
        <Map zoom={6} size="50vh" center={[36.252261, 137.866767]} selectedField={selectedField}
             setSelectedField={setSelectedField}>
          <MapClickHandler onClick={e => {
            if (!isCreating) return
            const {lat, lng} = e.latlng
            setCurrentPolygon(prev => [...prev, [lat, lng]])
          }}/>
          <TileLayer
            url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            maxZoom={20}
            attribution="&copy; Google"
          />
          <Polygon positions={currentPolygon} pathOptions={{color: 'red'}}/>
          {currentPolygon.map((position, index) => (
            <Marker key={index} position={position} draggable={true} eventHandlers={{
              drag: (e) => {
                const {lat, lng} = e.target.getLatLng()
                setCurrentPolygon((prev) => prev.map((point, i) => (i === index ? [lat, lng] : point)))
              }
            }}></Marker>
          ))}
        </Map>
      </div>
      <div className="flex flex-col flex-1 p-4 bg-gray-100 overflow-y-auto">
        {isCreating ? (
          <div className="flex justify-center space-x-4 mb-4">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              区画を確定
            </button>
            <button
              onClick={() => {
                setCurrentPolygon([]);
                alert('作成中のポリゴンがクリアされました');
              }}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              クリア
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setCurrentPolygon([])
              setIsCreating(true)
            }
            }
            className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          >
            新規ほ場作成
          </button>
        )}

        <h2 className="text-lg font-bold mb-2">ほ場リスト</h2>
        <ul>
          {polygonData.map((polygon, index) => (
            <li
              key={polygon.id}
              className="flex justify-between items-center py-2 border-b"
            >
              <span
                onClick={() => {
                  setSelectedField({id: polygon.id, name: polygon.name, group_id: user?.groupId!})
                }}
                className="cursor-pointer"
              >
                {polygon.name}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditIndex(index)
                    setIsEditModalOpen(true)
                  }}
                >
                  <MdEdit/>
                </button>
                <button
                  onClick={() => {
                    setDeleteIndex(index)
                    setIsDeleteModalOpen(true)
                  }}
                >
                  <MdDelete className="text-red-500"/>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {isCreateModalOpen && (
        <div className="inset-0 bg-black bg-opacity-50 flex items-center justify-center absolute z-[1000]">
          <div className="bg-white p-6 rounded w-80">
            <h2 className="font-bold mb-2">ポリゴンの名前を入力</h2>
            <input
              className="w-full mb-2 p-1 border rounded"
              placeholder="ほ場名"
              value={fieldName}
              onChange={e => setFieldName(e.target.value)}
            />
            <div className="text-right space-x-2">
              <button className="px-3 py-1 bg-gray-300 rounded" onClick={() => {
                setIsCreateModalOpen(false)
              }}>
                キャンセル
              </button>
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded"
                onClick={() => {
                  submitPolygon()
                  setIsCreateModalOpen(false);
                  setIsCreating(false);
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editIndex !== undefined && (
        <div className="inset-0 bg-black bg-opacity-50 flex items-center justify-center  absolute z-[1000]">
          <div className="bg-white p-6 rounded w-80">
            <h2 className="font-bold mb-2">ほ場名を変更</h2>
            <input
              className="w-full mb-2 p-1 border rounded"
              placeholder="新しいほ場名"
              value={editName}
              onChange={e => setEditName(e.target.value)}
            />
            <div className="text-right space-x-2">
              <button className="px-3 py-1 bg-gray-300 rounded" onClick={() => {
                setIsEditModalOpen(false)
              }}>
                キャンセル
              </button>
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded"
                onClick={() => {
                  updateFieldName(editIndex, editName);
                  setIsEditModalOpen(false);
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && deleteIndex !== undefined && (
        <div className="inset-0 bg-black bg-opacity-50 flex items-center justify-center  absolute z-[1000]">
          <div className="bg-white p-6 rounded w-80">
            <h2 className="font-bold mb-2">削除確認</h2>
            <p>このほ場を削除しますか？</p>
            <div className="text-right space-x-2">
              <button className="px-3 py-1 bg-gray-300 rounded" onClick={() => {
                setIsDeleteModalOpen(false)
              }}>
                キャンセル
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded"
                onClick={() => {
                  deleteField(deleteIndex)
                  setIsDeleteModalOpen(false)
                }}
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MapClickHandler({onClick}: { onClick: (e: LeafletMouseEvent) => void }) {
  useMapEvent('click', onClick)
  return null
}