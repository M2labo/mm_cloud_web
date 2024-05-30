import { useNavigate } from 'react-router-dom';
import { list } from 'aws-amplify/storage';
import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Summary } from '../../components/Log/Summary';
import { Header } from '../../components/Header/Header';

export function Mm() {
  const navigate = useNavigate();
  const [folder, setFolder] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState('desc'); // デフォルトで降順に設定
  const [yearFilter, setYearFilter] = useState(''); // 年フィルター用の状態
  const [monthFilter, setMonthFilter] = useState(''); // 月フィルター用の状態
  const { mmId } = useParams(); 

  useEffect(() => {
    console.log(mmId);
    // AWS Amplifyのlist関数を使用してフォルダリストを取得
    list({
      prefix: mmId + '/',
      options: {
        listAll: true
      }
    }).then((data) => {
      const folder: Set<string> = new Set();
      console.log(data);
      // 取得したデータからフォルダ名を抽出し、Setに追加
      data.items.forEach((file) => {
        const folderName = file.key.split('/').slice(1, 3).join('');
        if (folderName !== 'summary.csv' && folderName !== file.key.split('/').slice(1, 2).join('') + 'summary.csv') {
          folder.add(folderName);
        }
      });
      // フォルダ名を配列に変換してセット
      setFolder(Array.from(folder).sort((a, b) => b.localeCompare(a))); // 初回読み込み時に降順ソート
    }).catch((error) => {
      console.log(error);
    });
  }, [mmId]);

  // ソート順変更ハンドラー
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortOrder = event.target.value;
    // ソート順に基づいてフォルダ配列をソート
    const sortedFolder = [...folder].sort((a, b) => {
      if (newSortOrder === 'asc') {
        return a.localeCompare(b);
      } else {
        return b.localeCompare(a);
      }
    });
    setFolder(sortedFolder);
    setSortOrder(newSortOrder);
  };

  // 年フィルターハンドラー
  const handleYearFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setYearFilter(event.target.value);
  };

  // 月フィルターハンドラー
  const handleMonthFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMonthFilter(event.target.value);
  };

  // 年と月のフィルター適用後のフォルダーリスト
  const filteredFolder = folder.filter(f => 
    (yearFilter === '' || f.slice(0, 4) === yearFilter) &&
    (monthFilter === '' || f.slice(4, 6) === monthFilter)
  );

  // 年と月のリストを抽出
  const years = Array.from(new Set(folder.map(f => f.slice(0, 4))));
  const months = Array.from(new Set(folder.map(f => f.slice(4, 6))));

  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h1 className="text-2xl font-bold mb-4">日付</h1>
          <div className="flex flex-col md:flex-row w-full md:w-auto">
            <div className="mb-4 md:mb-0 md:mx-4 w-full md:w-auto">
              <label htmlFor="sortOrder" className="mr-2">ソート:</label>
              <select id="sortOrder" value={sortOrder} onChange={handleSortChange} className="px-4 py-2 border rounded w-full md:w-auto">
                <option value="asc">昇順</option>
                <option value="desc">降順</option>
              </select>
            </div>
            <div className="mb-4 md:mb-0 md:mx-4 w-full md:w-auto">
              <label htmlFor="yearFilter" className="mr-2">年:</label>
              <select id="yearFilter" value={yearFilter} onChange={handleYearFilterChange} className="px-4 py-2 border rounded w-full md:w-auto">
                <option value="">全て</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="mb-4 md:mb-0 md:mx-4 w-full md:w-auto">
              <label htmlFor="monthFilter" className="mr-2">月:</label>
              <select id="monthFilter" value={monthFilter} onChange={handleMonthFilterChange} className="px-4 py-2 border rounded w-full md:w-auto">
                <option value="">全て</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* フィルター後のフォルダリストを表示 */}
        <ul className="list-none">
          {filteredFolder.map((folder, index) => (
            <li key={index} className="mb-4">
              <Summary fileKey={`${mmId}/${folder?.slice(0, 4)}/${folder?.slice(4, 8)}/summary.csv`} fileName={`${folder?.slice(0, 4)}/${folder?.slice(4, 6)}/${folder?.slice(6, 8)}`} url={`#/log/${mmId}/${folder}`} unit="km" />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
