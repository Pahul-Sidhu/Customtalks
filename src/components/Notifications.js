import { React, useEffect, useState } from "react";
import "./Notifications.css";
export default function Notifications() {
  const [notiflist, modnotifs] = useState([]);

  const fetchnotifs = async () => {
    let pass = await fetch("http://localhost:8000/notifs", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "auth-token": `${localStorage.getItem("token")}`,
      },
    });
    let content = await pass.json();
    if (content.notifs) {
      modnotifs(content.notifs);
    }
  };

  useEffect(() => {
    fetchnotifs();
  }, []);

  const decide = async (e) => {
    if (e.target.getAttribute("data-key").includes("accept")) {
      let ind = parseInt(
        e.target.getAttribute("data-key").replace("accept", "")
      );
      let pass = await fetch("http://localhost:8000/acceptuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": `${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          channel: notiflist[ind].channel,
          invited: notiflist[ind].invitedby,
        }),
      });
      let content = await pass.json();
      modnotifs((e) => notiflist.indexOf(e) === ind);
    } else {
      let ind = parseInt(
        e.target.getAttribute("data-key").replace("decline", "")
      );
      let pass = await fetch("http://localhost:8000/declineuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": `${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          channel: notiflist[ind].channel,
          invited: notiflist[ind].invitedby,
        }),
      });
      let content = await pass.json();
      modnotifs((e) => notiflist.indexOf(e) === ind);
    }
  };

  return (
    <>
      <h1>Your notifications</h1>
      <div className="notifications">
        {notiflist.length > 0 && notiflist.map((e) => {
          return (
            <div className="notifs" key={notiflist.indexOf(e)}>
              <p>
                A user named {e.invitedby} has invited you to join channel named{" "}
                {e.channel}
              </p>
              <div className="decisions">
                <button
                  data-key={notiflist.indexOf(e) + "accept"}
                  onClick={decide}
                >
                  Accept
                </button>
                <button
                  data-key={notiflist.indexOf(e) + "decline"}
                  onClick={decide}
                >
                  Decline
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
