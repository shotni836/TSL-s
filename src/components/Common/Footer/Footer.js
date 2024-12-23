import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './Footer.css';
import mwslogo from '../../../assets/images/max-logo.png';

const Footer = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000); 
  }, []);

  return (
    <footer className='footerpage'>
      <div className="container">
        <div className="row">
          <div className='col-md-12 col-sm-12 col-xs-12'>
            <div className='footerpageFlex'>
              {loading ? (
                <Skeleton width={100} height={50} />
              ) : (
                <img className="mwslogoImg" src={mwslogo} alt="Max Logo" />
              )}
              {loading ? (
                <Skeleton width={60} />
              ) : (
                <p>v1.0.0</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

// import React from 'react'
// import './Footer.css'
// import mwslogo from '../../../assets/images/max-logo.png'

// const Footer = () => {
//   return (
//     <footer className='footerpage'>
//       <div className="container">
//         <div className="row">
//           <div className='col-md-12 col-sm-12 col-xs-12'>
//             <div className='footerpageFlex'>
//               <img className="mwslogoImg" src={mwslogo} alt="" />
//               <p>v1.0.0</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   )
// }

// export default Footer;