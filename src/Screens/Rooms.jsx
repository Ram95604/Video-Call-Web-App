import React, {useEffect,useCallback,useState} from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../Services/peer";
import { useNavigate } from "react-router-dom";
import LobbyScreen from "./Lobby";
import { Route } from "react-router-dom";

const RoomPage=()=>{
    const socket=useSocket();
    const [remoteSocketId,setRemoteSocketId]=useState(null)
    const [myVideo,setmyVideo]=useState();
    const [remoteStream,setRemoteStream]=useState();
    const [isCallActive, setIsCallActive] = useState(false);

    
    const UserJoined=useCallback(({email,id})=>{
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id);
    },[]);
    <Route path="/" element={<LobbyScreen />}/>
    const navigate = useNavigate();

    
    const CallUser = useCallback(async () => {
        if (isCallActive) {
          setIsCallActive(false);
          navigate("/");
        } else {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
          const offer = await peer.getOffer();
          socket.emit("user:call", { to: remoteSocketId, offer });
      
          setIsCallActive(true);
          setmyVideo(stream);
        }
      }, [isCallActive, remoteSocketId, socket, peer,navigate]);
      
    
    const IncomingCall = useCallback(async({from,offer})=>{
        setRemoteSocketId(from);
        const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:true});
        setmyVideo(stream);
        console.log(`Incoming Call`,from,offer);
        const ans=await peer.getAnswer(offer);
        socket.emit("call:accepted",{to:from,ans});

    },[socket]);

    const sendStreams=useCallback(()=>{
        for(const track of myVideo.getTracks()){
            peer.peer.addTrack(track,myVideo);
        }
    },[myVideo]);

    const CallAccepted=useCallback(({from,ans})=>{
        peer.setLocalDescription(ans);
        console.log("call:accepted!");
        sendStreams();
        
    },[sendStreams]);


    const NegoNeeded=useCallback(async ()=>{
        const offer=await peer.getOffer();
        socket.emit("peer:nego:needed",{offer,to:remoteSocketId});

    },[remoteSocketId,socket]);

    useEffect(()=>{
        peer.peer.addEventListener("negotiationneeded",NegoNeeded);
        return()=>{
            peer.peer.removeEventListener("negotiationneeded",NegoNeeded);
        };
    },[NegoNeeded]);

    const NegoNeedIncoming=useCallback(async({from,offer})=>{
        const ans=await peer.getAnswer(offer);
        socket.emit("peer:nego:done",{to:from,ans});
    },[socket]);

    const NegoNeedFinal=useCallback(async({ans})=>{
        await peer.setLocalDescription(ans)
    },[]);

    useEffect(()=>{
        peer.peer.addEventListener("track",async(ev)=>{
            const remoteStream=ev.streams;
            console.log("GOT TRACKS");
            setRemoteStream(remoteStream[0]); 
        });
    },[]);

    useEffect(()=>{
        socket.on("user:joined",UserJoined);
        socket.on("incoming:call",IncomingCall);
        socket.on("call:accepted",CallAccepted);
        socket.on("peer:nego:needed",NegoNeedIncoming);
        socket.on("peer:nego:final",NegoNeedFinal);
        
        return ()=>{
            socket.off("user:joined",UserJoined);
            socket.off("incoming:call",IncomingCall);
            socket.off("call:accepted",CallAccepted);
            socket.off("peer:nego:needed",NegoNeedIncoming);
            socket.off("peer:nego:final",NegoNeedFinal);

        }
    },[socket,UserJoined,IncomingCall,CallAccepted,NegoNeedIncoming,NegoNeedFinal]);



    return(
        <div className="roomfull">
            <h1 style={{fontSize:"100px",color:"white",fontWeight:"700",WebkitTextStroke:"1.2px red"}}>Room <span style={{color:"#ededed"}}>Page</span></h1>
            <h4 style={{fontSize:"60px",color:"#ededed",marginTop:"40px",WebkitTextStroke:"1.2px red"}}>{remoteSocketId ? "Connected Successfully!!" : "wating for other person to join"}</h4>
            {remoteSocketId === null && (
      <div className="buffering-spinner"></div>
    )}
            {myVideo && <button onClick={sendStreams} style={{marginTop:"15px",width:"180px",height:"40px",fontSize:"25px",cursor:"pointer",fontWeight:"bold",borderRadius:"15px"}}>Share Video</button>}
            {
                remoteSocketId && <button onClick={CallUser} style={{width:"150px",height:"40px",marginLeft:"15px",fontSize:"25px",cursor:"pointer",fontWeight:"bold",borderRadius:"15px"}}>{isCallActive ? "Disconnect" : "CALL"}</button>
            }
            <div className="talking">
                {
                    myVideo && (
                        <>
                            <div className="texts">

                                <h1>My Video</h1>
                            </div>
                            <div>

                                <ReactPlayer 
                                    playing
                                    muted
                                    height="600px" 
                                    width="600px" 
                                    url={myVideo} />
                            </div>
                        </>
                    )
                }
                {
                    remoteStream && (
                        <>
                            <div className="texts">

                            <h1>Friend's Video</h1>
                            </div>
                            <div>

                            <ReactPlayer 
                                playing
                                muted
                                height="600px" 
                                width="600px" 
                                url={remoteStream} />
                            </div>
                        </>
                    )
                }
            </div>
        </div>
    );
};

export default RoomPage;