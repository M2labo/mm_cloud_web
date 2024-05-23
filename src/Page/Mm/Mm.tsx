
import { useNavigate } from 'react-router-dom';
import { list } from 'aws-amplify/storage';
import { useParams } from 'react-router-dom';
import React, { useState } from 'react'
import { Summary } from '../Log/Summary';
import { Header } from '../../components/Header/Header';



export function Mm() {
  const navigate = useNavigate();
  const [folder , setFolder] = useState<String[]>([]);
  const { mmId } = useParams(); 
  React.useEffect(() => {
    console.log(mmId);
    list({
      prefix: mmId + '/',
      options: {
        listAll: true
      }

    }).then((data) => {
      const folder: Set<String> = new Set();
      console.log(data);
      data.items.forEach((file) => {
        const folderName = file.key.split('/').slice(1, 3).join('');
        if (folderName !== 'summary.csv' && folderName !== file.key.split('/').slice(1, 2).join('') + 'summary.csv'){ 
          folder.add(folderName);
      }
      });
      setFolder(Array.from(folder));

    }
    ).catch((error) => {
      console.log(error);
    });
  }
  , []);
  
  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Date</h1>
        <ul className="list-none">
          {folder.map((folder, index) => (
            <li key={index} className="mb-4">
              <Summary fileKey={`${mmId}/${folder?.slice(0, 4)}/${folder?.slice(4, 8)}/summary.csv`} fileName={folder?.slice(4, 8)} url={`#/log/${mmId}/${folder}`} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}