import React, { useState } from 'react';
import axios from 'axios';

function Main() {
  const [rides, setRides] = useState([]);
  const [showRides, setShowRides] = useState(false);
  const [searchTerm, setSearchTerm] = useState({
    source: '',
    destination: '',
  });

  const updateSearch = (e) => {
    const { value } = e.target;
    const name = e.target.getAttribute('name');
    if (name === 'From') {
      setSearchTerm({ ...searchTerm, source: value.toLowerCase() });
    } else if (name === 'Destination') {
      setSearchTerm({ ...searchTerm, destination: value.toLowerCase() });
    }
  };

  const searchRides = async (e) => {
    e.preventDefault();
    const response = await axios.get('/rides', { params: { search: searchTerm } });
    const { data } = await response;
    setRides(data);
    if (data.length > 0) {
      setShowRides(true);
    }
  };

  return (
    <div>
      {showRides ? (
        <div>
          <button
            type="submit"
            onClick={() => {
              setShowRides(false);
              setSearchTerm({
                source: '',
                destination: '',
              });
            }}
          >
            Change Search
          </button>

          {rides.map((ride) => (
            <div key={ride.date + ride.driverId}>
              {ride.origin}
              {' '}
              to:
              {' '}
              {ride.destination}
              {' '}
              $
              {ride.price}
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={searchRides}>
          <input
            type="text"
            name="From"
            placeholder="Ride From"
            onChange={updateSearch}
          />
          <input
            type="text"
            name="Destination"
            placeholder="Destination"
            onChange={updateSearch}
          />
          <button type="submit" onClick={searchRides}>
            {' '}
            Go!
            {' '}
          </button>
        </form>
      )}
    </div>
  );
}

export default Main;
