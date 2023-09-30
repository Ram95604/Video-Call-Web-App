import React,{createContext, useContext,useMemo} from "react";
import {io} from "socket.io-client";

const SocketContext=createContext(null);

export const useSocket=()=>{
    const socket=useContext(SocketContext);
    return socket;
}; 

//this is basically a functional component and this provider will give access to socket to my whole application
export const SocketProvider=(props)=>{  
    const socket=useMemo(()=>io("localhost:8000"),[]);

    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    );

};