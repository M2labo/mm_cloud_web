// UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Field, Mover } from './models';

interface UserContextType {
  user: User | null;
  fetchUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);
export { UserContext };

interface UserProviderProps {
  children: React.ReactNode;
  cognitoUser: any; // 型が分かっていればここを適切に設定
}

export const UserProvider: React.FC<UserProviderProps> = ({ children, cognitoUser }): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);

  const fetchUserData = async () => {
    try {
      const userId = cognitoUser?.username;
      if (!userId) {
        console.error("Cognito user ID not found.");
        return;
      }

      // filter パラメータをオブジェクトから文字列に変換して、URLエンコードする
      const filterParam = encodeURIComponent(JSON.stringify({ id: userId }));

      const url = `https://xeqdcwoajut7yi6v6pjeucmc640azjxy.lambda-url.ap-northeast-1.on.aws/user_id?filter=${filterParam}`;

      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
      });


      if (!response.ok) {
        throw new Error('ユーザーデータの取得に失敗しました');
      }

      const jsonResponse = await response.json();
      const result = jsonResponse.result;
      const body = JSON.parse(result.body);

      const fields: Field[] = body.fields.map((field: any) => ({
        ...field,
        area: field.area ? parseFloat(field.area) : undefined,
      }));

      const movers: Mover[] = body.movers.map((mover: any) => ({
        ...mover,
        rtkId: mover.rtk_id,
      }));

      const userData: User = {
        ...body.user,
        fields,
        movers,
      };

      setUser(userData);
      console.log('userData:', userData);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ user, fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
