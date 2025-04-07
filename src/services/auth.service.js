import axios from "axios";
import Cookies from 'js-cookie';
import { get_url } from "../pages/urls";
const API_URL =  get_url('root-path')+"/ocean_api/api/auth/";

const register = (first_name, last_name, password, email, roles, country_id) => {
  return axios.post(API_URL + "signup", {
    first_name,
    last_name,
    password,
    email,
    roles,
    country_id
  });
};

const login = (email, password) => {
  return axios
    .post(API_URL + "signin", {
      email,
      password,
    })
    .then((response) => {
      if (response.data.accessToken) {
     //   localStorage.setItem("user", JSON.stringify(response.data));
        var inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 60 * 1000);
        Cookies.set('user', JSON.stringify(response.data), { expires: inFifteenMinutes });
       // Cookies.set('user', JSON.stringify(response.data), { expires: 0.5 });
      }

      return response.data;
    });
};

const forgot_password = (email) => {
  return axios
    .post(API_URL + "forgotpassword", {
      email
    })
    .then((response) => {
      return response.data;
    });
};


const logout = () => {
  Cookies.remove('user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};
const getCurrentUserCookie = () => {
  var cook = Cookies.get('user');
  if (cook !== undefined){
    cook = JSON.parse(Cookies.get('user'))
  }
 // var cook = JSON.parse(Cookies.get('user'))
  return cook;
};


const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
  forgot_password,
  getCurrentUserCookie
};

export default AuthService;
