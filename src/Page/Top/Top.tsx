import { useNavigate } from 'react-router-dom';
import { list } from '@aws-amplify/storage'
import React ,{ useState } from 'react';
import { Summary } from '../../components/Log/Summary';
import { Header } from '../../components/Header/Header'; 


export function Top() {
    const navigate = useNavigate();
    const [mm, setMm] = useState<String[]>([]);
    React.useEffect(() => {
        list({
            prefix: 'MM-',
            options: {
                listAll: true
              }
        
        }).then((data) => {
            const folder: Set<String> = new Set();
            data.items.forEach((file) => {
                const folderName = file.key.split('/')[0];
                folder.add(folderName);
            });
            setMm(Array.from(folder));
            console.log(folder);
        }).catch((error) => {
            console.log(error);
        });
    }
    , []);
    
    return (
        <>
            <Header />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">MobileMover</h1>
                <ul className="list-none">
                    {mm.map((mmId, index) => (
                        <li key={index} className="mb-2">
                 
                            <Summary fileKey={`${mmId}/summary.csv`} fileName={mmId.valueOf()} url={`#/mm/${mmId}`} unit="km"/>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}