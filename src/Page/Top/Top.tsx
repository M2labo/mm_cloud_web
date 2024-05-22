import { useNavigate } from 'react-router-dom';
import { list } from '@aws-amplify/storage'
import React ,{ useState } from 'react';
import { Summary } from '../Log/Summary';


export function Top() {
    const navigate = useNavigate();
    const [mm, setMm] = useState<String[]>([]);
    React.useEffect(() => {
        list({
            prefix: 'MM-',
        
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
            <h1>MobileMover</h1>
            {mm.map((mmId, index) => {
                return (
                    <>
                    <li 
                        key={index}
                        >
                            <a href={`/mm/${mmId}`}>
                                {mmId}
                            </a>
                    </li>
                    <Summary fileKey={`${mmId}/summary.csv`} />
                    </>
                );
            }
            )}
            
        </>
    );
}