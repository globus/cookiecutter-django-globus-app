import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import { RecoilRoot } from 'recoil';

import Home from './Home.jsx';
import SearchEndpoint from './SearchEndpoint.jsx';

import '@fortawesome/fontawesome-free/css/all.min.css';

import '../index.scss';

const App = () => {
  return (
    <Router>
      <RecoilRoot>
        <Routes>
          <Route exact path='/' element={<Home />}>
            {/* 
              Endpoint routes are nested below the index path. Possible change
              to /endpoints, so routing would be:
                * /endpoints/:endpointID
                * /endpoints/:endpointID/:path
              These route render to the <Outlet /> in Home.jsx
            */}
            <Route exact path=':endpointID' element={<SearchEndpoint />}></Route>
            <Route path=':endpointID/:path' element={<SearchEndpoint />}></Route>
          </Route>
        </Routes>
      </RecoilRoot>
    </Router>
  );
};

export default App;
