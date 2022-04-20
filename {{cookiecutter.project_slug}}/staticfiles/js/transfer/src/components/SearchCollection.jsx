import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import {
  SearchCollectionAtom,
  SearchEndpointAtom,
  SelectedSearchItemsAtom,
} from '../state/globus';


const SearchCollection = (props) => {
  const [error, setError] = useState(null);
  const [searchEndpoint, setSearchEndpoint] = useRecoilState(SearchEndpointAtom);
  const [selectedSearchItems, setSelectedSearchItems] = useRecoilState(SelectedSearchItemsAtom);
  
  const searchCollection = useRecoilValue(SearchCollectionAtom);

  const navigate = useNavigate();

  useEffect(() => {
    getEndpoint();
  }, [props['endpointID']]);

  const getEndpoint = async () => {
    try {
      let response = await fetch(`/api/endpoints/${props['endpointID']}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      var endpoint = await response.json();
      if ('code' in endpoint) {
        throw endpoint;
      }
    } catch (error) {
      setError(error);
    }
    setSearchEndpoint(endpoint);
  };

  const handleItemSelect = (event) => {
    if (event.target.checked) {
      setSelectedSearchItems((selectedSearchItems) => {
        return [JSON.parse(event.target.value), ...selectedSearchItems];
      });
    } else {
      const removeItem = JSON.parse(event.target.value);
      let filtered = selectedSearchItems.filter((selectedSearchItem) => {
        return selectedSearchItem.name != removeItem.name;
      });
      setSelectedSearchItems(filtered);
    }
  };

  if (error) {
    return (
      <div className='alert alert-danger'>
        <strong>Error {error['status_code']}: </strong>{error['message']}
      </div>
    );
  }

  return (
    <>
      <h5>Browsing Endpoint {searchEndpoint && searchEndpoint['display_name']}</h5>
      <div className='file-browser border mb-4 pb-4 pl-2 pt-2 rounded'>
        <div key={props['endpointID']} id='collection'>
          <button className='btn btn-primary btn-sm mb-2' onClick={() => navigate(-1)}>
            Back
          </button>
          {searchCollection.length > 0 ? (
            searchCollection['DATA'].map((item) => {
              return (
                <div key={`${item['last_modified']}-${item['name']}`} className='form-check'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    value={JSON.stringify(item)}
                    data-list-item-name={item['name']}
                    onChange={handleItemSelect}></input>
                  <label>
                    {item['type'] == 'dir' ? (
                      <Link
                        to={{
                          pathname: `/${props['endpointID']}/${item['name']}/`,
                          search: `?absolutePath=${searchCollection['path']}`,
                        }}>
                        <i className='fa-solid fa-folder-open'></i> {item['name']}
                      </Link>
                    ) : (
                      <>
                        <i className='fa-solid fa-file'></i> {item['name']}
                      </>
                    )}
                  </label>
                </div>
              );
            })
          ) : (
            <p><i>Empty directory</i></p>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchCollection;
