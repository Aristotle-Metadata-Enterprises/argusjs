const MESSAGE_ARGUS_TOKEN_REFRESH = "argus-token-refresh";
const MESSAGE_ARGUS_TOKEN_REQUEST = "argus-token-request";
const MESSAGE_ARGUS_TOKEN_RESPONSE = "argus-token-response";

const ArgusJS = function(token) {
    let currentToken = token;

    window.addEventListener("message", (event) => {
        if (event.data.argusMessageId === MESSAGE_ARGUS_TOKEN_REFRESH) {
            currentToken = event.data.token;
        }
    }, false);

    return {
        token: () => currentToken,
        get: (url) => fetch(url, { "method": "GET", "headers": { "Authorization": "Token " + currentToken } })
    }
}

const initArgusJS = function() {
    return new Promise((resolve) => {
        const requestId = Date.now();

        const argusTokenResponseHandler = function(event) {
            if (event.data.argusMessageId === MESSAGE_ARGUS_TOKEN_RESPONSE && event.data.requestId === requestId) {
                resolve(ArgusJS(event.data.token));
                window.removeEventListener("message", argusTokenResponseHandler)
            }
        }

        window.addEventListener("message", argusTokenResponseHandler, false);
        top.postMessage({ argusMessageId: MESSAGE_ARGUS_TOKEN_REQUEST, requestId })
    })
};