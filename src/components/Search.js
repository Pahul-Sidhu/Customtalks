import "./Search.css";
import React, { useState, useEffect } from "react";

export default function Search() {
  const [users, setusers] = useState([]);
  const [box, setbox] = useState("");
  const [channels, setchannels] = useState([])
  const [msg, setmsg] = useState("");

  const getchannels = async () => {
      let pass = await fetch("http://localhost:8000/getchannels", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      let content = await pass.json();
      setchannels(content.list);
    }

  const modify = (e) => {
    setbox(e.target.value);
  };

  const fetchusers = async () => {
    if (box.length > 0) {
      let pass = await fetch("http://localhost:8000/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": `${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: box,
        }),
      });
      let content = await pass.json();

      if (content.nothing) {
        setusers([]);
      } else {
        setusers((users) => [...users, content]);
      }

      setbox("");
    }
  };
  
  const invite = async (e) => {
    let pass = await fetch("http://localhost:8000/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": `${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          channel: channels[e.target.getAttribute("data-key")],
          user: users[0].username
        }),
      });
      let content = await pass.json();
      setmsg(content.message)
  }

  useEffect(()=> {
    getchannels()
  }, [])

  return (
    <>
      <div className="Searchbar">
        <input type="text" placeholder="Search" value={box} onChange={modify} />
        <button onClick={fetchusers}>Search</button>
      </div>

      <div className="userlist">
        {users.length === 0 ? (
          "No user found"
        ) : (
          <div className="user">
            <img src={users[0].image} alt="" />

            <div>
            {msg.length > 0 && <small id="message" style={{"color":"green"}}>{msg}</small>}
              <p className="items">username : {users[0].username}</p>
              <p className="items">description: {users[0].description}</p>
              <div className="dropdown">
                <button className="items">invite</button>
                <div className="dropdown-content">
                  {channels.map((r) => {
                    return <small data-key={channels.indexOf(r)} key={channels.indexOf(r)} onClick={invite}>{r}</small>
                  })}
                  
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
