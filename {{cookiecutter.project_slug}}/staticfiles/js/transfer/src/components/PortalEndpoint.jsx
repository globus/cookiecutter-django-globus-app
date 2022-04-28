import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import {
  PortalCollectionAtom,
  SearchCollectionAtom,
  SearchEndpointAtom,
  SelectedPortalItemsAtom,
} from '../state/globus';

const PortalEndpoint = (props) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [PORTAL_ENDPOINT_ID, SET_PORTAL_ENDPOINT_ID] = useState(null);
  const [transferRequest, setTransferRequest] = useState(null);

  const [portalCollection, setPortalCollection] = useRecoilState(PortalCollectionAtom);
  const [selectedPortalItems, setSelectedPortalItems] = useRecoilState(SelectedPortalItemsAtom);

  const searchCollection = useRecoilValue(SearchCollectionAtom);
  const searchEndpoint = useRecoilValue(SearchEndpointAtom);

  const [navigation, setNavigation] = useState(['/~/']);

  useEffect(() => {
    const config = JSON.parse(document.getElementById('transfer-config').innerHTML);
    SET_PORTAL_ENDPOINT_ID(config['portalEndpointID']);
    if (PORTAL_ENDPOINT_ID) { getPortalCollection() }
  }, [PORTAL_ENDPOINT_ID]);

  const getPortalCollection = async (path = null) => {
    setError(null);
    setLoading(true);
    setSelectedPortalItems([]);
    try {
      let url = `/api/endpoints/${PORTAL_ENDPOINT_ID}/ls`;
      if (path) {
        url = `${url}?path=${path}`;
      }
      let response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      var collection = await response.json();

      if ('code' in collection) {
        throw collection;
      }
    } catch (error) {
      setError(error);
    }
    setPortalCollection(collection);
    setLoading(false);
  };

  const handleBackClick = () => {
    if (navigation.length > 1) {
      const newNavigation = navigation.filter((item, index) => index !== navigation.length - 1);
      getPortalCollection(newNavigation[newNavigation.length - 1]);
      setNavigation(newNavigation);
    }
  };

  const handleDirectoryClick = (event) => {
    event.preventDefault();

    setNavigation((navigation) => {
      return [...navigation, event.target.dataset.pathName];
    });

    getPortalCollection(event.target.dataset.pathName);
  };

  const handleItemSelect = (event) => {
    if (event.target.checked) {
      setSelectedPortalItems((selectedPortalItems) => {
        return [JSON.parse(event.target.value), ...selectedPortalItems];
      });
    } else {
      const removeItem = JSON.parse(event.target.value);
      let filtered = selectedPortalItems.filter((selectedPortalItem) => {
        return selectedPortalItem.name != removeItem.name;
      });
      setSelectedPortalItems(filtered);
    }
  };

  const handleTransferToSearchEndpoint = async (event) => {
    event.preventDefault();

    setError(null);
    if (!searchEndpoint) {
      setError({
        message: 'Please search and select a destination endpoint',
        status_code: '500',
      });
      setLoading(false);
    } else {
      setLoading(true);
      const csrfToken = Cookies.get('csrftoken');
      let transferItems = [];
      for (let portalItem of selectedPortalItems) {

        let sourcePath = portalCollection['absolute_path']
        ? portalCollection['absolute_path']
        : portalCollection['path']
        sourcePath = `${sourcePath}${portalItem['name']}`;
        
        let destinationPath = searchCollection['absolute_path']
          ? searchCollection['absolute_path']
          : searchCollection['path'];
        destinationPath = `${destinationPath}${portalItem['name']}`;

        let recursive = portalItem['type'] == 'dir' ? true : false;

        transferItems.push({
          source_path: sourcePath,
          destination_path: destinationPath,
          recursive: recursive,
        });
      }

      if (transferItems.length === 0) {
        setError({ status_code: 500, message: 'Please select items to transfer'});
        setLoading(false);
      } else {
        let transferRequestPayload = {
          source_endpoint: PORTAL_ENDPOINT_ID,
          destination_endpoint: searchEndpoint['id'],
          transfer_items: transferItems,
        };

        try {
          const response = await fetch('/api/endpoints/transfer/', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify(transferRequestPayload),
          });
          var transferRequest = await response.json();
          if ('code' in transferRequest && transferRequest['code'] !== 'Accepted') {
            throw transferRequest;
          }
        } catch (error) {
          setError(error);
          setLoading(false);
        }
        setTransferRequest(transferRequest);
        setLoading(false);
      }
    }
  };

  if (error && error['code'] === '401 Unauthorized') {
    return (
      <div className='alert alert-danger'>
        <strong>Error {error['status_code']}: </strong>
        {error['message']} Please try <a className='alert-link' href='/login/globus'>logging in with Globus</a>.
       </div>
    )
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className='mb-4'>
      
      {error && (
        <div className='alert alert-danger'>
          <strong>Error {error['status_code']}: </strong>
          {error['message']}
        </div>
      )}

      {transferRequest && (
        <div className='alert alert-success alert-dismissible fade show'>
          <h4 className='alert-heading'>Accepted!</h4>
          <p>{transferRequest['message']}</p>
          <hr />
          <p className='mb-0'>
            <a
              className='alert-link'
              href={`https://app.globus.org/activity/${transferRequest['task_id']}`}
              target='_blank'>
              Check Status of Request <i className='fa-solid fa-arrow-up-right-from-square'></i>
            </a>
          </p>
        </div>
      )}

      <h5>Browsing Portal Endpoint</h5>

      <div className='file-browser border mb-4 pb-4 pl-2 pt-2 rounded'>
        <button className='btn btn-primary btn-sm mb-2' onClick={handleBackClick}>
          Back
        </button>
        {portalCollection && portalCollection['DATA'].length > 0 &&
          portalCollection['DATA'].map((item) => {
            return (
              <div key={`${item['last_modified']}-${item['name']}`} className='form-check'>
                <div>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    value={JSON.stringify(item)}
                    data-list-item-name={item['name']}
                    onChange={handleItemSelect}></input>
                  <label>
                    {item['type'] == 'dir' ? (
                      <a
                        href='#'
                        onClick={handleDirectoryClick}
                        data-path-name={`${portalCollection.path}${item['name']}/`}>
                        <>
                          <i className='fa-solid fa-folder-open'></i> {item['name']}
                        </>
                      </a>
                    ) : (
                      <>
                        <i className='fa-solid fa-file'></i> {item['name']}
                      </>
                    )}
                  </label>
                </div>
              </div>
            );
          })}
      </div>

      <div className='d-flex justify-content-end'>
        <button className='btn btn-sm btn-primary' onClick={handleTransferToSearchEndpoint}>
          Transfer to Search Endpoint <i className='fa-solid fa-arrow-right'></i>
        </button>
      </div>
    </div>
  );
};

export default PortalEndpoint;
