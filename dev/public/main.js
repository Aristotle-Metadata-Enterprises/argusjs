const app_url = "https://aristotle-metadata-enterprises.github.io/argus-3d-graph/"
const mdr_url = "http://localhost:8000"
const token = JSON.parse('{\u0022refresh\u0022: \u0022eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1ODU4OTM4MCwiaWF0IjoxNzU4NTAyOTgwLCJqdGkiOiJiYWU1M2JjYmUyODM0ZTY4YmU2YTA1ZDYxNDk1OWQwMiIsInVzZXJfaWQiOjEsInNjb3BlIjpbIm1ldGFkYXRhOnJlYWQiLCJncmFwaHFsOnJlYWQiXX0.dViEgaCVW8QNtFxU\u002DFJDwYri\u002D8dTXETLe94PGlQ8Afo\u0022, \u0022access\u0022: \u0022eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU4NTAzMjgwLCJpYXQiOjE3NTg1MDI5ODAsImp0aSI6Ijk3NTY4MzZlOTQ0ZjRhZDhiNmY5YjhmYzEzZDllOGE4IiwidXNlcl9pZCI6MSwic2NvcGUiOlsibWV0YWRhdGE6cmVhZCIsImdyYXBocWw6cmVhZCJdfQ.WhoEH1zQujVntNVCzvONDAh7ApPx8j9lZ2dSM3hcYPE\u0022}')

const postMessageToApp = (data) => {
    document
        .querySelector("#app")
        .contentWindow
        .postMessage(data, app_url)
}

const refreshToken = async () => {
    const response = await fetch(
        mdr_url + "/api/jwt/token/refresh/",
        {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token.access,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "refresh": token.refresh })
        }
    )
    const newToken = await response.json()
    token.access = newToken.access
}

window.setInterval(async function () {
    // Refresh the token
    document.querySelector("#errorMessage").style.display = 'none';
    try {
        await refreshToken()
        postMessageToApp({ argusMessageId: "argus-token-refresh", token: token })
    }
    catch (e) {
        document.querySelector("#errorMessage").style.display = 'block';
        console.error("Could not connect to aristotle to reresh token", e)
    }

}, 3 * 60 * 1000) // 3 mins

window.addEventListener("message", (event) => {
    if (event.data.argusMessageId === "argus-token-request") {
        postMessageToApp({
            argusMessageId: "argus-token-response",
            requestId: event.data.requestId,
            token,
            mdr_url
        })
    }
}, false)
