import React, { useState, useEffect } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Drawer from "@material-ui/core/Drawer";
import { auth, db } from "./firebase";
import List from "@material-ui/core/List";
import { Link } from "react-router-dom";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { Route } from "react-router";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Radio from "@material-ui/core/Radio";
import DissatisfiedIcon from "@material-ui/icons/SentimentDissatisfied";
import SatisfiedIcon from "@material-ui/icons/SentimentSatisfied";
import VeryDissatisfiedIcon from "@material-ui/icons/SentimentVeryDissatisfied";
import VerySatisfiedIcon from "@material-ui/icons/SentimentVerySatisfied";
import { Line } from "react-chartjs-2";
var unirest = require("unirest");
var moment = require("moment");

export function App(props) {
  const [drawer_open, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      if (u) {
        setUser(u);
      } else {
        props.history.push("/");
      }
    });

    return unsubscribe;
  }, [props.history]);

  const handleMenuOpen = () => {
    setDrawerOpen(true);
  };
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        props.history.push("/");
      })
      .catch(error => {
        alert(error.message);
        //display error message
      });
  };

  if (!user) {
    return <div />;
  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Typography
            color="inherit"
            variant="h6"
            style={{ marginLeft: 15, flexGrow: 1 }}
          >
            Health Tracker
          </Typography>
          <Typography color="inherit" style={{ marginRight: 30 }}>
            Hi! {user.email}
          </Typography>

          <Button color="inherit" onClick={handleSignOut}>
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer open={drawer_open} onClose={handleCloseDrawer}>
        <List>
          <ListItem
            button
            to="/app/"
            component={Link}
            onClick={handleCloseDrawer}
          >
            <ListItemText primary="Take Survey" />
          </ListItem>
          <ListItem
            button
            to="/app/charts/"
            component={Link}
            onClick={handleCloseDrawer}
          >
            <ListItemText primary="Chart" />
          </ListItem>
        </List>
      </Drawer>
      <Route
        exact
        path="/app/"
        render={routeProps => {
          return (
            <Survey
              user={user}
              match={routeProps.match}
              location={routeProps.location}
              history={routeProps.history}
            />
          );
        }}
      />
      <Route
        path="/app/charts/"
        render={routeProps => {
          return (
            <Charts
              user={user}
              match={routeProps.match}
              location={routeProps.location}
              history={routeProps.history}
            />
          );
        }}
      />
    </div>
  );
}

function Survey(props) {
  const [radioValue, setRadioValue] = useState(2);
  const [sleep, setSleep] = useState(8);
  const [temp, setTemp] = useState(70);
  const [lat, setLat] = useState();
  const [lon, setLon] = useState();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      setLat(position.coords.latitude);
      setLon(position.coords.longitude);
    });
  }, []);

  useEffect(() => {
    var req = unirest(
      "GET",
      "https://community-open-weather-map.p.rapidapi.com/weather"
    );

    req.query({
      lat: lat,
      lon: lon,
      units: "imperial"
    });

    req.headers({
      "x-rapidapi-host": "community-open-weather-map.p.rapidapi.com",
      "x-rapidapi-key": "2ab76a46c3msh95a7e9a72dc4326p1f1d13jsna9d018bfce1d"
    });

    req.end(function(res) {
      if (res.error) throw new Error(res.error);

      setTemp(res.body.main.temp);
      console.log(lon);
    });
  }, [lat, lon]);

  const handleSave = () => {
    const today = moment().format("YYYY-MM-DD HH:mm");
    db.collection("users")
      .doc(props.user.uid)
      .collection("surveys")
      .add({ temperature: temp, sleep: sleep, happy: radioValue, date: today })
      .then(() => {
        props.history.push("/app/charts/");
      });
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Paper style={{ padding: 30, width: 400, marginTop: 30 }}>
        <Typography>How many hours did you sleep last night?</Typography>
        <TextField
          fullWidth
          value={sleep}
          onChange={e => {
            setSleep(e.target.value);
          }}
        />
        <Typography style={{ marginTop: 20 }}>
          How happy do you feel today?
        </Typography>
        <div style={{ marginTop: 10 }}>
          <Radio
            icon={<VerySatisfiedIcon />}
            checkedIcon={<VerySatisfiedIcon />}
            value={1}
            checked={radioValue === 1}
            onChange={() => {
              setRadioValue(1);
            }}
          />
          <Radio
            icon={<SatisfiedIcon />}
            checkedIcon={<SatisfiedIcon />}
            value={2}
            checked={radioValue === 2}
            onChange={() => {
              setRadioValue(2);
            }}
          />
          <Radio
            icon={<DissatisfiedIcon />}
            checkedIcon={<DissatisfiedIcon />}
            value={3}
            checked={radioValue === 3}
            onChange={() => {
              setRadioValue(3);
            }}
          />
          <Radio
            icon={<VeryDissatisfiedIcon />}
            checkedIcon={<VeryDissatisfiedIcon />}
            value={4}
            checked={radioValue === 4}
            onChange={() => {
              setRadioValue(4);
            }}
          />
        </div>
        <div>
          <Button
            variant="contained"
            color="primary"
            style={{ marginTop: 20 }}
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </Paper>
    </div>
  );
}

function Charts(props) {
  const [temperature, setTemperature] = useState([]);
  const [happiness, setHappiness] = useState([]);
  const [sleep, setSleep] = useState([]);

  useEffect(() => {
    const unsubscribe = db
      .collection("users")
      .doc(props.user.uid)
      .collection("surveys")
      .onSnapshot(snapshot => {
        let tempArray = [];
        let happyArray = [];
        let sleepArray = [];

        snapshot.forEach(s => {
          const data = s.data();
          tempArray.push({ x: data.date, y: data.temperature });
          happyArray.push({ x: data.date, y: data.happy });
          sleepArray.push({ x: data.date, y: data.sleep });
        });

        tempArray = tempArray.sort((a, b) => {
          if (a.x > b.x) {
            return -1;
          } else {
            return 1;
          }
        });

        happyArray = happyArray.sort((a, b) => {
          if (a.x > b.x) {
            return -1;
          } else {
            return 1;
          }
        });

        sleepArray = sleepArray.sort((a, b) => {
          if (a.x > b.x) {
            return -1;
          } else {
            return 1;
          }
        });

        setTemperature(tempArray);
        setHappiness(happyArray);
        setSleep(sleepArray);
      });
    return unsubscribe;
  }, [props]);

  const data = {
    datasets: [
      {
        label: "Happiness",
        data: happiness,
        backgroundColor: "transparent",
        borderColor: "red",
        yAxisID: "y-axis-2"
      },
      {
        label: "Sleep",
        data: sleep,
        backgroundColor: "transparent",
        borderColor: "blue",
        yAxisID: "y-axis-2"
      },
      {
        label: "Temperature",
        data: temperature,
        backgroundColor: "transparent",
        borderColor: "green",
        yAxisID: "y-axis-1"
      }
    ]
  };

  const options = {
    scales: {
      yAxes: [
        {
          type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
          display: true,
          position: "left",
          id: "y-axis-1"
        },
        {
          type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
          display: true,
          position: "right",
          id: "y-axis-2"
          // grid line settings
        }
      ],
      xAxes: [
        {
          type: "time",
          time: { displayFormats: { hour: "MMM D" } }
        }
      ]
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Paper style={{ width: 600, marginTop: 30, padding: 30 }}>
        <Typography variant="h6" style={{ marginBottom: 30 }}>
          Health Stats over Time
        </Typography>
        <Line data={data} options={options} />
      </Paper>
    </div>
  );
}
