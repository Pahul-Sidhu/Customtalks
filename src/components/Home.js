import React, { useState, useEffect, useRef } from "react";
import "./Home.css";
import socketIOClient from "socket.io-client";

export default function Home(props) {
  const [channelList, modifyList] = useState([]);
  const [toggleChannels, changetoggleChannels] = useState("");
  const [toggleAddChannels, changetoggleAddChannels] = useState("inv");
  const [infostyle, changeinfoStyle] = useState({});
  const [detailsstyle, changedetailsStyle] = useState({});
  const [creds, setCreds] = useState({ name: "", description: "" });
  const [error, changeerror] = useState(null);
  const [success, changesuccess] = useState(null);
  const [stl, changestl] = useState({});
  const [chats, modifyChat] = useState([]);
  const [comment, changecomm] = useState("");
  const [nm, setname] = useState("");
  const [channel, setchannel] = useState("");
  const [members, setmembers] = useState([]);
  const socket = useRef();

  const view = () => {
    changetoggleChannels("");
    changetoggleAddChannels("inv");
    getList();
    changeerror(null);
  };

  const add = () => {
    changetoggleAddChannels("create");
    changetoggleChannels("inv");
    changeerror(null);
  };

  const getChats = async (value) => {
    const chats = await fetch("http://localhost:8000/chatlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": `${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        name: value,
      }),
    });
    let dt = await chats.json();
    modifyChat(dt.results);
    setname(dt.name);
  };

  const post = async () => {
    if (comment.trim().length > 0) {
      let pass = await fetch("http://localhost:8000/createchat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": `${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: channel,
          comment: comment,
        }),
      });
      socket.current.emit("message", {
        chat: comment,
        token: localStorage.getItem("token"),
        server: channel,
      });
    }
    changecomm("");
  };

  const track = (e) => {
    changecomm(e.target.value);
  };

  const showinfo = (e) => {
    var x = window.matchMedia("(max-width: 850px)");
    if (x.matches) {
      changeinfoStyle({
        display: "block",
        margin: "0",
      });
      changedetailsStyle({
        display: "none",
      });
    }
  };

  const showdetail = (e) => {
    setchannel(channelList[e.target.getAttribute("data-key")]);
    var x = window.matchMedia("(max-width: 850px)");
    if (x.matches) {
      changeinfoStyle({
        display: "none",
      });
      changedetailsStyle({
        display: "block",
        margin: "0",
      });
    }
  };

  const getList = async () => {
    const pass = await fetch("http://localhost:8000/channellist", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "auth-token": `${localStorage.getItem("token")}`,
      },
    });
    let dt = await pass.json();
    modifyList(dt.channels);
  };

  const makeReq = async () => {
    const pass = await fetch("http://localhost:8000/createchannel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": `${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        name: creds.name,
        tags: creds.description,
      }),
    });

    const js = await pass.json();

    if (js.error) {
      changeerror(js.error);
      changesuccess(null);
      changestl({ color: "red" });
    } else {
      changeerror(null);
      changesuccess(js.success);
      changestl({ color: "green" });
      getList();
    }
  };

  const getmembers = async (chann) => {
    const pass = await fetch("http://localhost:8000/getmembers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: chann,
      }),
    });

    const js = await pass.json();
    setmembers(js.members);
    console.log(js.members);
  };

  const del = async (e) => {
    const pass = await fetch("http://localhost:8000/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": `${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        name: channelList[e.target.getAttribute("data-key")],
      }),
    });

    const js = await pass.json();
    if (js.message) {
      changeerror(js.message);
    } else if (js.success) {
      var newarr = [...channelList];
      newarr.splice(e.target.getAttribute("data-key"), 1);
      modifyList(newarr);

      if (channel === channelList[e.target.getAttribute("data-key")]) {
        setchannel("");
        modifyChat([]);
      }
    }
  };

  const leave = async () => {
    if (
      window.confirm(
        "If you are an admin and leave, channel will be deleted as well. Click OK to proceed"
      )
    ) {
      const pass = await fetch("http://localhost:8000/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": `${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: channel,
        }),
      });
      const js = await pass.json();
      modifyList((e) => e.filter((d) => d !== channel));

      setchannel("");
      modifyChat([]);
    }
  };

  const change = (event) => {
    setCreds({ ...creds, [event.target.placeholder]: event.target.value });
  };

  useEffect(() => {
    getList();

    if (channel.length > 0) {
      getChats(channel);
      getmembers(channel);
    }

    socket.current = socketIOClient("http://localhost:8000");
    socket.current.on("connect", () => {
      console.log("client connected");
    });
    socket.current.on("return", (msg) => {
      if (`${msg.server}` === channel) {
        modifyChat((oldArray) => [...oldArray, msg]);
      }
    });
    return () => {
      socket.current.off("connect");
      socket.current.off("return");
    };
  }, [channel]);

  return (
    <>
      <div className="content">
        <div className="info" style={infostyle}>
          <div id="icon">
            <p className="icon2" onClick={view}>
              Channels
            </p>
            <i className="fa-solid fa-plus icon2" onClick={add}></i>
          </div>
          <hr />
          <div id="channels" className={toggleChannels}>
            <p>Your channels</p>
            <small style={{ color: "red" }}>{error ? error : ""}</small>
            <ul>
              {channelList.map((e) => {
                return (
                  <li key={channelList.indexOf(e)}>
                    {e}{" "}
                    <button
                      className="btn3"
                      onClick={del}
                      data-key={channelList.indexOf(e)}
                    >
                      delete
                    </button>{" "}
                    <button
                      className="btn3"
                      onClick={showdetail}
                      data-key={channelList.indexOf(e)}
                    >
                      chat
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className={toggleAddChannels}>
            <small style={stl}>{error ? error : success}</small>
            <input
              type="text"
              placeholder="name"
              className="element"
              onChange={change}
            />
            <input
              type="text"
              placeholder="description"
              className="element"
              onChange={change}
            />
            <div className="element">
              <button type="submit" className="element" onClick={makeReq}>
                Create
              </button>
            </div>
          </div>
        </div>

        <div className="details" style={detailsstyle}>
          <div className="channelnav">
            {channel.length > 0 ? (
              <ul className="channelcomp">
                <li>
                  <button className="btn3" id="channellist" onClick={showinfo}>
                    Back
                  </button>
                </li>
                <li>
                  <div className="dropdown">
                    Members
                    <div className="dropdown-content">
                      {members.map((e) => {
                        return <small key={members.indexOf(e)}>{e}</small>;
                      })}
                    </div>
                  </div>
                </li>
                <li>{channel.toUpperCase()}</li>
                <li>
                  <button className="btn3" onClick={leave}>
                    Leave
                  </button>
                </li>
              </ul>
            ) : (
              <ul className="channelcomp">
                <li>
                  <button className="btn3" id="channellist" onClick={showinfo}>
                    Back
                  </button>
                </li>
              </ul>
            )}
          </div>
          {chats.length > 0 &&
            chats.map((e) => {
              return e.name !== nm ? (
                <div className="others" key={chats.indexOf(e)}>
                  <p>{e.chat}</p><small className="nameofuser">{e.name}</small>
                </div>
              ) : (
                <div className="mine" key={chats.indexOf(e)}>
                  <p>{e.chat}</p><small className="nameofuser">{e.name}</small>
                </div>
              );
            })}
          {channel.length > 0 && (
            <div className="chatbox">
              <input
                type="text"
                placeholder="Send a message"
                onChange={track}
                value={comment}
              />
              <i className="fa-solid fa-comment" onClick={post}></i>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
