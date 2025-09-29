const generateToken = async (mdrUrl, email, password) => {
    
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

const postMessageToApp = (data) => {
    document.querySelector("#app").contentWindow.postMessage(data, app_url)
}

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search)

    const appUrl = urlParams.get("app_url")
    const mdrUrl = urlParams.get("mdr_url")
    const token = urlParams.get("token")

    // serve the /noapp forms, which can be used to populate query fields
    if (!appUrl || !mdrUrl || !token) {
        document.querySelector("#app").src = "/noapp"
        return
    }

    // refresh token every 3 mins
    window.setInterval(async () => {
        document.querySelector("#errorMessage").style.display = "none"
        try {
            await refreshToken()
            postMessageToApp({ argusMessageId: "argus-token-refresh", token: token })
        } catch (e) {
            document.querySelector("#errorMessage").style.display = "block"
            console.error("Could not connect to aristotle to reresh token", e)
        }
    }, 3 * 60 * 1000)

    // respond to messages with mdr url & token
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

    document.querySelector("#app").src = appUrl
}
