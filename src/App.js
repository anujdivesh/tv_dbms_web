import './App.css';
import React, {useEffect, useState} from "react";
import './css/nav.css';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link
  } from "react-router-dom";
import Home from "./pages/home";
import Add from "./pages/add";
import Search from "./pages/search";
import Login from './pages/login';
import Signup from './pages/signup';
import AuthService from "./services/auth.service";
import EventBus from "./common/EventBus";
import Metadata from './pages/metadata';
import Contact from "./pages/contact";
import Country from "./pages/country";
import Data_Type from "./pages/data_type";
import Keyword from "./pages/keyword";
import Project from "./pages/project";
import Publisher from "./pages/publisher";
import Topic from "./pages/topic";
import FileUploadComponent from './pages/file';
import MetadataList from './pages/edit';
import BoundingBox from './pages/bounding_box';
function App() {

  const [showAdminBoard, setShowAdminBoard] = useState(false);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [username, setUsername] = useState(undefined);

  useEffect(() => {
    const user = AuthService.getCurrentUserCookie();
    if (user) {
      setCurrentUser(user);
      var tempemail = user.email
      var split = tempemail.split('@');
      setUsername(split[0])
      setShowAdminBoard(user.roles.includes("ROLE_ADMINEYJHBGCIOIJIUZI1NIISINR5CCI6IKPXVCJ9EYJLBWFPBCI6IM"));
    }

    EventBus.on("logout", () => {
      logOut();
    });

    return () => {
      EventBus.remove("logout");
    };
  }, []);

  const logOut = () => {
    AuthService.logout();
    setShowAdminBoard(false);
    setCurrentUser(undefined);
  };

  return (
    <div className="App">
      <Router>
        <div>
          <Navbar expand="lg" bg={"navbar navbar-expand-sm navbar-custom"} variant={"dark"} style={{paddingRight:"1%",paddingLeft:"1%"}}>
          <img src={require('./images/spx.png')} alt='logo' style={{width:"85px", height:"50px",marginLeft:'-15px'}}/>
          <img src={require('./images/tv.png')} alt='logo' style={{width:"50px", height:"50px",marginTop:"-2px",marginLeft:'3px'}}/>
          <img src={require('./images/UNDPlogo.png')} alt='logo' style={{width:"31px", height:"50px",marginLeft:'3px'}}/>
          <img src={require('./images/tcap.png')} alt='logo' style={{width:"50px", height:"50px", marginTop:"-3px",marginLeft:'3px'}}/>
          <img src={require('./images/GCFLogo.png')} alt='logo' style={{width:"80px", height:"50px",marginLeft:'3px'}}/>
            <Navbar.Brand as={Link} to={"/oceandata"}>
              &nbsp;Data Management System
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link as={Link} to={"/oceandata"}>Home</Nav.Link>
                {showAdminBoard && (
                  <>
                    <Nav.Link as={Link} to={"/oceandata/metadata"}>Metadata</Nav.Link>
                    <NavDropdown title="Manage" id="basic-nav-dropdown">
                      <NavDropdown.Item as={Link} to={"/oceandata/contact"}>Contact</NavDropdown.Item>
                      <NavDropdown.Item as={Link} to={"/oceandata/bounding_box"}>Bounding Box</NavDropdown.Item>
                      <NavDropdown.Item as={Link} to={"/oceandata/data_type"}>Data Type</NavDropdown.Item>
                      <NavDropdown.Item as={Link} to={"/oceandata/keyword"}>Keyword</NavDropdown.Item>
                      <NavDropdown.Item as={Link} to={"/oceandata/project"}>Project</NavDropdown.Item>
                      <NavDropdown.Item as={Link} to={"/oceandata/publisher"}>Publisher</NavDropdown.Item>
                      <NavDropdown.Item as={Link} to={"/oceandata/topic"}>Topic</NavDropdown.Item>
                    </NavDropdown>
                  </>
                )}
              </Nav>
              {currentUser ? (
                <Form inline="true">
                  <Button variant="warning" className="mr-sm-4" as={Link} to={"/oceandata/login"} onClick={logOut}>{username}:Logout</Button>
                </Form>
              ) : (
                <Form inline="true">
                  <Button style={{color:'#215E95'}} variant="warning" className="mr-sm-4" as={Link} to={"/oceandata/login"}>Login!</Button>
                </Form>
              )}
            </Navbar.Collapse>
          </Navbar>
        </div>
        <div>
          <Routes>
            <Route path="/oceandata/home" element={<Home/>} />
            <Route path="/oceandata/add" element={<Add/>} />
            <Route path="/oceandata/metadata" element={<Metadata/>} />
            <Route path="/oceandata/contact" element={<Contact/>} />
            <Route path="/oceandata/country" element={<Country/>} />
            <Route path="/oceandata/bounding_box" element={<BoundingBox/>} />
            <Route path="/oceandata/data_type" element={<Data_Type/>} />
            <Route path="/oceandata/publisher" element={<Publisher/>} />
            <Route path="/oceandata/topic" element={<Topic/>} />
            <Route path="/oceandata/keyword" element={<Keyword/>} />
            <Route path="/oceandata/project" element={<Project/>} />
            <Route path="/oceandata/search" element={<Search/>} />
            <Route path="/oceandata/login" element={<Login/>} />
            <Route path="/oceandata/signup" element={<Signup/>} />
            <Route path="/oceandata/file" element={<FileUploadComponent />} />
            <Route path="/oceandata/edit" element={<MetadataList />} />
            <Route path="/oceandata" element={<Home />} />
            
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;