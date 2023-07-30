import "./App.css";
import Navbar from "./components/Navbar.js";
import Home from "./components/Home.js";
import Profile from "./components/Profile.js";
import Enter from "./components/Enter.js";
import Signup from "./components/Signup.js";
import Search from "./components/Search.js";
import Notifications from "./components/Notifications.js";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

function App() {
  return (
    <>
      <Router>
        <Navbar></Navbar>
        <Routes>
          <Route exact path="/" element={<Enter></Enter>} />
          <Route exact path="/Home" element={<Home></Home>} />
          <Route exact path="/Profile" element={<Profile></Profile>} />
          <Route exact path="/Signup" element={<Signup></Signup>} />
          <Route exact path="/Search" element={<Search></Search>} />
          <Route exact path="/Notifications" element={<Notifications></Notifications>} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
