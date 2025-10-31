// @vitest-environment jsdom

import { test, expect, beforeEach, vi } from "vitest"
import { initArgusJS } from "../argus"

const FetchMock = vi.fn(() => {
    return Promise.resolve(new Response())
})

beforeEach(() => {
    vi.resetAllMocks()

    // spy on window.top messages
    vi.spyOn(window.top, "postMessage").mockImplementation(() => {})

    // mock fetch
    vi.stubGlobal("fetch", FetchMock)
})

const setupArgus = async (mdrUrl, token) => {
    // initialise argus
    const argusPromise = initArgusJS()

    // check for message requesting a token
    expect(window.top.postMessage).toHaveBeenCalled()
    const [requestMsg, target] = window.top.postMessage.mock.calls[0]
    expect(requestMsg.argusMessageId).toBe("argus-token-request")
    expect(requestMsg.requestId).toBeDefined()
    expect(target).toBeDefined()

    // send mock response
    const responseMsg = new MessageEvent("message", {
        data: {
            argusMessageId: "argus-token-response",
            requestId: requestMsg.requestId,
            token: token,
            mdr_url: mdrUrl
        }
    })
    window.dispatchEvent(responseMsg)

    // check argus resolved
    const argus = await argusPromise
    expect(argus).toBeDefined()
    return argus
}

const testMethods = async (argus, mdrUrl, auth) => {
    for (const method of ["get", "post", "put", "patch", "delete", "graphQL"]) {
        FetchMock.mockReset()
        const response = await argus[method]("")
        expect(response).toBeInstanceOf(Response)
        expect(FetchMock).toHaveBeenCalledOnce()

        const args = FetchMock.mock.lastCall
        expect(args.length).toBeGreaterThanOrEqual(2)
        expect(args[0]).toMatch(new RegExp(`^${mdrUrl}`))
        expect(args[1]).toHaveProperty("headers.Authorization")
        expect(args[1].headers.Authorization).toBe(auth)
    }

    expect(argus.mdrUrl()).toBe(mdrUrl)
}

test("Test ArgusJS with API token", async () => {
    const mdrUrl = "https://www.mymetadataregistry.com"
    const token = "0123456789abcdef0123456789abcdef01234567"
    const auth = `Token ${token}` // api token auth

    const argus = await setupArgus(mdrUrl, token)
    await testMethods(argus, mdrUrl, auth)
}, 1000)

test("Test ArgusJS with access token", async () => {
    const mdrUrl = "https://www.yourmetadataregistry.com"
    const token = {
        access: "1111111111111111111111111111111111111111",
        refresh: "ffffffffffffffffffffffffffffffffffffffff"
    }
    const auth = `Bearer ${token.access}` // access token auth

    const argus = await setupArgus(mdrUrl, token)
    await testMethods(argus, mdrUrl, auth)

    // refresh token
    const newToken = {
        access: "2222222222222222222222222222222222222222",
        refresh: "ffffffffffffffffffffffffffffffffffffffff"
    }
    const newAuth = `Bearer ${newToken.access}`

    const refreshMsg = new MessageEvent("message", {
        data: {
            argusMessageId: "argus-token-refresh",
            token: newToken
        }
    })
    window.dispatchEvent(refreshMsg)

    await testMethods(argus, mdrUrl, newAuth)
}, 1000)

test("Test ArgusJS with incorrect API token", async () => {
    const mdrUrl = "https://www.ourmetadataregistry.com"
    const token = "0123456789abcdef0123456789abcdef01234567"
    const auth = `Token ${token}` // api token auth

    const argus = await setupArgus(mdrUrl, "notmytoken")
    await expect(testMethods(argus, mdrUrl, auth)).rejects.toThrowError()
}, 1000)

test("Test ArgusJS with incorrect mdr url", async () => {
    const mdrUrl = "https://www.somemetadataregistry.com"
    const token = "0123456789abcdef0123456789abcdef01234567"
    const auth = `Token ${token}` // api token auth

    const argus = await setupArgus("https://not.my.url", token)
    await expect(testMethods(argus, mdrUrl, auth)).rejects.toThrowError()
}, 1000)

test("Test ArgusJS checks request ID", async () => {
    const mdrUrl = "https://www.anothermetadataregistry.com"
    const token = "0123456789abcdef0123456789abcdef01234567"
    const auth = `Token ${token}` // api token auth

    // initialise argus
    const argusPromise = initArgusJS()

    // check for message requesting a token
    expect(window.top.postMessage).toHaveBeenCalled()
    const [requestMsg, target] = window.top.postMessage.mock.calls[0]
    expect(requestMsg.argusMessageId).toBe("argus-token-request")
    expect(requestMsg.requestId).toBeDefined()
    expect(target).toBeDefined()

    // send response with wrong request id
    const wrongResponseMsg = new MessageEvent("message", {
        data: {
            argusMessageId: "argus-token-response",
            requestId: `${requestMsg.requestId}1`,
            token: "notmytoken",
            mdr_url: "https://not.my.url"
        }
    })
    window.dispatchEvent(wrongResponseMsg)

    // check argus not resolved after 100 ms
    const timeout = new Promise(res => setTimeout(() => res("timeout"), 100))
    expect(await Promise.race([argusPromise, timeout])).toBe("timeout")

    // send response with correct request id
    const responseMsg = new MessageEvent("message", {
        data: {
            argusMessageId: "argus-token-response",
            requestId: requestMsg.requestId,
            token: token,
            mdr_url: mdrUrl
        }
    })
    window.dispatchEvent(responseMsg)

    const argus = await argusPromise
    expect(argus).toBeDefined()

    // check argus is set up correctly
    await testMethods(argus, mdrUrl, auth)

    expect("a").toBe("b")
}, 1000)
