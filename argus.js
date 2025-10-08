const MESSAGE_ARGUS_TOKEN_REFRESH = "argus-token-refresh";
const MESSAGE_ARGUS_TOKEN_REQUEST = "argus-token-request";
const MESSAGE_ARGUS_TOKEN_RESPONSE = "argus-token-response";

const ArgusJS = function(token, mdrUrl) {
    let auth
    if (typeof token === "string" || token instanceof String) {
        auth = "Token " + token // api token
    } else {
        auth = "Bearer " + token.access // access token
    }

    window.addEventListener("message", (event) => {
        if (event.data.argusMessageId === MESSAGE_ARGUS_TOKEN_REFRESH) {
            const token = event.data.token

            if (typeof token === "string" || token instanceof String) {
                auth = "Token " + token
            } else {
                auth = "Bearer " + token.access
            }
        }
    }, false);

    return {
        get: (url) => fetch(`${mdrUrl}${url}`, { "method": "GET", "headers": { "Authorization": auth } }),
        post: (url, data) => fetch(`${mdrUrl}${url}`, { "method": "POST", "headers": { "Content-Type": "application/json; charset=UTF-8", "Authorization": auth }, body: JSON.stringify(data) }),
        put: (url, data) => fetch(`${mdrUrl}${url}`, { "method": "PUT", "headers": { "Content-Type": "application/json; charset=UTF-8", "Authorization": auth }, body: JSON.stringify(data) }),
        patch: (url, data) => fetch(`${mdrUrl}${url}`, { "method": "PATCH", "headers": { "Content-Type": "application/json; charset=UTF-8", "Authorization": auth }, body: JSON.stringify(data) }),
        delete: (url) => fetch(`${mdrUrl}${url}`, { "method": "DELETE", "headers": { "Authorization": auth } }),
        graphQL: (query) => fetch(mdrUrl + "/api/graphql/json", { "method": "POST", "headers": { "Accept": "application/json", "Content-Type": "application/graphql", "Authorization": auth}, body: query}),
        mdrUrl: () => mdrUrl
    }
}

export function initArgusJS() {
    return new Promise((resolve) => {
        const requestId = Date.now();

        const argusTokenResponseHandler = function(event) {
            if (event.data.argusMessageId === MESSAGE_ARGUS_TOKEN_RESPONSE && event.data.requestId === requestId) {
                resolve(ArgusJS(event.data.token, event.data.mdr_url))
                window.removeEventListener("message", argusTokenResponseHandler)
            }
        }

        window.addEventListener("message", argusTokenResponseHandler, false);
        top.postMessage({ argusMessageId: MESSAGE_ARGUS_TOKEN_REQUEST, requestId }, "*")
    })
}
