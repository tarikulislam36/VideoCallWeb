const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 9860 });
const availableUsers = new Set();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'NewUser':
                ws.userId = data.UserID;
                availableUsers.add(ws);
                findAndConnectUsers();
                break;
            case 'NextCall':
                handleNextCall(ws);
                break;
            case 'FindNewUser':
                availableUsers.add(ws);
                findAndConnectUsers();
                break;
        }
    });

    ws.on('close', () => {
        availableUsers.delete(ws);
    });
});

function findAndConnectUsers() {
    if (availableUsers.size >= 2) {
        const [user1, user2] = availableUsers;
        availableUsers.delete(user1);
        availableUsers.delete(user2);

        const user1Id = user1.userId;
        const user2Id = user2.userId;

        user1.send(JSON.stringify({ type: 'ConnectToPeer', UserID: user2Id }));
        user2.send(JSON.stringify({ type: 'ConnectToPeer', UserID: user1Id }));
    }
}

function handleNextCall(ws) {
    // Notify the other user to reset their call and find a new connection
    ws.send(JSON.stringify({ type: 'NextCall' }));

    // Add the user back to the available list and find new users to connect with
    availableUsers.add(ws);

    findAndConnectUsers();
}
