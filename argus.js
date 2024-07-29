const MESSAGE_ARGUS_TOKEN_REFRESH = "argus-token-refresh";
const MESSAGE_ARGUS_TOKEN_REQUEST = "argus-token-request";
const MESSAGE_ARGUS_TOKEN_RESPONSE = "argus-token-response";

const ArgusJS = function(token, mdrUrl) {
    let currentToken = token;

    window.addEventListener("message", (event) => {
        if (event.data.argusMessageId === MESSAGE_ARGUS_TOKEN_REFRESH) {
            currentToken = event.data.token;
        }
    }, false);

    return {
        get: (url) => fetch(`${mdrUrl}${url}`, { "method": "GET", "headers": { "Authorization": "Bearer " + currentToken.access } }),
        post: (url, data) => fetch(`${mdrUrl}${url}`, { "method": "POST", "headers": { "Authorization": "Bearer " + currentToken.access }, body: JSON.stringify(data) }),
        put: (url, data) => fetch(`${mdrUrl}${url}`, { "method": "PUT", "headers": { "Authorization": "Bearer " + currentToken.access }, body: JSON.stringify(data) }),
        patch: (url, data) => fetch(`${mdrUrl}${url}`, { "method": "PATCH", "headers": { "Authorization": "Bearer " + currentToken.access }, body: JSON.stringify(data) }),
        delete: (url) => fetch(`${mdrUrl}${url}`, { "method": "DELETE", "headers": { "Authorization": "Bearer " + currentToken.access } }),
        graphQL: (query) => fetch(mdrUrl + "/api/graphql/json", { "method": "POST", "headers": { "Accept": "application/json", "Content-Type": "application/graphql", "Authorization": "Bearer " + currentToken.access}, body: query})
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
        top.postMessage({ argusMessageId: MESSAGE_ARGUS_TOKEN_REQUEST, requestId }, "*")
    })
};