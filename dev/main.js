// format url to http://x.x.x
const formatUrl = (url) => {
    if (!url.startsWith("http")) {
        url = "http://" + url
    }
    url = url.replace(/\/$/, "") // remove trailing slash
    return url
}

const generateToken = async (mdrUrl, email, password) => {
    const response = await fetch(
        formatUrl(mdrUrl) + "/api/jwt/token/",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        }
    )

    if (response.ok) {
        const token = await response.json()
        return token
    } else {
        let errorText
        try {
            const errorData = await response.json()
            errorText = errorData.detail || JSON.stringify(errorData)
        } catch {
            errorText = await response.text()
        }
        console.error(`Request failed with code ${response.status} ${response.statusText}\n${errorText}`)
        return null
    }
}

const refreshToken = async (mdrUrl, token) => {
    const response = await fetch(
        formatUrl(mdrUrl) + "/api/jwt/token/refresh/",
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
    return newToken
}

const postMessageToApp = (appUrl, data) => {
    document.querySelector("#app").contentWindow.postMessage(data, appUrl)
}

let argusToken = null

window.onload = async () => {
    console.log("testing")
    const urlParams = new URLSearchParams(window.location.search)

    const appUrl = urlParams.get("app_url")
    const mdrUrl = urlParams.get("mdr_url")

    argusToken = urlParams.get("token")
    const email = urlParams.get("email")
    const password = urlParams.get("password")

    // serve the /noapp forms, which can be used to populate query fields
    if (!appUrl || !mdrUrl || (!argusToken && (!email || !password))) {
        document.querySelector("#app").src = "/noapp"
        return
    }

    // generate token if not provided
    if (!argusToken) {
        argusToken = await generateToken(mdrUrl, email, password)
    }

    // refresh token every 3 mins
    window.setInterval(async () => {
        document.querySelector("#errorMessage").style.display = "none"
        try {
            argusToken = await refreshToken(mdrUrl, argusToken)
            postMessageToApp(appUrl, { argusMessageId: "argus-token-refresh", token: argusToken })
        } catch (e) {
            document.querySelector("#errorMessage").style.display = "block"
            console.error("Could not connect to aristotle to reresh token", e)
        }
    }, 3 * 60 * 1000)

    // respond to messages with mdr url & token
    window.addEventListener("message", (event) => {
        if (event.data.argusMessageId === "argus-token-request") {
            postMessageToApp(appUrl, {
                argusMessageId: "argus-token-response",
                requestId: event.data.requestId,
                token: argusToken,
                mdr_url: formatUrl(mdrUrl)
            })
        }
    }, false)

    document.querySelector("#app").src = appUrl
}
