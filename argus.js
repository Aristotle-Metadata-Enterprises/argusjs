const MESSAGE_ARGUS_TOKEN_REFRESH = "argus-token-refresh";
const MESSAGE_ARGUS_TOKEN_REQUEST = "argus-token-request";
const MESSAGE_ARGUS_TOKEN_RESPONSE = "argus-token-response";

const ArgusJS = function(token, mdr_url) {
    let currentToken = token;

    window.addEventListener("message", (event) => {
        if (event.data.argusMessageId === MESSAGE_ARGUS_TOKEN_REFRESH) {
            currentToken = event.data.token;
        }
    }, false);

    return {
        get: (url) => fetch(`${mdr_url}${url}`, { "method": "GET", "headers": { "Authorization": "Bearer " + currentToken.access } }),
        getById: (url, id) => fetch(`${mdr_url}${url}/${id}`, { "method": "GET", "headers": { "Authorization": "Bearer " + currentToken.access } }),
        post: (url, data) => fetch(`${mdr_url}${url}`, { "method": "POST", "headers": { "Authorization": "Bearer " + currentToken.access }, body: JSON.stringify(data) }),
        put: (url, id, data) => fetch(`${mdr_url}${url}/${id}`, { "method": "PUT", "headers": { "Authorization": "Bearer " + currentToken.access }, body: JSON.stringify(data) }),
        patch: (url, id, data) => fetch(`${mdr_url}${url}/${id}`, { "method": "PATCH", "headers": { "Authorization": "Bearer " + currentToken.access }, body: JSON.stringify(data) }),
        delete: (url, id) => fetch(`${mdr_url}${url}/${id}`, { "method": "DELETE", "headers": { "Authorization": "Bearer " + currentToken.access } }),
        graphql: (query) => fetch(mdr_url + "/api/graphql/json", { "method": "POST", "headers": { "Accept": "application/json", "Content-Type": "application/graphql", "Authorization": "Bearer " + currentToken.access}, body: query})
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