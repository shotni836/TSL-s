import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import RegisterEmployeebg from "../../../assets/images/RegisterEmployeebg.jpg";

const InnerHeaderPageSection = ({ linkTo, linkText, linkText2 }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <section className="InnerHeaderPageSection">
      <div className="InnerHeaderPageBg" style={{ backgroundImage: `url(${RegisterEmployeebg})` }} ></div>
      <div className="container">
        <div className="row">
          <div className="col-md-12 col-sm-12 col-xs-12">
            <ul>
              {loading ? (
                <Skeleton width={150} height={10} style={{ marginRight: '10px' }} />
              ) : (
                <li><Link to={linkTo}>{linkText}</Link></li>
              )}
              {loading ? (
                <Skeleton width={150} height={10} />
              ) : (
                <li><h1>/&nbsp; {linkText2} </h1></li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InnerHeaderPageSection;

// import React from 'react';
// import { Link } from 'react-router-dom';
// import RegisterEmployeebg from "../../../assets/images/RegisterEmployeebg.jpg";

// const InnerHeaderPageSection = ({ linkTo, linkText, linkText2 }) => {
//   return (
//     <section className="InnerHeaderPageSection">
//       <div className="InnerHeaderPageBg" style={{ backgroundImage: `url(${RegisterEmployeebg})` }} ></div>
//       <div className="container">
//         <div className="row">
//           <div className="col-md-12 col-sm-12 col-xs-12">
//             <ul>
//               <li><Link to={linkTo}>{linkText}</Link></li>
//               <li><h1>/&nbsp; {linkText2} </h1></li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default InnerHeaderPageSection;