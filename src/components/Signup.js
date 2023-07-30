import React, { useState } from "react";
import "./Enter.css";
import { useNavigate } from "react-router-dom";
import { Convert } from "mongo-image-converter";

export default function Signup() {
  const navigate = useNavigate();
  const [creds, setCreds] = useState({
    Username: "",
    Password: "",
    Email: "",
    description: "",
  });
  const [error, changeerror] = useState(null);
  const [Imagefile, changeImage] = useState("");

  const change = (event) => {
    setCreds({ ...creds, [event.target.placeholder]: event.target.value });
  };

  const makeReq = async () => {
    try {
      const convertedImage = await Convert(Imagefile);
      if (convertedImage) {
        let jwt = await fetch("http://localhost:8000/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: creds.Username,
            email: creds.Email,
            password: creds.Password,
            description: creds.description,
            image:convertedImage
          }),
        });

        const js = await jwt.json();

        if (js.error) {
          changeerror(js.error);
        } else {
          changeerror(null);
          localStorage.setItem("token", js.token);
          navigate("/Home");
        }
      } else {
        changeerror("Incomplete form");
      }
    } catch (error) {
      changeerror("An error occured");
    }
  };

  return (
    <>
      <div className="container">
        <h1 className="element">Signup</h1>
        <small style={{ color: "red" }}>{error}</small>
        <input
          type="email"
          placeholder="Email"
          className="element"
          onChange={change}
        />
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
        <label htmlFor="" className="element">
          Tell us something about yourself:{" "}
        </label>
        <textarea
          type="text"
          className="element"
          placeholder="description"
          onChange={change}
        ></textarea>
        <label htmlFor="" className="element">
          Upload your Profile pic:
        </label>
        <input
          type="file"
          className="form-control-file"
          name="uploaded_file"
          onChange={(e) => changeImage(e.target.files[0])}
        />
        <div className="element">
          <button type="submit" className="element" onClick={makeReq}>
            Submit
          </button>
        </div>
      </div>
    </>
  );
}
