import {useUser} from "../../UserContext";
import {useEffect, useState} from "react";
import axios from "axios";
import {AppConstants} from "../../AppConstants";

export const Mover = () => {
  const {user, fetchUserData} = useUser();
  const [movers, setMovers] = useState<{ id: number, name: string, macAddress?: string, autoDriveName?: string }[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number>();
  const [editName, setEditName] = useState('');
  const [editAutoDrive, setEditAutoDrive] = useState('');
  const [deleteIndex, setDeleteIndex] = useState<number>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    if (user) {
      const data = user.movers.map(mover => ({
        id: mover.id,
        name: mover.name,
        macAddress: mover.macAddress,
        autoDriveName: mover.topic,
      }));
      data.sort((a, b) => a.id - b.id);
      setMovers(data);
    }
  }, [user]);

  const updateMover = async (index: number, newName: string, newAutoDrive: string) => {
    const groupId = user?.groupId;
    const body = {
      data: {
        id: movers[index].id,
        group_id: groupId,
        name: newName,
        auto_drive_name: newAutoDrive,
      },
    };
    try {
      const res = await axios.put(`${AppConstants.apiUrl}/mover`, body);
      if (res.status === 200) {
        setMovers(prev => {
          const updatedMovers = [...prev];
          updatedMovers[index] = {...updatedMovers[index], name: newName, autoDriveName: newAutoDrive};
          return updatedMovers;
        });
        alert('Moverの内容が変更されました');
        fetchUserData()
      } else {
        alert('更新に失敗しました');
      }
    } catch (e) {
      alert('更新に失敗しました');
    }
  };

  const deleteMover = async (index: number) => {
    const id = movers[index].id;
    try {
      const res = await axios.delete(`${AppConstants.apiUrl}/mover`, {params: {id}});
      if (res.status === 200) {
        setMovers(prev => prev.filter((_, i) => i !== index));
        alert('moverが削除されました');
        fetchUserData()
      } else {
        alert('moverの削除に失敗しました');
      }
    } catch (e) {
      alert('moverの削除に失敗しました');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Mover設定</h1>
      <div className="space-y-4">
        {movers.map((mover, idx) => (
          <div key={mover.id} className="border rounded p-4 shadow">
            <h2 className="font-semibold">{mover.name}</h2>
            <p>Basic: {mover.macAddress}</p>
            <p>AutoDrive: {mover.autoDriveName || '未設定'}</p>
            <div className="mt-2 space-x-2">
              <button
                className="px-2 py-1 bg-green-500 text-white rounded"
                onClick={() => {
                  setEditIndex(idx);
                  setEditName(mover.name);
                  setEditAutoDrive(mover.autoDriveName || '');
                  setIsEditModalOpen(true);
                }}
              >
                編集
              </button>
              <button className="px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() => {
                        setDeleteIndex(idx)
                        setIsDeleteModalOpen(true)
                      }}>
                削除
              </button>
            </div>
          </div>
        ))}
      </div>

      {isEditModalOpen && editIndex !== undefined && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-80">
            <h2 className="font-bold mb-2">Moverの編集</h2>
            <input
              className="w-full mb-2 p-1 border rounded"
              placeholder="名前"
              value={editName}
              onChange={e => setEditName(e.target.value)}
            />
            <input
              className="w-full mb-4 p-1 border rounded"
              placeholder="AutoDrive"
              value={editAutoDrive}
              onChange={e => setEditAutoDrive(e.target.value)}
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
                  updateMover(editIndex, editName, editAutoDrive);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-80">
            <h2 className="font-bold mb-2">削除確認</h2>
            <p>このmoverを削除しますか？</p>
            <div className="text-right space-x-2">
              <button className="px-3 py-1 bg-gray-300 rounded" onClick={() => {
                setIsDeleteModalOpen(false)
              }}>
                キャンセル
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded"
                onClick={() => {
                  deleteMover(deleteIndex)
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
};