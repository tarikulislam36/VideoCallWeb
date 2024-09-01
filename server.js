const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 3000 });
const clients = [];

server.on('connection', (socket) => {
    console.log('New client connected');
    clients.push(socket);

    socket.on('message', (message) => {
        const data = JSON.parse(message);
        
        // When a client is ready to connect (wants to make a random call)
        if (data.type === 'ready') {
            // Find a random client that is not the current one and is not in a call
            const availableClients = clients.filter(client => client !== socket && client.readyState === WebSocket.OPEN);
            const randomClient = availableClients[Math.floor(Math.random() * availableClients.length)];
            
            if (randomClient) {
                // Send the current client's Peer ID to the random client
                randomClient.send(JSON.stringify({ type: 'offer', peerId: data.peerId }));

                // Send the random client's Peer ID to the current client
                socket.send(JSON.stringify({ type: 'offer', peerId: randomClient.peerId }));
            } else {
                // If no other clients are available, wait for another client to connect
                console.log('No available clients to connect.');
            }
        }
    });

    socket.on('close', () => {
        console.log('Client disconnected');
        const index = clients.indexOf(socket);
        if (index !== -1) {
            clients.splice(index, 1);
        }
    });

    socket.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

console.log('WebSocket signaling server is running on ws://localhost:3000');
