import { Map } from '../../components/Data/Map';
import { Data } from '../../components/Data/Data';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Header } from '../../components/Header/Header';
import { Images } from '../../components/Images/Images';


export function Detail() {
    const navigate = useNavigate();
    const { mmId, date, logId } = useParams();

    const [ under, setUnder ] = useState('map');

    return (
        <div className="relative">
            
            <div className="h-full">
                {under === 'map' ? (
                    <>
                    <Map mmId={mmId} date={date} logId={logId}/> 
                    <Images/>
                    </>
                )
                : null}
                {under === 'data' ? <Data /> : null}
            </div>
            <button
                className="fixed top-20 right-10 z-50 w-20 p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                style={{ zIndex: 1000}}
                onClick={() => setUnder('map')}
            >
                Map
            </button>
            <button
                className="fixed top-32 right-10 z-50 w-20 p-2 bg-green-500 text-white rounded hover:bg-green-700"
                style={{ zIndex: 1000}}
                onClick={() => setUnder('data')}
            >
                Data
            </button>
        </div>
    );
}