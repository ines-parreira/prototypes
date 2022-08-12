import React from 'react'
import MutationObserver from '@sheerun/mutationobserver-shim'
import mockMoment from 'moment'
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import _noop from 'lodash/noop'
import {MomentTimezone} from 'moment-timezone'

import history from '../pages/history'

Enzyme.configure({adapter: new Adapter()})

// Set default moment timezone
const moment = jest.requireActual('moment-timezone')
;(moment as {tz: MomentTimezone}).tz.setDefault('America/Creston')

Object.defineProperty(window, 'ResizeObserver', {
    value: function () {
        return {
            observe: () => null,
            disconnect: () => null,
        }
    },
})

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
    value: jest.fn().mockResolvedValue(undefined),
})

// https://github.com/testing-library/react-testing-library/issues/731
global.MutationObserver = MutationObserver

// https://github.com/mui-org/material-ui/issues/15726#issuecomment-493124813
global.document.createRange = () =>
    ({
        setStart: _noop,
        setEnd: _noop,
        commonAncestorContainer: {
            nodeName: 'BODY',
            ownerDocument: document,
        },
    } as Range)

// Mock of the localStorage API
// to be able to test portion of code which access the localStorage API
class LocalStorageMock {
    store: Record<string, unknown>

    constructor() {
        this.store = {}
    }

    length = 0

    clear() {
        this.store = {}
    }

    getItem(key: string) {
        return this.store[key] || null
    }

    setItem(key: string, value: string | number) {
        this.store[key] = value.toString()
    }

    removeItem(key: string) {
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
    Permission = {
        get: () => 'granted',
    }

    notifications: Record<string, unknown>[]

    constructor() {
        this.notifications = []
    }

    getAll() {
        return this.notifications
    }

    clear() {
        this.notifications = []
    }

    create(title: string, data: Record<string, unknown>) {
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

;(window as unknown as {SharedWorker: typeof MockSharedWorker}).SharedWorker =
    MockSharedWorker

class MockBroadcastChannel {
    addEventListener = jest.fn()
    postMessage = jest.fn()
    constructorSpy = jest.fn()

    constructor(...args: unknown[]) {
        this.constructorSpy(...args)
    }
}

;(
    window as unknown as {BroadcastChannel: typeof MockBroadcastChannel}
).BroadcastChannel = MockBroadcastChannel

jest.mock('push.js', () => {
    return new mockPushJS()
})

// Mock axios implementation
jest.mock('../models/api/resources.ts')
window.CSRF_TOKEN = 'abcd'
window.GORGIAS_RELEASE = '1'

jest.mock(
    '../utils/date.ts',
    () =>
        ({
            ...jest.requireActual('../utils/date.ts'),
            getMoment: jest.fn(() => mockMoment('2018-10-01T00:00:00Z')),
            getMomentNow: jest.fn(() => 'nowTimestamp'),
            getMomentUtcISOString: jest.fn(() => '2018-05-07T18:02:46.039Z'),
            getMomentTimezoneNames: jest.fn(() => [
                'UTC',
                'US/Pacific',
                'Australia/AUR',
            ]),
        } as Record<string, unknown>)
)

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            /* eslint-disable jsx-a11y/anchor-has-content */
            Link: (props: Record<string, unknown>) => <a {...props} />,
            NavLink: (props: Record<string, unknown>) => <a {...props} />,
            /* eslint-enable */
        } as Record<string, unknown>)
)

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
            ;(done as unknown as {fail: (error: Error) => void}).fail(error)
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
function offsetParent(this: Node | null) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let element = this
    let style
    let parent = null
    if (!document) {
        return null
    }

    while (element && element !== document.documentElement) {
        style = window.getComputedStyle(element as HTMLElement)
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
// @ts-ignore
delete window.location
window.location = JSON.parse(windowLocation)
window.location.reload = jest.fn()

window.EMAIL_FORWARDING_DOMAIN = 'emails.gorgias.com'

// Mock analytics
window.SEGMENT_ANALYTICS_USER_ID = '1_1'
globalThis.analytics = {
    addIntegration: jest.fn(),
    alias: jest.fn(),
    debug: jest.fn(),
    group: jest.fn(),
    identify: jest.fn(),
    init: jest.fn(),
    load: jest.fn(),
    on: jest.fn(),
    page: jest.fn(),
    ready: jest.fn(),
    reset: jest.fn(),
    setAnonymousId: jest.fn(),
    timeout: jest.fn(),
    track: jest.fn(),
    trackForm: jest.fn(),
    trackLink: jest.fn(),
    use: jest.fn(),
    user: jest.fn(),
}
