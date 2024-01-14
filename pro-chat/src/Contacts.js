import Avatar from "./Avatar";



const Contacts = ({ userId, onClick, selected, username, isOnline }) => {


    return (
        <div onClick={onClick}
            className={'border-b border-gray-100 flex items-center gap-2 cursor-pointer ' + (selected ? 'bg-blue-50' : '')}>
            {selected && (
                <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
            )}
            <div className="flex items-center gap-2 py-2 pl-4 ">
                <Avatar username={username} userId={userId} online={isOnline} />
                <span className="text-gray-800 font-bold">
                    {username}
                </span>
            </div>
        </div>
    );
}


export default Contacts;