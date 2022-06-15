const socket = io("/");

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "443",
});

const user = prompt("Enter your name");

const myVideo = document.createElement("video");
myVideo.muted = true;

let myStream;

navigator.mediaDevices
    .getUserMedia({
        audio: true,
        video: true,
    })
    .then((stream) => {
        myStream = stream;
        addVideoStream(myVideo, stream);
        socket.on("user-connected", (userId)=>{
            connectToUser(userId, stream);
        })
        peer.on("call",(call)=>{
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream",(user_stream)=>{
                addVideoStream(video, user_stream)
            })
        })
    })

function connectToUser(id, stream){
    const call = peer.call(id, stream);
    const video = document.createElement("video");
    call.on("stream",(user_stream)=>{
        addVideoStream(video, user_stream)
    })
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
        $("#video_grid").append(video)
    });
};

$(function () {
    $("#show_chat").click(function () {
        $(".left-window").css("display", "none")
        $(".right-window").css("display", "block")
        $(".header_back").css("display", "block")
    })
    $(".header_back").click(function () {
        $(".left-window").css("display", "block")
        $(".right-window").css("display", "none")
        $(".header_back").css("display", "none")
    })

    $("#send").click(function () {
        if ($("#chat_message").val().length !== 0) {
            socket.emit("message", $("#chat_message").val());
            $("#chat_message").val("");
        }
    })

    $("#chat_message").keydown(function (e) {
        if (e.key == "Enter" && $("#chat_message").val().length !== 0) {
            socket.emit("message", $("#chat_message").val());
            $("#chat_message").val("");
        }
    })

    $("#stop_video").click(function(e){
        const enabled = myStream.getVideoTracks()[0].enabled;
        if(enabled){
            myStream.getVideoTracks()[0].enabled = false
            e = `<i class = "fas fa-video-slash"></i>`
            $("#stop_video").toggleClass("background_red")
            $("#stop_video").html(e)
        }
        else{
            myStream.getVideoTracks()[0].enabled = true
            e = `<i class = "fas fa-video"></i>`
            $("#stop_video").toggleClass("background_red")
            $("#stop_video").html(e)
        }
    })

    $("#mute_button").click(function(e){
        const enabled = myStream.getAudioTracks()[0].enabled;
        if(enabled){
            myStream.getAudioTracks()[0].enabled = false
            e = `<i class = "fas fa-michrophone-slash"></i>`
            $("#mute_button").toggleClass("background_red")
            $("#mute_button").html(e)
        }
        else{
            myStream.getVideoTracks()[0].enabled = true
            e = `<i class = "fas fa-michrophone"></i>`
            $("#mute_button").toggleClass("background_red")
            $("#mute_button").html(e)
        }
    })
})



peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id, user);
});

socket.on("createMessage", (message, userName) => {
    $(".messages").append(`
        <div class="message">
            <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName
        }</span> </b>
            <span>${message}</span>
        </div>
    `)
});