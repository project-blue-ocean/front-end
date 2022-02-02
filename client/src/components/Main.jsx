import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import DetailsIcon from '@mui/icons-material/Sms';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Modal from '@mui/material/Modal';
import Rating from '@mui/material/Rating';
import van from '../assets/road1.jpeg';
import Map from './Map.jsx';

function Main() {
  const [profile, setProfile] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [rides, setRides] = useState([]);
  const [showRides, setShowRides] = useState(false);
  const [showMap, setMap] = useState(false);
  const [searchTerm, setSearchTerm] = useState({
    source: '',
    destination: '',
  });
  const [location, setLocation] = useState({
    longitude: 0,
    latitude: 0,
  });
  const [startCoords, setStart] = useState({
    longitude: 0,
    latitude: 0,
  });
  const [endCoords, setEnd] = useState({
    longitude: 0,
    latitude: 0,
  });

  const searchRides = async (from, destination) => {
    const response = await axios.get('/rides', {
      params: {
        search: {
          source: from,
          destination,
        },
      },
    });
    const { data } = response;
    setRides(data);
    if (from !== '' && destination === '') {
      const sourceResponse = await axios.get('/coords', { params: { location: from } });
      await setStart({
        longitude: sourceResponse.data.features[0].bbox[0],
        latitude: sourceResponse.data.features[0].bbox[1],
      });
      setEnd({ longitude: 0, latitude: 0 });
    }
    if (destination !== '' && from === '') {
      const endResponse = await axios.get('/coords', { params: { location: destination } });
      await setEnd({
        longitude: endResponse.data.features[0].bbox[0],
        latitude: endResponse.data.features[0].bbox[1],
      });
      setStart({ longitude: 0, latitude: 0 });
    }
    if (destination !== '' && from !== '') {
      const sourceResponse = await axios.get('/coords', { params: { location: from } });
      await setStart({
        longitude: sourceResponse.data.features[0].bbox[0],
        latitude: sourceResponse.data.features[0].bbox[1],
      });
      const endResponse = await axios.get('/coords', { params: { location: destination } });
      await setEnd({
        longitude: endResponse.data.features[0].bbox[0],
        latitude: endResponse.data.features[0].bbox[1],
      });
    }
    if (data.length > 0) {
      setShowRides(true);
    }
  };

  const submitForm = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const from = formData.get('From').toLowerCase();
    const destination = formData.get('Destination').toLowerCase();
    setSearchTerm({ source: from, destination });
    searchRides(from, destination);
  };

  const getProfile = async (id) => {
    const response = await axios.get('/profile', { params: { search: id } });
    const { data } = await response;
    setProfile(data);
  };

  const displayModal = (id) => {
    getProfile(id);
    setShowDetails(true);
  };

  const closeModal = () => {
    setShowDetails(false);
  };

  async function showPosition(position) {
    await setLocation({ longitude: position.coords.longitude, latitude: position.coords.latitude });
    setMap(true);
  }

  async function getLocation() {
    if (navigator.geolocation) {
      await navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  }

  useEffect(() => {
    getLocation();
  }, []);

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #4169E1',
    boxShadow: 24,
    p: 4,
    borderRadius: '6px',
  };

  const styles = {
    width: '50%',
    minWidth: '380px',
    margin: 'auto',
    paddingTop: '150px',
  };

  const mainStyle = {
    height: '100vh',
    backgroundImage: `url("${van}")`,
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
  };

  return (
    <div className="bg" style={mainStyle}>
      <div
        className="Title"
        style={{
          margin: 'auto',
          width: '50%',
          textAlign: 'center',
        }}
      >
        {/* <h1> Hitch(not a dating app)</h1> */}
        {showMap
          && <Map location={location} startCoords={startCoords} endCoords={endCoords} />}

        <div className="search-box" style={styles}>
          {showRides ? (
            <div className="search-container" style={{ width: '100%' }}>
              <Button
                sx={{ width: '50%' }}
                variant="contained"
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
              </Button>
              <div className="rideList" style={{ border: '2px solid #4169E1', borderRadius: '6px', backgroundColor: 'white' }}>
                {rides.map((ride) => (
                  <List
                    sx={{
                      width: '100%',
                      maxWidth: 360,

                      alignItems: 'center',
                      margin: 'auto',

                    }}
                    key={ride.date + ride.driverId}
                  >
                    <ListItem
                      alignItems="flex-start"
                      secondaryAction={(
                        <IconButton
                          type="submit"
                          onClick={() => {
                            displayModal(ride.driverId);
                          }}
                        >
                          <DetailsIcon />
                        </IconButton>
                      )}
                    >
                      <ListItemText
                        primary={
                          (
                            <Typography
                              className="list-text"
                              sx={{ display: 'inline', fontSize: '1.8rem' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {ride.origin}
                              {' '}
                              <ArrowForwardIcon />
                              {ride.destination}
                            </Typography>
                          )
                        }
                        secondary={
                          (
                            <Typography
                              className="list-text-price"
                              sx={{
                                display: 'inline',
                                fontSize: '1.3rem',
                                color: '#4169E1',
                                opacity: '.9',
                                fontWeight: 'bold',
                              }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {' '}
                              $
                              {ride.price}
                            </Typography>
                          )
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </List>
                ))}
              </div>
            </div>
          ) : (
            <Box
              component="form"
              sx={{
                '& > :not(style)': { m: 1, width: '25ch' },
              }}
              noValidate
              autoComplete="off"
              onSubmit={submitForm}
            >
              <TextField
                sx={{ background: 'white', opacity: '.9', borderRadius: '6px' }}
                id="filled-basic"
                label="Location"
                varient="filled"
                type="text"
                name="From"
                autoFocus
              />
              <TextField
                sx={{ background: 'white', opacity: '.9', borderRadius: '6px' }}
                id="filled-basic"
                label="Destination"
                varient="filled"
                type="text"
                name="Destination"
              />
              <Button variant="contained" type="submit">
                {' '}
                Go!
                {' '}
              </Button>
            </Box>
          )}
        </div>
        <Modal
          open={showDetails}
          onClose={closeModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Driver Details
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              <div>
                <Avatar alt={profile.name} src={profile.image} />
                <Link to={`/profile/${profile.userId}`}>
                  {profile.name}
                </Link>
              </div>
              <Rating name="rating" value={Number(profile.driverRating)} readOnly precision={0.5} />
              <div>message</div>
            </Typography>
          </Box>
        </Modal>
      </div>
    </div>
  );
}

export default Main;
