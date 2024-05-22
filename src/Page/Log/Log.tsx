import { useNavigate } from 'react-router-dom';
import { list } from 'aws-amplify/storage';
import { useParams } from 'react-router-dom';
import React, { useState } from 'react'
import { Summary } from './Summary';

export function Log() {
    const navigate = useNavigate();
    const [folder, setFolder] = useState<string[]>([]);
    const { mmId, date } = useParams(); 
    const path = `${mmId}/${date?.slice(0,4)}/${date?.slice(4,8)}/`;
    React.useEffect(() => {
        console.log(mmId + '/' + date?.slice(0,4) + '/' + date?.slice(4,8));
        list({
            prefix: mmId + '/' + date?.slice(0,4) + '/' + date?.slice(4,8),
            options: {
                listAll: true
              }

        }).then((data) => {
            const folder: Set<string> = new Set();
            console.log(data);
            data.items.forEach((file) => {
                const folderName = file.key.split('/').slice(3, 4).join('');
                if (folderName !== 'summary.csv') { 
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
            <h1>Log</h1>
            {folder.map((folder, index) => {
                return (
                    <>
                        <li 
                            key={index}
                            >
                                <a href={`#/detail/${mmId}/${date}/${folder}`}>
                                    {folder}
                                </a>
                        </li>
                        <Summary fileKey={`${mmId}/${date?.slice(0,4)}/${date?.slice(4,8)}/${folder}/summary.csv`} />
                    </>
                );
            }
            )}
        </>
    );
}