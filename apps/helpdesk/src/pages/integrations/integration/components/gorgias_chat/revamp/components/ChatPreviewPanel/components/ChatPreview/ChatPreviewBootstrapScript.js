Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true })
Object.defineProperty(window, 'innerHeight', { value: 1024, writable: true })

const makeMockStorage = () => {
    const store = new Map()
    return {
        getItem: (key) => store.get(key) ?? null,
        setItem: (key, value) => store.set(key, String(value)),
        removeItem: (key) => store.delete(key),
        clear: () => store.clear(),
        get length() {
            return store.size
        },
        key: (i) => Array.from(store.keys())[i] ?? null,
    }
}
Object.defineProperty(window, 'localStorage', { value: makeMockStorage() })
Object.defineProperty(window, 'sessionStorage', { value: makeMockStorage() })

window.WebSocket = (url) => {
    const ws = {
        url,
        readyState: 1,
        bufferedAmount: 0,
        extensions: '',
        protocol: '',
        binaryType: 'blob',
        onopen: () => {},
        onclose: () => {},
        onerror: () => {},
        onmessage: () => {},
        addEventListener: (type, fn) => {
            ;(listeners[type] ??= []).push(fn)
        },
        removeEventListener: (type, fn) => {
            listeners[type] = (listeners[type] ?? []).filter((l) => l !== fn)
        },
        send: () => true,
        close: () => {
            ws.readyState = 3
        },
    }

    return ws
}
window.WebSocket.CONNECTING = 0
window.WebSocket.OPEN = 1
window.WebSocket.CLOSING = 2
window.WebSocket.CLOSED = 3

window.addEventListener('gorgias-widget-loaded', () => {
    window.parent.postMessage({ type: 'helpdesk-chat-preview-loaded' }, '*')
})

window.addEventListener('error', () => {
    window.parent.postMessage({ type: 'helpdesk-chat-preview-error' }, '*')
})

window.addEventListener('unhandledrejection', () => {
    window.parent.postMessage({ type: 'helpdesk-chat-preview-error' }, '*')
})
