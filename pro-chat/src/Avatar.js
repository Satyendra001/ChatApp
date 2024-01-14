const Avatar = ({ userId, username, online }) => {
    const colors = ['bg-red-200',
        'bg-cyan-200', 'bg-teal-200',
        'bg-pink-200',
        'bg-yellow-200', 'bg-blue-200'
    ];

    const roundedUserId = parseInt(userId, 16);
    const colorIndex = roundedUserId % colors.length;
    const color = colors[colorIndex];
    // console.log(roundedUserId, colorIndex, "  ", userId)

    return (
        <div className={"relative rounded-full w-8 h-8 flex items-center " + color}>
            <div className="text-center w-full opacity-70">
                {username[0]}
            </div>
            {online && (
                <div className="w-3 h-3 bg-green-400 absolute right-0 bottom-0 rounded-lg border border-white "></div>
            )}
            {!online && (
                <div className="w-3 h-3 bg-gray-400 absolute right-0 bottom-0 rounded-lg border border-white "></div>
            )}
        </div>
    )

}


export default Avatar;