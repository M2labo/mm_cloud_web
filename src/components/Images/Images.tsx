
import { getUrl } from 'aws-amplify/storage';
import { list } from 'aws-amplify/storage';
import { useParams } from 'react-router-dom';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';


export function Images() {
    const navigate = useNavigate();
    const [folders, setFolders] = useState<string[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const { mmId, date, logId } = useParams();

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await list({
                    prefix: `${mmId}/${date?.slice(0,4)}/${date?.slice(4,8)}/${logId}/`
                   
                });
                const filteredResult = result.items.filter(item => item.key.endsWith('.jpg')); //画像ファイルのみを抽出

                const imagesSet = new Set<string>();
                await Promise.all(filteredResult.map(async (file) => {
                    const imageData = await getUrl({
                        key: `${file.key}`,
                    });
                    imagesSet.add(imageData.url.href);
                }));               
                setImages(Array.from(imagesSet));
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [mmId, date]);


    return (
        <div style={{ margin: '50px', display: 'flex', justifyContent: 'left', flexWrap: 'wrap' }}>
            {images.map((image, index) => (
                <div key={index}>
                    <img
                        style={{ width: '200px', height: 'auto', margin: '20px' }}
                        src={image}
                        alt={`Content ${index}`}
                        onClick={() => { window.location.href = image; }}
                    />
      
                </div>
            ))}
        </div>
    );
}