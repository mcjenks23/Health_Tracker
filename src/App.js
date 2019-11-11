import React, { useState, useEffect } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Drawer from "@material-ui/core/Drawer";
import { auth } from "./firebase";
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
      <Route exact path="/app" component={Survey} />
      <Route path="/app/charts" component={Charts} />
    </div>
  );
}

function Survey(props) {
  const [radioValue, setRadioValue] = useState(2);
  const [sleep, setSleep] = useState(8);
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
          <Button variant="contained" color="primary" style={{ marginTop: 20 }}>
            Save
          </Button>
        </div>
      </Paper>
    </div>
  );
}

function Charts(props) {
  const data = {
    datasets: [
      {
        label: "Temperature",
        data: [
          { x: "2019-01-01", y: 70 },
          { x: "2019-01-05", y: 60 },
          { x: "2019-01-10", y: 53 }
        ],
        backgroundColor: "transparent",
        borderColor: "blue",
        yAxesID: "A"
      },
      {
        label: "Sleep",
        data: [
          { x: "2019-01-01", y: 6 },
          { x: "2019-01-05", y: 7 },
          { x: "2019-01-10", y: 6 }
        ],
        backgroundColor: "transparent",
        borderColor: "green",
        yAxesID: "B"
      },
      {
        label: "Happiness",
        data: [
          { x: "2019-01-01", y: 7 },
          { x: "2019-01-05", y: 5 },
          { x: "2019-01-10", y: 3 }
        ],
        backgroundColor: "transparent",
        borderColor: "red",
        yAxesID: "B"
      }
    ]
  };

  const options = {
    scales: {
      yAxes: [{ id: "A", position: "left" }, { id: "B", position: "right" }],
      xAxes: [{ type: "time", time: { displayFormats: { hour: "MMM D" } } }]
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
