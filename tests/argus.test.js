import { test, expect, beforeEach, vi, beforeAll } from "vitest"
import createFetchMock from "vitest-fetch-mock"
import { initArgusJS } from "../argus"

const MOCK_DOMAIN = "my.metadata.registry"
const MOCK_URL = "https://" + MOCK_DOMAIN
const MOCK_API_TOKEN = "0123456789abcdef0123456789abcdef01234567"
const MOCK_ACCESS_TOKEN = "1111111111111111111111111111111111111111"
const MOCK_ACCESS_TOKEN_2 = "2222222222222222222222222222222222222222"
const MOCK_REFRESH_TOKEN = "ffffffffffffffffffffffffffffffffffffffff"

beforeAll(() => {
    const fetchMocker = createFetchMock(vi)
    fetchMocker.enableMocks()
})

beforeEach(() => {
    // mock fetch function
    fetch.resetMocks()
    fetch.doMockIf(MOCK_DOMAIN, request => {
        window.console.log(request)
        if (request.headers.get("Authorization") == `Token ${MOCK_API_TOKEN}`
            || request.headers.get("Authorization") == `Bearer ${MOCK_ACCESS_TOKEN}`) {
            return new Response("{}", { status: 200 })
        } else {
            return new Response("{}", { status: 401 })
        }
    })

    // spy on window.top messages
    vi.resetAllMocks()
    vi.spyOn(window.top, "postMessage").mockImplementation(() => {})
})

const testRequests = async argus => {
    for (const method of ["get", "post", "put", "patch", "delete", "graphQL"]) {
        expect(await argus[method]()).toBeInstanceOf(Response).toHaveProperty("ok", true)
    }
}

test("Test ArgusJS with API token", async () => {
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
            token: MOCK_API_TOKEN,
            mdr_url: MOCK_URL
        }
    })
    window.dispatchEvent(responseMsg)

    // check argus resolved
    const argus = await argusPromise
    expect(argus).toBeDefined()

    // check requests work (fetch gives 200 if url correct and valid token)
    for (const method of ["get", "post", "put", "patch", "delete", "graphQL"]) {
        expect(await argus[method]("")).toBeInstanceOf(Response).toHaveProperty("ok", true)
    }
    expect(argus.mdrUrl()).toBe(MOCK_URL)
}, 1000)

test("Test ArgusJS with access token", async () => {
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
            token: {
                access: MOCK_ACCESS_TOKEN,
                refresh: MOCK_REFRESH_TOKEN
            },
            mdr_url: MOCK_URL
        }
    })
    window.dispatchEvent(responseMsg)

    // check argus resolves
    const argus = await argusPromise
    expect(argus).toBeDefined()

    // check requests work (fetch gives 200 if url correct and valid token)
    for (const method of ["get", "post", "put", "patch", "delete", "graphQL"]) {
        expect(await argus[method]("")).toBeInstanceOf(Response).toHaveProperty("ok", true)
    }
    expect(argus.mdrUrl()).toBe(MOCK_URL)

    // require new access token
    fetch.resetMocks()
    fetch.doMockIf(MOCK_DOMAIN, request => {
        if (request.headers.get("Authorization") == `Token ${MOCK_API_TOKEN}`
            || request.headers.get("Authorization") == `Bearer ${MOCK_ACCESS_TOKEN}`) {
            return new Response("{}", { status: 200 })
        } else {
            return new Response("{}", { status: 401 })
        }
    })

    // send mock token refresh
    const refreshMsg = new MessageEvent("message", {
        data: {
            argusMessageId: "argus-token-refresh",
            requestId: requestMsg.requestId,
            token: {
                access: MOCK_ACCESS_TOKEN_2,
                refresh: MOCK_REFRESH_TOKEN
            },
            mdr_url: MOCK_URL
        }
    })
    window.dispatchEvent(refreshMsg)

    // check argus requests still working
    for (const method of ["get", "post", "put", "patch", "delete", "graphQL"]) {
        expect(await argus[method]("")).toBeInstanceOf(Response).toHaveProperty("ok", true)
    }
}, 1000)

test("Test ArgusJS with incorrect API token", async () => {
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
            token: {
                access: "notatoken",
                refresh: MOCK_REFRESH_TOKEN
            },
            mdr_url: MOCK_URL
        }
    })
    window.dispatchEvent(responseMsg)

    // check argus resolves
    const argus = await argusPromise
    expect(argus).toBeDefined()

    // check requests work (fetch gives 200 if url correct and valid token)
    for (const method of ["get", "post", "put", "patch", "delete", "graphQL"]) {
        expect(await argus[method]("")).toBeInstanceOf(Response).toHaveProperty("ok", true)
    }
    expect(argus.mdrUrl()).toBe(MOCK_URL)
}, 1000)
