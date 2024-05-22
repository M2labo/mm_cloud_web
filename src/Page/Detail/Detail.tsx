import { Map } from '../../components/Map/Map';
import { Data } from '../../components/Data/Data';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';


export function Detail() {
    const navigate = useNavigate();
    const { mmId, date, logId } = useParams();

    const [ under, setUnder ] = useState('map');

    return (
        <>

            <div
                style={{ height: "100vh"}}
            >
                {under === 'map' ? <Map mmId={mmId} date={date} logId={logId}/> : null}
                {under === 'data' ? <Data /> : null}

            </div>
            {/* 右上にボタン */}
            <button
                style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000, width: '80px'}}
                onClick={()=>{setUnder('map')}}
            >Map</button>

            <button
                style={{ position: 'fixed', top: '60px', right: '10px', zIndex: 1000, width: '80px'}}
                onClick={()=>{setUnder('data')}}
            >Data</button>
        
        </>
    );
}