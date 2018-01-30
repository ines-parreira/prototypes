// jsdom does not support matchMedia
Object.defineProperty(window, 'matchMedia', {
    value: jest.fn(() => {
        return {
            matches: true,
            addListener: jest.fn(),
            removeListener: jest.fn()
        }
    })
})

// Mock of the localStorage API
// to be able to test portion of code which access the localStorage API
class LocalStorageMock {
    constructor() {
        this.store = {}
    }

    clear() {
        this.store = {}
    }

    getItem(key) {
        return this.store[key] || null
    }

    setItem(key, value) {
        this.store[key] = value.toString()
    }

    removeItem(key) {
        delete this.store[key]
    }
}

Object.defineProperty(window, 'localStorage', {
    value: new LocalStorageMock
})

// Mock of the PushJS API (browser notification)
class mockPushJS {
    constructor() {
        this.notifications = []
    }

    getAll() {
        return this.notifications
    }

    clear() {
        this.notifications = []
    }

    create(title, data) {
        this.notifications.push({
            title,
            ...data
        })
    }
}

jest.mock('push.js', () => {
    return new mockPushJS
})
