import { useContext, useState, useEffect, useRef } from "react";
import Logo from "./Logo";
import { UserContext } from "./UserContext";
import lodash from 'lodash';
import { APICall } from "./utility/utils";
import { All_Users, Fetch_Messages } from "./utility/Urls";
import Contacts from "./Contacts";

const Home = () => {
    const [webSS, setWebSS] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [offlineUsers, setOfflineUsers] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [newMessageText, setNewMessageText] = useState("");
    const [messages, setMessages] = useState([]);
    const { loggedUser, id } = useContext(UserContext);
    const divUnderMessage = useRef();

    useEffect(() => {
        connectToWebSocket();
    }, [])

    const connectToWebSocket = () => {
        // This is the default urls format for the web socket that are created in the backend
        const ws = new WebSocket('ws://localhost:4000');
        setWebSS(ws);
        ws.addEventListener('message', handleMessage);
        ws.addEventListener('close', () => {
            // We don't want to immediately reconnect
            setTimeout(() => {
                console.log("Disconnected. Trying to reconnect...");
                connectToWebSocket();
            }, 1000);
        });
    }

    const showOnlinePeople = (people) => {
        var uniquePeople = {};

        people.forEach(p => {
            uniquePeople[p.userId] = p.username;
        });

        setOnlineUsers(uniquePeople);
    }

    const handleMessage = (e) => {
        const messageData = JSON.parse(e.data);
        console.log(messageData, e)
        if ('online' in messageData) {
            showOnlinePeople(messageData.online);
        }
        else if ('text' in messageData) {
            // Handle the incoming text from the sender and display only to that recipient
            setMessages(prev => ([...prev, { ...messageData }]))
        }

    }

    // We need to send the message on our socket server
    const sendMessage = (e) => {
        e.preventDefault();
        webSS.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessageText,
        }));

        setNewMessageText('');

        setMessages(prev => ([...prev, {
            text: newMessageText,
            recipient: selectedUserId,
            sender: id,
            _id: Date.now()
        }]));


    }

    useEffect(() => {
        const div = divUnderMessage.current;
        if (div) {
            div.scrollIntoView(false, { behaviour: 'smooth', block: 'end ' });
        }
    }, [messages]);

    // Another Use effect to grab the messages from the db
    useEffect(() => {
        if (selectedUserId) {
            APICall({
                url: Fetch_Messages + `/${selectedUserId}`,
                method: 'get',
                successCallBack: (response) => {
                    console.log("Messages from DB ", response);
                    setMessages(response.data);
                }
            });
        }
    }, [selectedUserId]);

    useEffect(() => {
        APICall({
            url: All_Users,
            method: "get",
            successCallBack: (response => {
                console.log("All users==>", response.data);
                const offlineUsersArray = response.data
                    .filter(user => user._id !== id && !Object.keys(onlineUsers).includes(user._id));

                const offlineUsers = {};
                offlineUsersArray.forEach(user => {
                    offlineUsers[user._id] = user.username;
                });

                setOfflineUsers(offlineUsers);
            })

        });
    }, [onlineUsers]);

    var messagesWithoutDupes = lodash.uniqBy(messages, '_id');
    console.log("offline and online Users ---> ", offlineUsers, onlineUsers);

    console.log("Hello", onlineUsers);
    return (
        <div className="h-screen flex">
            <div className="w-1/3 bg-white">
                <Logo />
                {Object.keys(onlineUsers).map(userId => (
                    onlineUsers[userId] === loggedUser ? "" : (
                        <Contacts
                            key={userId}
                            userId={userId}
                            isOnline={true}
                            onClick={() => setSelectedUserId(userId)}
                            selected={userId === selectedUserId}
                            username={onlineUsers[userId]} />
                    )
                ))}
                {Object.keys(offlineUsers).map(userId => (
                    offlineUsers[userId] === loggedUser ? "" : (
                        <Contacts
                            key={userId}
                            userId={userId}
                            isOnline={false}
                            onClick={() => setSelectedUserId(userId)}
                            selected={userId === selectedUserId}
                            username={offlineUsers[userId]} />
                    )
                ))}
            </div>
            <div className="w-2/3 bg-blue-300 flex flex-col p-2">
                <div className="flex-grow">
                    {!selectedUserId && (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-gray-300 font-bold">
                                &larr; Select a person from side bar
                            </div>
                        </div>
                    )}
                    {selectedUserId && (
                        <div className="relative h-full">
                            <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-1">
                                {messagesWithoutDupes.map(message => (
                                    <div key={message._id} className={(message.sender === id ? "text-right" : "text-left")}>
                                        <div className={" text-left inline-block p-2 my-2 rounded-md " + (message.sender === id ? "bg-blue-500" : "bg-white")}>
                                            {/* sender : {message.sender} <br />
                                            my id : {id} <br /> */}
                                            {message.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={divUnderMessage}></div>
                            </div>
                        </div>
                    )}
                </div>
                {selectedUserId && (
                    <form className="flex gap-2" onSubmit={sendMessage}>
                        <input type={'text'}
                            value={newMessageText}
                            onChange={e => setNewMessageText(e.target.value)}
                            className=" bg-white rounded-sm border p-2 flex-grow"
                            placeholder="Type your messages here" />

                        <button type="submit" className="bg-blue-500 rounded-sm text-white p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>

                        </button>
                    </form>
                )
                }
            </div>
        </div >
    )
}

export default Home;