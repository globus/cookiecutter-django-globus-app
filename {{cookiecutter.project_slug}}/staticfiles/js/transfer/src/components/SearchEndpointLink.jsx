import { Link } from 'react-router-dom';
import React from 'react';

const EndpointLink = (props) => {
  return (
    <Link
      key={props['endpoint']['id']}
      to={`${props['endpoint']['id']}`}
      className='list-group-item list-group-item-action flex-column align-items-start'
      onClick={props['handleEndpointClick']}>
      <h5 className='mb-1'>
        <i className='fa-solid fa-layer-group'></i>&nbsp;
        {props['endpoint']['display_name']}
      </h5>

      <p className='mb-0 mt-2 fw-bold'>Owner:</p>
      <p className='mb-1'>{props['endpoint']['owner_string']}</p>

      {props['endpoint']['description'] && (
        <>
          <p className='mb-0 mt-2 fw-bold'>Description:</p>
          <p className='mb-1'>{props['endpoint']['description']}</p>
        </>
      )}
    </Link>
  );
};
export default EndpointLink;
