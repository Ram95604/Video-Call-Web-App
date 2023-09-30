import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div className="lobbyfull">
      <h1 style={{fontSize:"xxx-large",color:"white"}}>Lobby <span style={{color:"#00abf0"}}>Area!</span></h1>
      <div className="formstart">

        <form onSubmit={handleSubmitForm} style={{maxWidth:"60rem",margin:"0 auto",textAlign:"cenetr"}}>
          <div className="input-box">
            <div className="input-field">
              <input type="text" placeholder="First Name"  style={{width:"80%",height:"20%",padding:"1.5rem",fontSize:"1.6rem",color:"#ededed",background:"transparent",borderRadius:".6rem",border:".2rem solid #00abf0",marginTop:"90px"}}/>

            </div>
            <div className="input-field">
              <input type="text"  placeholder="Last Name" style={{width:"80%",height:"20%",padding:"1.5rem",fontSize:"1.6rem",color:"#ededed",background:"transparent",borderRadius:".6rem",border:".2rem solid #00abf0",marginTop:"90px"}}/>

            </div>
          </div>
          <div className="input-box">

            <div className="input-field">
              <input
                type="email"
                placeholder="Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)} style={{width:"80%",height:"20%",padding:"1.5rem",fontSize:"1.6rem",color:"#ededed",background:"transparent",borderRadius:".6rem",border:".2rem solid #00abf0",marginTop:"10px"}}
              />
            </div>
            <div className="input-field">
              <input
                type="text"
                placeholder="Room Number"
                value={room}
                onChange={(e) => setRoom(e.target.value)}  style={{width:"80%",height:"20%",padding:"1.5rem",fontSize:"1.6rem",color:"#ededed",background:"transparent",borderRadius:".6rem",border:".2rem solid #00abf0",marginTop:"10px"}}
              />
              
            </div>
          </div>

          <div className="textarea-field">
            <textarea name="" id="" cols="25" rows="7" placeholder="Any Message for your friend"  style={{width:"100%",height:"100%",padding:"1.5rem",fontSize:"1.6rem",color:"#ededed",background:"transparent",borderRadius:".6rem",border:".2rem solid #00abf0",marginTop:"20px"}}></textarea>
          </div>
          
          <div className="btn-box btns">
            <button style={{width:"150px",height:"40px",marginTop:"15px",fontSize:"25px",cursor:"pointer",fontWeight:"bold",borderRadius:"15px"}}>Join</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LobbyScreen;
