import {browserHistory} from 'react-router'
import mockMoment from 'moment'
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

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

// Mock browserHistoryAPI
browserHistory.push = jest.fn()

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

jest.mock('../utils/date', () => ({
    ...require.requireActual('../utils/date'),
    getMoment: jest.fn(() => mockMoment('2018-10-01T00:00:00Z')),
    getMomentNow: jest.fn(() => 'nowTimestamp'),
    getMomentUtcISOString: jest.fn(() => '2018-05-07T18:02:46.039Z'),
    getMomentTimezoneNames: jest.fn(() => ['UTC', 'US/Pacific', 'Australia/AUR'])
}))

Object.defineProperty(window, 'requestAnimationFrame', {
    value: jest.fn()
})

Object.defineProperty(window, 'cancelAnimationFrame', {
    value: jest.fn()
})

// failed expect in timeouts require try/catch and done.fail
// https://github.com/facebook/jest/issues/3519
global.jestSetTimeout = (body, timeout, done) => {
    setTimeout(() => {
        try {
            body()
            done()
        } catch (error) {
            done.fail(error)
        }
    }, timeout)
}

// offsetParent unsupported by jsdom
// https://github.com/jsdom/jsdom/issues/1261
function supportsOffsetParent () {
    let support = true
    const div = document.createElement('div')
    document.body.appendChild(div)
    if (div.offsetParent === null) {
        support = false
        document.body.removeChild(div)
    }
    return support
}

// offsetParent polyfill
// WARNING does not support the complete spec (eg. position: fixed)
function offsetParent () {
    let element = this
    let style
    let parent = null
    if (!document) {
        return null
    }

    while (
        element
        && element !== document.documentElement
    ) {
        style = window.getComputedStyle(element)
        if (style.getPropertyValue('display') === 'none') {
            return null
        }
        if (
            !parent
            && element !== this
            && (
                style.getPropertyValue('position') !== 'static'
                || element === document.body
            )
        ) {
            parent = element
        }
        element = element.parentNode
    }

    return parent
}

if (!supportsOffsetParent()) {
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
        get: offsetParent
    })
}

const windowLocation = JSON.stringify(window.location)
delete window.location
window.location = JSON.parse(windowLocation)
