import React, {useEffect, useRef, useState} from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { Form, Button, Alert } from "react-bootstrap";
import "../css/signup.css";
import AuthService from "../services/auth.service";
import BackgroundImage from "../assets/images/oceanpic2.jpg";
import Logo from "../assets/images/spclogo.png";


const Signup = () => {
    let navigate = useNavigate();
    const [first_name, setFirst_name] = useState("");
    const [last_name, setLast_name] = useState("");
    const _isMounted = useRef(true);
    const [email, setEmail] = useState(" ");
    const [country, setCountry] = useState("");
    const [countrylist,setCountrylist] = useState([]);
    const [password, setPassword] = useState("");
    const [confirmpassword, setConfirmpassword] = useState("")
    const [checked, setChecked] = React.useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messagegood, setMessagegood] = useState("");

    const fetchcountry = () => {
        axios
          .get('https://opmdata.gem.spc.int/api/countries')
          .then((response) => {
            const { data } = response;
            if(response.status === 200){
                //check the api call is success by stats code 200,201 ...etc
                setCountrylist(data)
                
            }else{
                //error handle section 
            }
          })
          .catch((error) => console.log(error));
      };

    const handleSubmit = async (event) => {
      event.preventDefault();
      setLoading(true);
      setMessage("");
     await delay(500);
     console.log(first_name, last_name, email, country, password, confirmpassword)
     if (password !== confirmpassword){
      setMessage("Passwords do not match!");
     }
     else{
      setMessage('');
      AuthService.register(first_name, last_name, password, email, ["registered"], country).then(
        () => {
          console.log('success')
          navigate("/oceandata/login");
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
     }
     // console.log(`Username :${inputUsername}, Password :${inputPassword}`);
   /*   AuthService.login(inputUsername, inputPassword).then(
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
      );*/

    //  if (inputUsername !== "admin" || inputPassword !== "admin") {
    //    setShow(true);
    //  }
      setLoading(false);
    };
  
    useEffect(() => {  

        if (_isMounted.current){
          fetchcountry();
        }  
        return () => { _isMounted.current = false }; 
        },[]);

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
        <Form autocomplete="false" className="shadow p-4 bg-white rounded" onSubmit={handleSubmit}>
          {/* Header */}
          <img
            className="img-thumbnail mx-auto d-block mb-2"
            src={Logo}
            alt="logo"
          />
          <div className="h4 mb-2 text-center">Sign Up!</div>
          <br/>
          <div className="row">
          <div className="col-sm-6">
          <div className="form-group" style={{textAlign:'left'}}>
            <label htmlFor="exampleInputEmail2" >First Name</label>
            <input type="text" className="form-control " id="exampleInputEmail1" required aria-describedby="emailHelp" placeholder="First Name" onChange={(e) => setFirst_name(e.target.value)} value={first_name}/>
            </div>
          </div>
          <div className="col-sm-6">
          <div className="form-group" style={{textAlign:'left'}}>
    <label htmlFor="exampleInputEmail2" >Last Name</label>
    <input type="text" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" required placeholder="Last Name" onChange={(e) => setLast_name(e.target.value)} value={last_name}/>
    </div>
          </div>
          </div>
          <div className="row" style={{paddingTop:"10px"}}>
          <div className="col-sm-6">
          <div className="form-group" style={{textAlign:'left'}}>
            <label htmlFor="exampleInputEmail2" >Email</label>
            <input type="email" autoComplete='off'  className="form-control " id="exampleInputEmail1" required aria-describedby="emailHelp" placeholder="Email" onChange={(e) => setEmail(e.target.value)} value={email}/>
            </div>
          </div>
          <div className="col-sm-6">
          <div className="form-group" style={{textAlign:'left'}}>
    <label htmlFor="exampleInputEmail2" >Country</label>
    <select  className="form-select form-select-sm" required id="exampleInputEmail2" aria-label=".form-select-sm example"
              disabled={false}
              value={country}
              onChange={(e) => {
                setCountry(e.currentTarget.value)
                e.currentTarget.blur();}}
                
                
          >
            <option value="">-- Select --</option>
              {countrylist.map((item) => (
              <option key={item.country_code} value={item.country_code}>
                  {item.country_name}
              </option>
              ))}
          </select>
    </div>
          </div>
          </div>
          <div className="row" style={{paddingTop:"10px"}}>
          <div className="col-sm-6">
          <div className="form-group" style={{textAlign:'left'}}>
            <label htmlFor="exampleInputEmail2" >Password</label>
            <input type="password" className="form-control " required id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Password" onChange={(e) => setPassword(e.target.value)} value={password}/>
            </div>
          </div>
          <div className="col-sm-6">
          <div className="form-group" style={{textAlign:'left'}}>
    <label htmlFor="exampleInputEmail2" >Confirm Password</label>
    <input type="password" className="form-control" required id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Confirm Password" onChange={(e) => setConfirmpassword(e.target.value)} value={confirmpassword}/>
    </div>
          </div>
          </div>
          <br/>
          <div className="row" style={{paddingTop:"10px"}}>
          {!loading ? (
            <Button className="w-100" variant="primary" type="submit">
              Sign up
            </Button>
          ) : (
            <Button className="w-100" variant="primary" type="submit" disabled>
              Signing up...
            </Button>
          )}
            </div>
       
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

export default Signup;