import socket from 'socket.io-client'
/* Three function will be created-1- This function will be create the web socket connection between client and Server
2- This function will receive the data
3- This function will send the data */

let socketInstance=null;

export const initializeSocket=(projectId)=>{

    socketInstance=socket("https://realtime-chat-app-with-google-gemini.onrender.com",{
        auth:{
            token:localStorage.getItem('token')
        },
        query:{
            projectId
        }
    });

    return socketInstance

}

export const receiveMessage=(eventName,cb)=>{
    socketInstance.on(eventName,cb);
}

export const sendMessage=(eventName,data)=>{
    socketInstance.emit(eventName,data);
}
