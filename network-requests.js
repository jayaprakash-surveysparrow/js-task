/*
1. Introduction: Fetch
    fetch(url) starts an HTTP request and returns a promise that
    resolves with a Response object as soon as the server has sent
    headers - it does NOT wait for the full body, and it does NOT
    reject on HTTP error statuses (404, 500, ...), only on network
    failure (DNS/connection errors, CORS block, etc). Check
    response.ok / response.status yourself to detect HTTP errors.
    The body is read separately via response.json()/.text()/etc,
    each of which also returns a promise.
*/

async function basicFetch() {
    try {
        let response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        let data = await response.json(); // reads and parses the body as JSON
        console.log("basicFetch:", data);
    } catch (error) {
        console.error(`basicFetch failed: ${error.message}`);
    }
}

basicFetch();

/*
2. FormData
    A FormData object represents a set of form fields and their
    values, encoded as multipart/form-data - the same format an
    HTML <form> submits. Passing one as fetch's `body` lets a
    request carry text fields and files (Blob/File) together, and
    sets the correct Content-Type (with boundary) automatically.
*/

async function submitForm() {
    let formData = new FormData();
    formData.append("name", "John");
    formData.append("surname", "Smith");
    // formData.append("avatar", fileInput.files[0]); // a File/Blob, in a browser

    for (let [key, value] of formData) {
        console.log(`FormData entry: ${key} = ${value}`);
    }

    // let response = await fetch("https://example.com/submit", {
    //     method: "POST",
    //     body: formData, // Content-Type is set automatically, don't set it manually
    // });
}

submitForm();

/*
3. Fetch: Download progress
    response.json()/.text() give you the parsed body only once it's
    fully downloaded. To track progress while it streams in, read
    response.body (a ReadableStream) manually via .getReader(),
    comparing bytes received so far against the Content-Length header.
*/

async function fetchWithProgress(url) {
    let response = await fetch(url);
    let contentLength = +response.headers.get("Content-Length");
    let reader = response.body.getReader();

    let received = 0;
    let chunks = [];
    while (true) {
        let { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        console.log(`Received ${received} of ${contentLength} bytes`);
    }
    // chunks can be concatenated into a single Uint8Array/Blob once done
}

// fetchWithProgress("https://example.com/large-file"); // needs a real streamed resource

/*
4. Fetch: Abort
    AbortController creates a `signal` that can be passed to fetch's
    `signal` option. Calling controller.abort() cancels the request
    in flight, and the pending fetch promise rejects with an
    AbortError - useful for timeouts or "cancel" buttons. One
    controller/signal can also cancel several fetches at once.
*/

async function fetchWithTimeout(url, timeoutMs) {
    let controller = new AbortController();
    let timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        let response = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        return await response.text();
    } catch (error) {
        if (error.name === "AbortError") {
            console.error("fetchWithTimeout: request aborted (timed out)");
        } else {
            console.error(`fetchWithTimeout failed: ${error.message}`);
        }
    }
}

fetchWithTimeout("https://jsonplaceholder.typicode.com/todos/2", 3000);

/*
5. Fetch: Cross-Origin Requests
    A request is "cross-origin" when it targets a different
    protocol/domain/port than the page making it. Browsers only
    allow it if the server opts in via CORS response headers
    (e.g. Access-Control-Allow-Origin). A "simple" request (GET/POST/
    HEAD with only simple headers and simple content types) is sent
    directly; anything else (custom headers, PUT/DELETE, JSON with
    non-form content-type) triggers a "preflight" - the browser first
    sends an OPTIONS request to check permission before the real one.
    Cookies/credentials are excluded by default and require both
    `credentials: "include"` on the request and
    Access-Control-Allow-Credentials: true on the server response.
*/

async function crossOriginWithCredentials(url) {
    let response = await fetch(url, {
        credentials: "include", // send/receive cookies cross-origin
    });
    return response.json();
}

/*
6. Fetch API
    fetch's second argument configures the request: method, headers,
    body, credentials, mode, etc. The Response object it resolves
    with exposes status/ok/headers and body-reading methods
    (json/text/blob/arrayBuffer/formData), each consumable only once.
*/

async function postJson(url, payload) {
    let response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    console.log("postJson status:", response.status, response.headers.get("Content-Type"));
    return response.json();
}

postJson("https://jsonplaceholder.typicode.com/posts", { title: "hello", body: "world", userId: 1 })
    .then(data => console.log("postJson:", data));

/*
7. URL objects
    `new URL(url, base?)` parses a URL string into its components
    (protocol, host, pathname, search, hash, ...) and validates it -
    throwing TypeError on malformed input instead of failing silently.
    `.searchParams` (a URLSearchParams object) makes reading/editing
    query parameters easy without manual string concatenation.
*/

let url = new URL("https://example.com:8080/path/page?id=5&mode=edit#section");
console.log(url.hostname); // "example.com"
console.log(url.pathname); // "/path/page"
console.log(url.searchParams.get("id")); // "5"

