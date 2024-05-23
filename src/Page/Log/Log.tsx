import { useNavigate } from 'react-router-dom';
import { list } from 'aws-amplify/storage';
import { useParams } from 'react-router-dom';
import React, { useState } from 'react'
import { Summary } from './Summary';
import { Header } from '../../components/Header/Header';

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
            <Header />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Log</h1>
                <ul className="list-none">
                    {folder.map((folder, index) => (
                        <li key={index} className="mb-4">
                            <Summary fileKey={`${mmId}/${date?.slice(0, 4)}/${date?.slice(4, 8)}/${folder}/summary.csv`} fileName={`${folder?.slice(0, 2)}:${folder?.slice(2, 4)}:${folder?.slice(4, 6)}`} url={`#/detail/${mmId}/${date}/${folder}`} />
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}