import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import {useUser} from "../../UserContext";
import {AppConstants} from "../../AppConstants";
import {User} from "../../models";

export const Group = () => {
  const {user, fetchUserData} = useUser();
  const [orgName, setOrgName] = useState('');
  const [members, setMembers] = useState<{ id: string, displayName: string }[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchOrganizationDetails();
      fetchMembers();
    }
  }, [user]);

  const fetchOrganizationDetails = async () => {
    try {
      const response = await axios.get(`${AppConstants.apiUrl}/group`, {
        params: {
          filter: JSON.stringify({id: user?.groupId}),
        },
      });
      const {result} = response.data;
      const body = JSON.parse(result.body);
      setOrgName(body.name || '未設定');
    } catch (e) {
      alert('組織データの取得に失敗しました: ');
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${AppConstants.apiUrl}/user`, {
        params: {
          filter: JSON.stringify({id: user?.groupId}),
        },
      });
      const {result} = response.data;
      const body = JSON.parse(result.body);
      const userList = body.users.map((user: User) => {
          const displayName = user.name ? user.name : user.email
          return {
            id: user.id,
            displayName
          }
        }
      );
      setMembers(userList);
    } catch (e) {
      console.error('メンバーリスト取得中にエラー: ', e);
      alert('メンバーリストの取得に失敗しました: ');
    }
  };

  const saveOrganizationName = async () => {
    const body = {
      data: {
        id: user?.groupId,
        name: orgName,
      },
    };
    try {
      const res = await axios.put(`${AppConstants.apiUrl}/group`, body);
      if (res.status === 200) {
        alert('組織の内容が変更されました');
        fetchUserData()
      } else {
        alert('更新に失敗しました');
      }
    } catch (e) {
      alert('更新に失敗しました');
    }
  };

  const inviteMember = async () => {
    const email = inviteEmail.trim()
    if (email !== '') {
      try {
        await axios.post(
          `${AppConstants.apiUrl}/user`,
          {
            data: {
              email: email,
              group_id: user!.groupId,
            },
          },
        );
        fetchUserData()
        alert(`${email} が招待されました`);
      } catch (e) {
        alert('招待に失敗しました: ');
      }
      setShowInviteDialog(false);
    }
  };

  const deleteMember = async (index: number) => {
    const member = members[index];
    try {
      await axios.delete(`${AppConstants.apiUrl}/user`, {
        params: {
          filter: JSON.stringify({id: member.id}),
        },
      });
      alert(`${member.displayName} を削除しました`);
    } catch (err) {
      alert(`アカウント削除に失敗しました: ${err}`);
    }
    fetchUserData()
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold mb-4">組織情報を編集してください</h1>
      <div>
        <label htmlFor="group-input">組織名</label>
        <input
          id={'group-input'}
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="組織名"
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <button onClick={saveOrganizationName}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">保存
        </button>
      </div>

      <div>
        <h1 className="text-xl font-bold mb-2">メンバー一覧</h1>
        <ul className="space-y-2 mb-4">
          {members.map((member, index) => (
            <li key={index} className="flex items-center gap-3">
              <p>{member.displayName}</p>
              <button className="text-red-500 hover:text-red-700"
                      onClick={() => {
                        setDeleteIndex(index)
                        setIsDeleteModalOpen(true)
                      }}>削除
              </button>
            </li>
          ))}
        </ul>
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => {
                  setInviteEmail('');
                  setShowInviteDialog(true);
                }}>
          新規メンバーを招待
        </button>
      </div>

      {isDeleteModalOpen && deleteIndex !== undefined && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-80">
            <h2 className="font-bold mb-2">削除確認</h2>
            <p>このメンバーを削除しますか？</p>
            <div className="text-right space-x-2">
              <button className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400" onClick={() => {
                setIsDeleteModalOpen(false)
              }}>
                キャンセル
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => {
                  deleteMember(deleteIndex)
                  setIsDeleteModalOpen(false)
                }}
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}

      {showInviteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-80">
            <h2 className="font-bold mb-2">新規メンバーを招待</h2>
              <input
                type="text"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="メールアドレス"
                className="w-full p-2 border border-gray-300 rounded mb-4"
              />
            <div className="text-right space-x-2">
              <button className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400" onClick={() => {
                setInviteEmail('');
                setShowInviteDialog(false);
              }}>
                キャンセル
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => {
                  inviteMember()
                }}
              >
                招待
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};