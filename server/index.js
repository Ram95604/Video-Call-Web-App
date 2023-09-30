const { Server } = require("socket.io");


const io = new Server(8000,{
    cors: true,    // isko humne true isliye kiya because our frontend is on 3000 and backend 8000 therefore browser is blocking our server for securit reasons
});

const emailToSocketIdMap=new Map();     // this tracks ki kaunsi email kaunsi roomid mein hai
const socketIdToEmailMap=new Map();

io.on("connection", (socket) => {
    console.log(`Socket Connected`, socket.id);
    socket.on("room:join",(data)=>{
        const {email,room}=data;
        emailToSocketIdMap.set(email,socket.id);
        socketIdToEmailMap.set(socket.id,email);
        io.to(room).emit("user:joined",{email,id:socket.id})
        socket.join(room);
        io.to(socket.id).emit("room:join",data);
    });
    

    socket.on("user:call",({to,offer})=>{
        io.to(to).emit("incoming:call",{from:socket.id,offer});
    });
    socket.on("call:accepted",({to,ans})=>{
        io.to(to).emit("call:accepted",{from:socket.id,ans});

    });
    socket.on("peer:nego:needed",({to,offer})=>{
        console.log("peer:nego:needed",offer);
        io.to(to).emit("peer:nego:needed",{from:socket.id,offer});
    });

    socket.on("peer:nego:done",({to,ans})=>{
        console.log("peer:nego:done",ans);
        io.to(to).emit("peer:nego:final",{from:socket.id,ans});

    });
});
