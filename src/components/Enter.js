import React, {useState} from "react";
import "./Enter.css";
import { useNavigate } from "react-router-dom"

export default function Enter() {
  const navigate = useNavigate()
  const [creds, setCreds] = useState({Username:"", Password:""}); 
  const [error, changeerror] = useState(null);

  const change = (event) => {
    setCreds({...creds, [event.target.placeholder] : event.target.value})
  };

  const makeReq = async () => {
    let jwt = await fetch("http://localhost:8000/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: creds.Username,
        password: creds.Password
      })
    });
    const js = await jwt.json();
    if(js.error){
      changeerror(js.error);
    }else{
      changeerror(null);
      localStorage.setItem('token', js.token);
      navigate('/Home')
    }
  };

  const goSignup = ()=>{
    navigate('Signup')
  }

  return (
    <>
      <div className="container">
        <h1 className="element">Login</h1>
        <small style={{"color":"red"}}>{error}</small>
        <input
          type="text"
          placeholder="Username"
          className="element"
          onChange={change}
        />
        <input
          type="password"
          placeholder="Password"
          className="element"
          onChange={change}
        />
        <div className="element" >
          <button type="submit" className="element" onClick={makeReq}>
            Login
          </button>
          <button type="submit" className="element" onClick={goSignup}>
            Signup
          </button>
        </div>
      </div>
    </>
  );
}
