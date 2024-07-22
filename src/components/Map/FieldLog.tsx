import React, { useState, useEffect } from 'react';


async function fetchSummary(fieldId: number | null): Promise<any> {
  const fiter_dict = { field_id: fieldId};
  const queryParams = new URLSearchParams({ filter: JSON.stringify(fiter_dict) });
  console.log(`https://lsdlueq272y5yboojqgls6dcsi0ejsla.lambda-url.ap-northeast-1.on.aws/log?${queryParams}`);
  const response = await fetch(`https://lsdlueq272y5yboojqgls6dcsi0ejsla.lambda-url.ap-northeast-1.on.aws/summary_field?${queryParams}`);
  const data = await response.json();
  return data;
}

interface FieldLogProps {
  fieldId: number | null;
}

export const FieldLog: React.FC<FieldLogProps> = ({ fieldId }) => {
  const [sortOrder, setSortOrder] = useState('desc'); // デフォルトで降順に設定
  const [yearFilter, setYearFilter] = useState(''); // 年フィルター用の状態
  const [monthFilter, setMonthFilter] = useState(''); // 月フィルター用の状態
  const [summaries, setSummaries] = useState<any[]>([]);

  // ソート順変更ハンドラー
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortOrder = event.target.value;
    // ソート順に基づいてフォルダ配列をソート
    const sortedSummaries = [...summaries].sort((a, b) => {
      if (newSortOrder === 'asc') {
        return a.date.localeCompare(b.date);
      } else {
        return b.date.localeCompare(a.date);
      }
    });
    setSummaries(sortedSummaries);
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
  const filteredSummaries = summaries.filter(f => 
    (yearFilter === '' || f.date.slice(0, 4) === yearFilter) &&
    (monthFilter === '' || f.date.slice(4, 6) === monthFilter)
  );

  // 年と月のリストを抽出
  const years = Array.from(new Set(summaries.map(f => f.date.slice(0, 4))));
  const months = Array.from(new Set(summaries.map(f => f.date.slice(4, 6))));

  useEffect(() => {
      let isSubscribed = true;
      console.log(fieldId); 
      fetchSummary(fieldId)
          .then(data => {
              if (isSubscribed) {
                  const parsedData = JSON.parse(data.result);
                  const sortedData = parsedData.sort((a: any, b: any) => b.date.localeCompare(a.date)); // 初回読み込み時に降順ソート
                  console.log(sortedData);
                  setSummaries(sortedData);
              }
          })
          .catch(console.error);

      return () => { isSubscribed = false; };
  }, [fieldId]);

  return (
    <>

      <div className="p-4 bg-white shadow-2xl border-4 border-gray-800 rounded-lg overflow-wrap-break-word">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h1 className="text-2xl font-bold mb-4">ログ</h1>
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
        {filteredSummaries.length === 0 && <p>データがありません。</p>}
        <ul className="list-none">
            {filteredSummaries.map((summary, index) => (
                <li key={index} className="mb-4">
                    <a href={`#/log/${summary.mm}/${summary.date}`}>
                        <div className="p-4 bg-white shadow-md rounded-lg my-4">
                            <p className="text-lg font-semibold mb-2">{`${summary.date?.slice(0, 4)}/${summary.date?.slice(4, 6)}/${summary.date?.slice(6, 8)}`}</p>
                            <p>
                            走行時間：{summary.driving_time}時間, 
                            走行距離：{summary.distance}km, 
                            散布量：{summary.flow_volume.toFixed(1)}L, 
                            消費電力：{summary.power.toFixed(1)}Wh
                            </p>
                        </div>
                    </a>
                </li>
            ))}
        </ul>
      </div>
    </>
  );
}
