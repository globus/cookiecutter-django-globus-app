import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';

import SearchCollection from './SearchCollection.jsx';
import { CurrentSearchDirectoryAtom, SearchCollectionAtom } from '../state/globus';

const SearchEndpoint = (props) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchCollection, setSearchCollection] = useRecoilState(SearchCollectionAtom);

  const setCurrentSearchDirectory = useSetRecoilState(CurrentSearchDirectoryAtom);

  const [search] = useSearchParams();

  const absolutePath = search.get('absolutePath');
  const { endpointID, path } = useParams();


  useEffect(() => {
    listSearchCollectionItems();
  }, [endpointID, path]);

  const listSearchCollectionItems = async () => {
    setError(null);
    setLoading(true);
    try {
      let url = `/api/endpoints/${endpointID}/ls`;
      if (path) {
        setCurrentSearchDirectory(path);
        url = `${url}?path=${absolutePath}${path}`;
      }
      let response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      var searchCollectionItems = await response.json();
      if ('code' in searchCollectionItems) {
        throw searchCollectionItems;
      }
    } catch (error) {
      setError(error);
    }

    setSearchCollection(searchCollectionItems);
    setLoading(false);
  };

  if (error) {
    return (
      <div className='alert alert-danger'>
        <strong>Error {error['status_code']}: </strong>
        {error['message']}
      </div>
    );
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return <SearchCollection key={endpointID} endpointID={endpointID} />;
};

export default SearchEndpoint;
