import {useUser} from "../../UserContext";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {AppConstants} from "../../AppConstants";
import {useAuthenticator} from "@aws-amplify/ui-react";

export const Profile = () => {
  const {user, fetchUserData} = useUser()
  const {signOut} = useAuthenticator()
  const [name, setName] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name)
  }, [user])
  const saveProfile = async () => {
    try {
      await axios.put(`${AppConstants.apiUrl}/user`, {
        data: {id: user?.id, name},
      });
      await fetchUserData();
      alert('プロフィールが保存されました');
    } catch (err) {
      alert(`保存に失敗しました: ${err}`);
    }
  };

  const deleteAccount = async () => {
    try {
      await axios.delete(`${AppConstants.apiUrl}/user`, {
        params: {
          filter: JSON.stringify({id: user?.id}),
        },
      });
      signOut();
      alert('アカウントが削除されました');
    } catch (err) {
      alert(`アカウント削除に失敗しました: ${err}`);
    }
  };

  if (!user) return <p>ユーザー情報が見つかりません</p>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-base font-bold">プロフィール情報を編集してください。</h1>
      <p>メールアドレス</p>
      <p>{user.email}</p>
      <div>
        <label className="block text-sm mb-1" htmlFor="name-input">名前</label>
        <input
          id={'name-input'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前"
          className="w-full border border-gray-300 rounded p-2"
        />
      </div>
      <div>
        <button
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          onClick={saveProfile}
        >
          保存
        </button>
      </div>
      <div>
        <button
          className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          アカウント削除
        </button>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-80">
            <h2 className="font-bold mb-2">アカウント削除</h2>
            <p>本当にアカウントを削除しますか？</p>
            <p>※アカウント削除後、データは復元できません。</p>
            <div className="flex items-center mb-4">
              <input
                id="confirm"
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="confirm" className="text-sm">
                データは復元できないことを理解しました
              </label>
            </div>
            <div className="text-right space-x-2">
              <button className="px-3 py-1 bg-gray-300 rounded" onClick={() => {
                setIsDeleteModalOpen(false)
                setIsChecked(false)
              }}>
                キャンセル
              </button>
              <button
                disabled={!isChecked}
                className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50"
                onClick={() => {
                  deleteAccount()
                  setIsDeleteModalOpen(false)
                  setIsChecked(false)
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