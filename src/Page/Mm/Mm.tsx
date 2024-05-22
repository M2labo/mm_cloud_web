
import { useNavigate } from 'react-router-dom';
import { list } from 'aws-amplify/storage';
import { useParams } from 'react-router-dom';
import React, { useState } from 'react'
import { Summary } from '../Log/Summary';



export function Mm() {
  const navigate = useNavigate();
  const [folder , setFolder] = useState<String[]>([]);
  const { mmId } = useParams(); 
  React.useEffect(() => {
    console.log(mmId);
    list({
      prefix: mmId + '/',

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
          <h1>Date</h1>
          {folder.map((folder, index) => {
              return (
                <React.Fragment key={index}>
                  <li>
                          <a href={`#/log/${mmId}/${folder}`}>
                              {folder}
                          </a>
                  </li>
                  <Summary fileKey={`${mmId}/${folder?.slice(0,4)}/${folder?.slice(4,8)}/summary.csv`} />
                </React.Fragment>
              );
          }
          )}

      
      </>
  );
}