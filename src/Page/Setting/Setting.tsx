import React from "react";
import {useUser} from "../../UserContext";

export const Setting = () => {
  const {user} = useUser()

  return (
    <>
      <ul>
        <li className="flex items-center justify-center py-2"><a href="#setting/profile">プロフィールの設定</a></li>
        {user?.admin && <>
          <li className="flex items-center justify-center py-2"><a href="#setting/group">組織の設定</a></li>
          <li className="flex items-center justify-center py-2"><a href="#setting/mover">Moverの設定</a></li>
          <li className="flex items-center justify-center py-2"><a href="#setting/field">ほ場の設定</a></li>
        </>}
        <li className="flex items-center justify-center py-2">
          <button onClick={() => alert('アプリバージョン: 1.0.0')}>バージョン情報</button>
        </li>
        <li className="flex items-center justify-center py-2"><a href="#setting/terms_of_service">利用規約</a></li>
        <li className="flex items-center justify-center py-2"><a href="#setting/privacy_policy">プライバシーポリシー</a>
        </li>
      </ul>
    </>
  )
}