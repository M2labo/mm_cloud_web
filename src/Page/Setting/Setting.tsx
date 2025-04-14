import React from "react";

export const Setting = () => {
  return (
    <>
      <ul>
        <li><a href="#setting/profile">プロフィールの設定</a></li>
        <li><a href="#setting/group">組織の設定</a></li>
        <li><a href="#setting/mover">Moverの設定</a></li>
        <li><a href="#setting/field">ほ場の設定</a></li>
        <button onClick={() => alert('アプリバージョン: 1.0.0')}>バージョン情報</button>
        <li><a href="#setting/terms_of_service">利用規約</a></li>
        <li><a href="#setting/privacy_policy">プライバシーポリシー</a></li>
      </ul>
    </>
  )
}