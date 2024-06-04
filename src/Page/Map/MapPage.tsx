import { Map } from '../../components/Map/Map';
import { Header } from '../../components/Header/Header';

export function MapPage() {

    return (
        <div className="relative">
            <Header />
            <Map zoom={17} size="95vh"/>

        </div>
    );
}