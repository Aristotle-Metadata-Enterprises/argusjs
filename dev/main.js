// format url to http://x.x.x
const formatUrl = (url) => {
    url = url.trim()
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

// embed app from appUrl and serve it the argus token on request
const loadApp = (appUrl, mdrUrl, token) => {
    if (!appUrl || !mdrUrl || !token) {
        // serve the /noapp form, which can be used to populate query fields
        window.onmessage =  (event) => {
            if (event.data.argusMessageId === "submit-token") {
                loadApp(event.data.app_url, event.data.mdr_url, event.data.token)
            }
        }
        document.querySelector("#app").src = "/noapp"
    } else {
        // update site with app manifest
        getManifest(appUrl).then(manifest => {
            document.title = `${manifest.name} - Metadata Registry`
            document.getElementById("app-name").innerText = manifest.name
        })

        // respond to messages with mdr url & token
        window.onmessage = (event) => {
            if (event.data.argusMessageId === "argus-token-request") {
                postMessageToApp(appUrl, {
                    argusMessageId: "argus-token-response",
                    requestId: event.data.requestId,
                    token: token,
                    mdr_url: formatUrl(mdrUrl)
                })
            }
        }
        document.querySelector("#app").src = appUrl
    }
}

window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search)

    const appUrl = urlParams.get("app_url")
    const mdrUrl = urlParams.get("mdr_url")
    const token = localStorage.getItem("token")
    
    loadApp(appUrl, mdrUrl, token)
}
