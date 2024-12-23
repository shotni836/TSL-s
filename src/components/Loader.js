import React from 'react'
import './Loader.css';
import { HashLoader } from 'react-spinners';

function Loader() {
    return (
        <section className='LoaderSectionPage'>
            <HashLoader
                visible={true}
                height="80"
                width="80"
                color="#067bbe"
                wrapperStyle={{}}
                wrapperClass=""
            />
        </section>
    )
}

export default Loader;