url.searchParams.set("mode", "view");
url.searchParams.append("lang", "en");
console.log(url.toString()); // query string updated, properly encoded

/*
8. XMLHttpRequest
    XMLHttpRequest (XHR) is the original browser API for HTTP
    requests, predating fetch. It's event-based rather than
    promise-based, tracked via `readyState`, and still used today for
    things fetch historically couldn't do well - like upload progress.
    (Browser-only: not available in this Node environment.)
*/

function xhrGet(url, onSuccess, onError) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url); // async by default; pass `false` as a 3rd arg for sync (blocks the page, avoid it)

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            onSuccess(xhr.response);
        } else {
            onError(new Error(`HTTP error: ${xhr.status}`));
        }
    };
    xhr.onerror = () => onError(new Error("Network error"));
    xhr.onprogress = event => {
        if (event.lengthComputable) {
            console.log(`xhr progress: ${event.loaded} of ${event.total}`);
        }
    };

    xhr.send();
}

// xhrGet("https://example.com/data", data => console.log(data), err => console.error(err));

/*
9. Resumable file upload
    For large uploads over unreliable connections, splitting the file
    into fixed-size chunks and uploading them one by one (tracking
    how many bytes were already sent, e.g. via a Content-Range header
    or a server-side upload id) lets an interrupted upload resume
    from where it left off instead of restarting from byte 0.
*/

async function uploadChunked(file, url, chunkSize = 1024 * 1024) {
    let uploaded = 0; // bytes already confirmed sent (fetched from server on resume)

    while (uploaded < file.size) {
        let chunk = file.slice(uploaded, uploaded + chunkSize);
        let response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Range": `bytes ${uploaded}-${uploaded + chunk.size - 1}/${file.size}`,
            },
            body: chunk,
        });
        if (!response.ok) {
            throw new Error(`Chunk upload failed at byte ${uploaded}`);
        }
        uploaded += chunk.size;
        console.log(`Uploaded ${uploaded} of ${file.size} bytes`);
    }
}

// uploadChunked(fileInput.files[0], "https://example.com/upload"); // needs a real File, in a browser

/*
10. Long polling
    The simplest way to get near-real-time updates from a server that
    can't push data on its own: the client sends a request that the
    server holds open until new data is available (or a timeout
    hits), then the client immediately sends the next one - looping
    forever. Simple to implement, but each open connection ties up
    server resources; WebSocket/SSE scale better for frequent updates.
*/

async function subscribe(url, onMessage) {
    while (true) {
        try {
            let response = await fetch(url); // server holds this until there's something to say
            if (response.status === 502) {
                continue; // connection timed out server-side, reconnect immediately
            }
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            let message = await response.text();
            onMessage(message);
        } catch (error) {
            console.error(`subscribe error: ${error.message}`);
            await delay(null, 1000); // brief pause before retrying after a real failure
        }
    }
}

function delay(value, ms) {
    return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

// subscribe("https://example.com/updates", msg => console.log("update:", msg)); // runs forever, needs a real server

/*
11. WebSocket
    A WebSocket is a persistent, full-duplex connection: after an
    initial HTTP handshake (upgrading the connection), both client
    and server can send messages to each other at any time, with much
    less overhead than repeated HTTP requests. Good for chat, live
    feeds, games - anything needing frequent two-way traffic.
    (Browser/server API: not available in this Node environment
    without a library.)
*/

function connectSocket(url) {
    let socket = new WebSocket(url);

    socket.onopen = () => console.log("WebSocket connection established");
    socket.onmessage = event => console.log("WebSocket message:", event.data);
    socket.onclose = event => {
        if (event.wasClean) {
            console.log(`WebSocket closed cleanly, code=${event.code}`);
        } else {
            console.log("WebSocket connection died");
        }
    };
    socket.onerror = error => console.error("WebSocket error:", error.message);

    return socket;
}

// let socket = connectSocket("wss://example.com/chat");
// socket.send("Hello, server!");

/*
12. Server-Sent Events
    EventSource opens a one-way, long-lived HTTP connection over
    which the server streams text/event-stream formatted messages to
    the client whenever it wants - a simpler alternative to WebSocket
    when the client only ever needs to *receive* updates, not send
    them. The browser automatically reconnects on disconnect (with an
    incrementing `Last-Event-ID` header) unless the server tells it
    to stop. (Browser API: not available in this Node environment
    without a library.)
*/

function subscribeToEvents(url) {
    let source = new EventSource(url);

    source.onopen = () => console.log("SSE connection opened");
    source.onmessage = event => console.log("SSE message:", event.data);
    source.onerror = () => console.log("SSE connection error/closed, browser will retry");

    // a named event: source.addEventListener("customEvent", event => ...)

    return source;
}

// let source = subscribeToEvents("https://example.com/events");
