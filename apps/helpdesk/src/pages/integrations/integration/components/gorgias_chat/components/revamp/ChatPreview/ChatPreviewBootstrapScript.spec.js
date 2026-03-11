import './ChatPreviewBootstrapScript'

describe('ChatPreviewBootstrapScript', () => {
    describe('localStorage mock', () => {
        beforeEach(() => {
            window.localStorage.clear()
        })

        it('returns null for a key that has not been set', () => {
            expect(window.localStorage.getItem('missing')).toBeNull()
        })

        it('stores and retrieves a value by key', () => {
            window.localStorage.setItem('key', 'value')
            expect(window.localStorage.getItem('key')).toBe('value')
        })

        it('coerces non-string values to strings', () => {
            window.localStorage.setItem('number', 42)
            expect(window.localStorage.getItem('number')).toBe('42')
        })

        it('removes an item by key', () => {
            window.localStorage.setItem('key', 'value')
            window.localStorage.removeItem('key')
            expect(window.localStorage.getItem('key')).toBeNull()
        })

        it('reports length equal to the number of stored items', () => {
            window.localStorage.setItem('a', '1')
            window.localStorage.setItem('b', '2')
            expect(window.localStorage.length).toBe(2)
        })

        it('reports length as zero after clear', () => {
            window.localStorage.setItem('a', '1')
            window.localStorage.setItem('b', '2')
            window.localStorage.clear()
            expect(window.localStorage.length).toBe(0)
        })

        it('returns the key at a given index', () => {
            window.localStorage.setItem('myKey', 'value')
            expect(window.localStorage.key(0)).toBe('myKey')
        })

        it('returns null for an out-of-bounds index', () => {
            expect(window.localStorage.key(999)).toBeNull()
        })
    })

    describe('storage is replaced with mock (not real window storage)', () => {
        it('window.localStorage is not a native Storage instance', () => {
            expect(window.localStorage).not.toBeInstanceOf(Storage)
        })

        it('window.sessionStorage is not a native Storage instance', () => {
            expect(window.sessionStorage).not.toBeInstanceOf(Storage)
        })
    })

    describe('sessionStorage mock', () => {
        beforeEach(() => {
            window.sessionStorage.clear()
        })

        it('returns null for a key that has not been set', () => {
            expect(window.sessionStorage.getItem('missing')).toBeNull()
        })

        it('stores and retrieves a value by key', () => {
            window.sessionStorage.setItem('key', 'value')
            expect(window.sessionStorage.getItem('key')).toBe('value')
        })

        it('coerces non-string values to strings', () => {
            window.sessionStorage.setItem('number', 42)
            expect(window.sessionStorage.getItem('number')).toBe('42')
        })

        it('removes an item by key', () => {
            window.sessionStorage.setItem('key', 'value')
            window.sessionStorage.removeItem('key')
            expect(window.sessionStorage.getItem('key')).toBeNull()
        })

        it('reports length equal to the number of stored items', () => {
            window.sessionStorage.setItem('a', '1')
            window.sessionStorage.setItem('b', '2')
            expect(window.sessionStorage.length).toBe(2)
        })

        it('reports length as zero after clear', () => {
            window.sessionStorage.setItem('a', '1')
            window.sessionStorage.setItem('b', '2')
            window.sessionStorage.clear()
            expect(window.sessionStorage.length).toBe(0)
        })
    })

    describe('WebSocket mock', () => {
        it('has the correct static readyState constants', () => {
            expect(window.WebSocket.CONNECTING).toBe(0)
            expect(window.WebSocket.OPEN).toBe(1)
            expect(window.WebSocket.CLOSING).toBe(2)
            expect(window.WebSocket.CLOSED).toBe(3)
        })

        it('creates an instance with the provided url and default initial properties', () => {
            const ws = window.WebSocket('ws://example.com')
            expect(ws.url).toBe('ws://example.com')
            expect(ws.readyState).toBe(1)
            expect(ws.bufferedAmount).toBe(0)
            expect(ws.extensions).toBe('')
            expect(ws.protocol).toBe('')
            expect(ws.binaryType).toBe('blob')
        })

        it('provides no-op default event handler properties', () => {
            const ws = window.WebSocket('ws://example.com')
            expect(typeof ws.onopen).toBe('function')
            expect(typeof ws.onclose).toBe('function')
            expect(typeof ws.onerror).toBe('function')
            expect(typeof ws.onmessage).toBe('function')
        })

        it('send() returns true', () => {
            const ws = window.WebSocket('ws://example.com')
            expect(ws.send()).toBe(true)
        })

        it('close() sets readyState to CLOSED (3)', () => {
            const ws = window.WebSocket('ws://example.com')
            ws.close()
            expect(ws.readyState).toBe(3)
        })
    })

    describe('window event listeners', () => {
        let postMessageSpy

        beforeEach(() => {
            postMessageSpy = jest
                .spyOn(window, 'postMessage')
                .mockImplementation(() => {})
        })

        afterEach(() => {
            postMessageSpy.mockRestore()
        })

        it('posts helpdesk-chat-preview-loaded when gorgias-widget-loaded fires', () => {
            window.dispatchEvent(new Event('gorgias-widget-loaded'))

            expect(postMessageSpy).toHaveBeenCalledWith(
                { type: 'helpdesk-chat-preview-loaded' },
                '*',
            )
        })

        it('posts helpdesk-chat-preview-error when error fires', () => {
            window.dispatchEvent(new Event('error'))

            expect(postMessageSpy).toHaveBeenCalledWith(
                { type: 'helpdesk-chat-preview-error' },
                '*',
            )
        })

        it('posts helpdesk-chat-preview-error when unhandledrejection fires', () => {
            window.dispatchEvent(new Event('unhandledrejection'))

            expect(postMessageSpy).toHaveBeenCalledWith(
                { type: 'helpdesk-chat-preview-error' },
                '*',
            )
        })
    })
})
