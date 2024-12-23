import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
// import Profileuser from '../../../assets/images/profileuser.png';

const HeaderProfileSkeleton = () => {
  return (
    <div className='HeadersectionProfile'>
      <div className='dropdown'>
        <h4>
          <Skeleton width={50} />
          <Skeleton circle={true} height={30} width={30} />
        </h4>
        <div className="dropdown-content" aria-labelledby="dropdownMenuButton">
          <div className='DropdownProfile'>
            <Skeleton circle={true} height={50} width={40} />
            <div>
              <h5><Skeleton width={100} style={{ marginLeft: '10px' }} /><br /><b><Skeleton width={70} style={{ marginLeft: '10px' }} /></b></h5>
              <p><Skeleton width={100} style={{ marginLeft: '10px' }} /></p>
            </div>
          </div>
          <Skeleton width={100} height={20} style={{ marginTop: '10px', marginLeft: '10px' }} />
          <Skeleton width={100} height={20} style={{ marginTop: '10px', marginLeft: '10px', marginBottom: '10px' }} />
        </div>
      </div>
    </div>
  );
};

export default HeaderProfileSkeleton;