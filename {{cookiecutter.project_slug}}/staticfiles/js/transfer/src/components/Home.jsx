import { Outlet } from 'react-router-dom';
import React, { useState } from 'react';

import PortalEndpoint from './PortalEndpoint.jsx';
import SearchEndpointLink from './SearchEndpointLink.jsx';

const Home = (props) => {
  const [endpointSearchText, setEndpointSearchText] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchEndpoints, setSearchEndpoints] = useState([]);

  const endpointRef = React.createRef();

  const handleEndpointClick = (event) => {
    endpointRef.current.style.display = 'none';
  };

  const handleEndpointSearchTextChange = (event) => {
    setEndpointSearchText(event.currentTarget.value);
  };

  const handleSearchEndpoints = async (event) => {
    let keyCode = event.keyCode;
    if (keyCode == 13) {
      setSearchEndpoints([]);
      setLoading(true);
      let endpointsSearchURL = `/api/endpoints?filter_fulltext=${endpointSearchText}`;
      try {
        let response = await fetch(endpointsSearchURL, {
          headers: {
            Allow: 'application/data',
            'Content-Type': 'application/data',
          },
        });
        var searchEndpoints = await response.json();
        if ('code' in searchEndpoints) {
          throw searchEndpoints;
        }
      } catch (error) {
        setError(error);
      }
      if (searchEndpoints.length > 0) {
        setSearchEndpoints(searchEndpoints);
      } else {
        setSearchEndpoints({ empty: true });
      }
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className='alert alert-danger'>
        <strong>Error {error['status_code']}: </strong>
        {error['message']}
      </div>
    );
  }

  return (
    <div id='transfer-home' className='container-fluid mt-4'>
      <div className='row'>
        <div className='col-6'>
          <PortalEndpoint />
        </div>

        <div className='col-6'>
          {/* 
            Endpoints will render here when the SearchEndpointLink is clicked below. 
            See App.jsx nested routing for more details. 
          */}
          <Outlet />

          <h5>Search Globus Endpoints</h5>
          <input
            id='endpoint-input'
            className='form-control'
            placeholder='Start typing and hit enter'
            type='text'
            value={endpointSearchText}
            onChange={handleEndpointSearchTextChange}
            onKeyDown={handleSearchEndpoints}
          />

          {loading && <p>Loading...</p>}

          {searchEndpoints.length > 0 && (
            <div id='endpoints' ref={endpointRef}>
              <div className='list-group'>
                {searchEndpoints.map((endpoint) => {
                  return (
                    <SearchEndpointLink
                      key={endpoint['id']}
                      endpoint={endpoint}
                      handleEndpointClick={handleEndpointClick}
                    />
                  );
                })}
              </div>
            </div>
          )}
          {searchEndpoints['empty'] && <h5 className='mt-4'>Nothing found</h5>}
        </div>
      </div>
    </div>
  );
};

export default Home;
