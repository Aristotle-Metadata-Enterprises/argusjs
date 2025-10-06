// format url to http://x.x.x
const formatUrl = (url) => {
    if (!url.startsWith("http")) {
        url = "http://" + url
    }
    url = url.replace(/\/$/, "") // remove trailing slash
    return url
}

// fetch jwt token from mdr
const fetchToken = async (mdrUrl, email, password) => {
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

// refresh jwt token
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

// fetch manifest from app
const getManifest = async (appUrl) => {
    const response = await fetch(formatUrl(appUrl) + "/aristotle-manifest.json", { headers: { "Content-Type": "application/json" } })
    
    if (response.ok) {
        const manifest = await response.json()
        return manifest
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

// add scope to token payload
const addTokenScope = (token, scope) => {
    // jwt token has format header.payload.signature, each encoded base64
    const addJwtScope = (jwt) => {
        const parts = jwt.split(".")
        const payload = JSON.parse(atob(parts[1]))
        payload["scope"] = scope
        parts[1] = btoa(JSON.stringify(payload))
        return parts.join(".")
    }

    // token is JSON object {access, refresh}, each jwt tokens
    return { access: addJwtScope(token.access), refresh: addJwtScope(token.refresh) }
}

const generateToken = async (mdrUrl, email, password, manifest) => {
    const token = await fetchToken(mdrUrl, email, password)
    return addTokenScope(token, manifest.scope)
}

// post message to app's argus.js
const postMessageToApp = (appUrl, data) => {
    document.querySelector("#app").contentWindow.postMessage(data, appUrl)
}

let currentToken = null

window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search)

    const appUrl = urlParams.get("app_url")
    const mdrUrl = urlParams.get("mdr_url")

    currentToken = urlParams.get("token")
    const email = urlParams.get("email")
    const password = urlParams.get("password")

    // serve the /noapp forms, which can be used to populate query fields
    if (!appUrl || !mdrUrl || (!currentToken && (!email || !password))) {
        document.querySelector("#app").src = "/noapp"
        return
    }

    // get app manifest
    const manifest = getManifest(appUrl).then(manifest => {
        document.title = `${manifest.name} - Metadata Registry`
        return manifest
    })

    // parse token
    if (currentToken) {
        currentToken = JSON.parse(currentToken)
    } else { // generate token if not provided
        currentToken = await generateToken(mdrUrl, email, password, await manifest)
    }

    // refresh token every 3 mins
    window.setInterval(async () => {
        document.querySelector("#errorMessage").style.display = "none"
        try {
            currentToken = await refreshToken(mdrUrl, currentToken)
            postMessageToApp(appUrl, { argusMessageId: "argus-token-refresh", token: currentToken })
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
                token: currentToken,
                mdr_url: formatUrl(mdrUrl)
            })
        }
    }, false)

    document.querySelector("#app").src = appUrl
}
