import {useUser} from "../../UserContext";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {AppConstants} from "../../AppConstants";
import {useAuthenticator} from "@aws-amplify/ui-react";

export const Profile = () => {
  const {user, fetchUserData} = useUser()
  const {signOut} = useAuthenticator()
  const [name, setName] = useState('')

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
    const confirmed = window.confirm('本当にアカウントを削除しますか？（アカウント削除後、データは復元できません。）');
    if (!confirmed) return;

    try {
      await axios.delete(`${AppConstants.apiUrl}/user`, {
        params: {
          filter: JSON.stringify({id: user?.id}),
        },
      });
      alert('アカウントが削除されました');
      signOut();
    } catch (err) {
      alert(`アカウント削除に失敗しました: ${err}`);
    }
  };

  if (!user) return <p>ユーザー情報が見つかりません</p>;

  return (
    <>
      <h1>プロフィール情報を編集してください。</h1>
      <p>メールアドレス</p>
      <p>{user.email}</p>
      <div>
        <label>名前</label><br/>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前"
        />
      </div>
      <div>
        <button onClick={saveProfile}>保存</button>
      </div>
      <div>
        <button onClick={deleteAccount}>アカウント削除</button>
      </div>
    </>
  );
}