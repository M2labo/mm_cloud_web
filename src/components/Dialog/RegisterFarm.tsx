import React, {useState} from "react";
import {AuthUser} from "@aws-amplify/auth";
import {AppConstants} from "../../AppConstants";
import axios from "axios";

interface Props {
  fetchUserData: () => Promise<void>,
  cognitoUser?: AuthUser,
  setIsUnregistered: (arg: boolean) => void
}

export const RegisterFarm = ({fetchUserData, cognitoUser, setIsUnregistered}: Props) => {
  const [groupName, setGroupName] = useState('')

  const createGroup = async () => {
    try {
      const body = {
        data: {
          user_id: cognitoUser?.userId,
          email: cognitoUser?.signInDetails?.loginId,
          group_name: groupName,
        },
      };
      await axios.post(`${AppConstants.apiUrl}/group`, body);
      fetchUserData()
      alert('農園が登録できました');
      setIsUnregistered(false)
    } catch (error: any) {
      alert('農園の登録に失敗しました');
    }
  }

  return (
      <div className="inset-0 bg-black bg-opacity-50 flex items-center justify-center  absolute z-[1000]">
        <div className="bg-white p-6 rounded w-80">
          <h2 className="font-bold mb-2">農園を登録</h2>
          <p>農園の名前を入力してください。</p>
          <input
            className="w-full mb-2 p-1 border rounded"
            placeholder="農園名"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
          />
          <div className="text-right space-x-2">
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded"
              onClick={() => {
                createGroup()
              }}
            >
              登録する
            </button>
          </div>
        </div>
      </div>
  )
}