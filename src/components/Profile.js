import React, { useEffect, useState } from "react";
import './Profile.css'

export default function Profile() {
  const [creds, setCreds] = useState({ email: "", username: "", description: ""});
  const [image, setimg] = useState('');

  const fetchdata = async () => {
    let details = await fetch("http://localhost:8000/details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": `${localStorage.getItem("token")}`,
      },
    });
    let js = await details.json();
    setimg(js.image);
    setCreds({ email: js.email, username: js.username, description: js.description });
    // console.log(image);
  };

  useEffect(() => {
    fetchdata();
  });

  return (
    <>
      {localStorage.getItem("token") ? (
        <div className="container">
          <img src={image} alt="Nothing found" className="element"/> 
          <p className="element">Name : {creds.username}</p>
          <p className="element">Email :  {creds.email}</p>
          <p className="element">Description : {creds.description}</p>
        </div>
      ) :(
        <div className="container">
          Please sign in to view profile.
        </div>
      )}
    </>
  );
}
