// format url to http://x.x.x
const formatUrl = (url) => {
    if (!url.startsWith("http")) {
        url = "http://" + url
    }
    url = url.replace(/\/$/, "") // remove trailing slash
    return url
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

// post message to app's argus.js
const postMessageToApp = (appUrl, data) => {
    document.querySelector("#app").contentWindow.postMessage(data, appUrl)
}

window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search)

    const appUrl = urlParams.get("app_url")
    const mdrUrl = urlParams.get("mdr_url")

    const currentToken = urlParams.get("token")

    // serve the /noapp forms, which can be used to populate query fields
    if (!appUrl || !mdrUrl || !currentToken) {
        document.querySelector("#app").src = "/noapp"
        return
    }

    // use app manifest
    getManifest(appUrl).then(manifest => {
        document.title = `${manifest.name} - Metadata Registry`
        document.getElementById("app-name").innerText = manifest.name
    })

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
