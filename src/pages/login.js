import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from "react-bootstrap";
import "../css/login.css";
import AuthService from "../services/auth.service";
import BackgroundImage from "../assets/images/oceanpic2.jpg";
import Logo from "../assets/images/spclogo.png";

const Login = () => {
  let navigate = useNavigate();
    const [inputUsername, setInputUsername] = useState("");
    const [inputPassword, setInputPassword] = useState("");
    const [email, setEmail] = useState("");
    const [checked, setChecked] = React.useState(false);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messagegood, setMessagegood] = useState("");
    const handleClick = (e) => {
      setChecked(!checked)
      e.currentTarget.blur();
    }
    const handleSubmit = async (event) => {
      event.preventDefault();
      setLoading(true);
      setMessage("");
     await delay(500);
      console.log(`Username :${inputUsername}, Password :${inputPassword}`);
      AuthService.login(inputUsername, inputPassword).then(
        () => {
          console.log('success')
          navigate("/oceandata");
          window.location.reload();
        },
        (error) => {
          console.log(error)
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          setLoading(false);
          setMessage(resMessage);
        }
      );

    //  if (inputUsername !== "admin" || inputPassword !== "admin") {
    //    setShow(true);
    //  }
      setLoading(false);
    };
  
    const handlePassword = () => {
      console.log('resetting password!');
      setMessage(null)
      setMessagegood(null)
      AuthService.forgot_password(email).then(
        () => {
          setMessagegood('Activation Link has been sent on your email.')
          //navigate("/oceandata");
          //window.location.reload();
        },
        (error) => {
          console.log(error)
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          setLoading(false);
          setMessage(resMessage);
        }
      );
    };
  
    function delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  
    return (
        <>
         <main id="bodyWrapper">
        <div id="mapWrapper">
        <div id="map33">
        <div
        className="sign-in__wrapper"
        style={{ backgroundImage: `url(${BackgroundImage})` }}
      >
        {/* Overlay */}
      {/*  <div className="sign-in__backdrop"></div> */}
        {/* Form */}
        <Form className="shadow p-4 bg-white rounded" onSubmit={handleSubmit} o>
          {/* Header */}
          <img
            className="img-thumbnail mx-auto d-block mb-2"
            src={Logo}
            alt="logo"
          />
          <div className="h4 mb-2 text-center">Sign In</div>
          {/* ALert */}
          {show ? (
            <Alert
              className="mb-2"
              variant="danger"
              onClose={() => setShow(false)}
              dismissible
            >
              Incorrect username or password.
            </Alert>
          ) : (
            <div />
          )}
           { checked ? null :
          <div>
          <Form.Group className="mb-2" controlId="username" style={{textAlign:'left'}} >
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={inputUsername}
              placeholder="Username"
              onChange={(e) => setInputUsername(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-2" controlId="password" style={{textAlign:'left'}}>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={inputPassword}
              placeholder="Password"
              onChange={(e) => setInputPassword(e.target.value)}
              required
            />
          </Form.Group>
          {!loading ? (
            <Button className="w-100" variant="primary" type="submit">
              Log In
            </Button>
          ) : (
            <Button className="w-100" variant="primary" type="submit" disabled>
              Logging In...
            </Button>
          )}
          </div>}
          <div className="d-grid justify-content-end">
            <div className="form-group" style={{textAlign:'left', paddingTop:'10px'}}>
      <input className="form-check-input" type="checkbox" id="fj_ezz" name="fj_ezz" onChange={handleClick} defaultChecked={checked} />&nbsp;
  <label className="text-muted px-0">Forgot password?</label>
        </div>
          </div>
          { checked ? 
          <div>
          <Form.Group className="mb-2" controlId="username" style={{textAlign:'left'}}>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="text"
              value={email}
              placeholder="Username"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Button className="w-100" variant="primary" onClick={handlePassword}>
              Reset Password
            </Button>
            </div>
            :null}
            <br/>
        {message && (
            <div className="form-group">
              <div className="alert alert-danger" role="alert">
                {message}
              </div>
            </div>
          )}
          {messagegood && (
            <div className="form-group">
              <div className="alert alert-success" role="alert">
                {messagegood}
              </div>
            </div>
          )}
        </Form>

        
        
        {/* Footer */}
      
        </div>
        <div className="w-100 mb-2 position-absolute bottom-0 start-50 translate-middle-x text-white text-center">
          Pacific Community (SPC)| &copy;2024
        </div>
      </div>
      </div>
      </main>
      </>
    );
}

export default Login;