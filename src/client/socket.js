const socketClient = new WebSocket("wss://jimmy.genj.io/wss");
socketClient.onmessage = function(event) {
    var msgData = JSON.parse(event.data);

    //Request Handling
    if (msgData.hasOwnProperty('requestID')) {
        HandleRequests(msgData.requestID, msgData);
        return;
    }

}

const STARTUP_EVENTS = [];

function AddStartupEvent(callable) {
    STARTUP_EVENTS.push(callable);
}

socketClient.onopen = function(event) {
    STARTUP_EVENTS.map(v => v());
}

export {AddStartupEvent};

setInterval(function() {
    socketClient.send(JSON.stringify({
        type: 'ping',
    }));
}, 30000);

var requestID = 0;
const REQUEST_LIST = {};

function RequestSever(type, data) {
    requestID++;

    socketClient.send(JSON.stringify({
        type: type,
        data: data,
        requestID: requestID,
    }));

    return new Promise(function(resolve, reject) {
        REQUEST_LIST[requestID] = {
            resolve: resolve,
            reject: reject,
            stamp: new Date(),
        };
    });
}

export {RequestSever};

function HandleRequests(requestID, data) {
    if (!REQUEST_LIST.hasOwnProperty(requestID)) return;
    var request = REQUEST_LIST[requestID];

    if (data.error) {
        request.reject(data.data);
    } else {
        request.resolve(data.data);
    }

    delete REQUEST_LIST[requestID];
}

export default socketClient;