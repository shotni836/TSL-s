import React from 'react'
import './Loading.css';
import { ThreeDots } from 'react-loader-spinner';

function Loading() {
    return (
        <section className='LoadingSectionPage'>
            <ThreeDots
                height="50"
                width="50"
                radius="9"
                color="white"
                ariaLabel="three-dots-loading"
                wrapperStyle={{}}
                wrapperClassName=""
                visible={true}
            />
        </section>
    )
}

export default Loading