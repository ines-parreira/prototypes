import MutationObserver from '@sheerun/mutationobserver-shim'
import mockMoment from 'moment'
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import _noop from 'lodash/noop'
import React from 'react'

import history from '../pages/history.ts'

Enzyme.configure({adapter: new Adapter()})

// Set default moment timezone
const moment = jest.requireActual('moment-timezone')
moment.tz.setDefault('America/Creston')

// jsdom does not support matchMedia
Object.defineProperty(window, 'matchMedia', {
    value: jest.fn(() => {
        return {
            matches: true,
            addListener: jest.fn(),
            removeListener: jest.fn(),
        }
    }),
})

//jsdom does not support HTMLMediaElement
Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
    value: jest.fn(),
})
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    value: jest.fn().mockResolvedValue(),
})

// https://github.com/testing-library/react-testing-library/issues/731
global.MutationObserver = MutationObserver

// https://github.com/mui-org/material-ui/issues/15726#issuecomment-493124813
global.document.createRange = () => ({
    setStart: _noop,
    setEnd: _noop,
    commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document,
    },
})

// Mock of the localStorage API
// to be able to test portion of code which access the localStorage API
class LocalStorageMock {
    constructor() {
        this.store = {}
    }

    length = 0

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
    value: new LocalStorageMock(),
})

// Mock historyAPI
history.push = jest.fn()

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
            ...data,
        })
    }
}

class MockSharedWorker {
    port = {
        start: jest.fn(),
        postMessage: jest.fn(),
    }
}

window.SharedWorker = MockSharedWorker

class MockBroadcastChannel {
    addEventListener = jest.fn()
    postMessage = jest.fn()
    constructorSpy = jest.fn()

    constructor(...args) {
        this.constructorSpy(...args)
    }
}

window.BroadcastChannel = MockBroadcastChannel

jest.mock('push.js', () => {
    return new mockPushJS()
})

// Mock axios implementation
jest.mock('../models/api/resources.ts')
window.CSRF_TOKEN = 'abcd'
window.GORGIAS_RELEASE = '1'

jest.mock('../utils/date.ts', () => ({
    ...jest.requireActual('../utils/date.ts'),
    getMoment: jest.fn(() => mockMoment('2018-10-01T00:00:00Z')),
    getMomentNow: jest.fn(() => 'nowTimestamp'),
    getMomentUtcISOString: jest.fn(() => '2018-05-07T18:02:46.039Z'),
    getMomentTimezoneNames: jest.fn(() => [
        'UTC',
        'US/Pacific',
        'Australia/AUR',
    ]),
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    /* eslint-disable jsx-a11y/anchor-has-content */
    Link: (props) => <a {...props} />,
    NavLink: (props) => <a {...props} />,
    /* eslint-enable */
}))

jest.mock('chart.js')

Object.defineProperty(window, 'requestAnimationFrame', {
    value: jest.fn(),
})

Object.defineProperty(window, 'cancelAnimationFrame', {
    value: jest.fn(),
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
function supportsOffsetParent() {
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
function offsetParent() {
    let element = this
    let style
    let parent = null
    if (!document) {
        return null
    }

    while (element && element !== document.documentElement) {
        style = window.getComputedStyle(element)
        if (style.getPropertyValue('display') === 'none') {
            return null
        }
        if (
            !parent &&
            element !== this &&
            (style.getPropertyValue('position') !== 'static' ||
                element === document.body)
        ) {
            parent = element
        }
        element = element.parentNode
    }

    return parent
}

if (!supportsOffsetParent()) {
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
        get: offsetParent,
    })
}

const windowLocation = JSON.stringify(window.location)
delete window.location
window.location = JSON.parse(windowLocation)
window.location.reload = jest.fn()

window.EMAIL_FORWARDING_DOMAIN = 'emails.gorgias.com'
