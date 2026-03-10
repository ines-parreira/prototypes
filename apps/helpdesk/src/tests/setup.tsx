import './mockAudioContext'

import MutationObserver from '@sheerun/mutationobserver-shim'
import { mockFlags } from 'jest-launchdarkly-mock'
import mockMoment from 'moment'
import type { MomentTimezone } from 'moment-timezone'
import { setImmediate } from 'timers'
import { TextDecoder, TextEncoder } from 'util'

import '@formatjs/intl-displaynames/polyfill'
import '@formatjs/intl-displaynames/locale-data/en'

import { history } from '@repo/routing'
import { envVars } from '@repo/utils'

import { account } from 'fixtures/account'
import { user } from 'fixtures/users'

import { mockQueryClient } from './reactQueryTestingUtils'

import './customMatchers'

const { THEME_NAME, themeTokenMap } =
    require('core/theme') as typeof import('core/theme')

// Set default moment timezone
const moment = jest.requireActual('moment-timezone')
;(moment as { tz: MomentTimezone }).tz.setDefault(envVars.TZ || 'UTC')

Object.defineProperty(window, 'ResizeObserver', {
    value: function () {
        return {
            observe: () => null,
            disconnect: () => null,
            unobserve: () => null,
        }
    },
    writable: true,
})

Object.defineProperty(window, 'IntersectionObserver', {
    value: function () {
        return {
            observe: () => null,
            disconnect: () => null,
            unobserve: () => null,
            takeRecords: () => [],
            root: null,
            rootMargin: '',
            thresholds: [],
        }
    },
    writable: true,
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
    writable: true,
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

// Mock historyAPI
history.push = jest.fn()
history.replace = jest.fn()

// Mock of the PushJS API (browser notification)
class mockPushJS {
    Permission = { get: () => 'granted' }

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
        this.notifications.push({ title, ...data })
    }
}

class MockSharedWorker {
    constructorSpy = jest.fn()
    port = { start: jest.fn(), postMessage: jest.fn() }
    constructor(...args: unknown[]) {
        this.constructorSpy(...args)
    }
}

;(window as unknown as { SharedWorker: typeof MockSharedWorker }).SharedWorker =
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
    window as unknown as { BroadcastChannel: typeof MockBroadcastChannel }
).BroadcastChannel = MockBroadcastChannel

jest.mock('push.js', () => {
    return new mockPushJS()
})

// Mock axios implementation
jest.mock('../models/api/resources.ts')
window.CSRF_TOKEN = 'abcd'
window.GORGIAS_RELEASE = '1'

// Required until we have some dispatch in
// react query callbacks
jest.mock('api/queryClient', () => ({ appQueryClient: mockQueryClient() }))

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
        }) as Record<string, unknown>,
)

jest.mock('chart.js')

Object.defineProperty(window, 'requestAnimationFrame', { value: jest.fn() })

Object.defineProperty(window, 'cancelAnimationFrame', { value: jest.fn() })

Object.defineProperty(window, 'open', { value: jest.fn() })

// Needed to test self.close() in shared worker test
Object.defineProperty(window, 'self', {
    value: { ...window.self, close: jest.fn() },
})

// failed expect in timeouts require try/catch and done.fail
// https://github.com/facebook/jest/issues/3519
global.jestSetTimeout = (body, timeout, done) => {
    setTimeout(() => {
        try {
            body()
            done()
        } catch (error) {
            ;(done as unknown as { fail: (error: Error) => void }).fail(
                error as Error,
            )
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

window.GORGIAS_STATE = {
    currentAccount: account,
    currentUser: user,
    integrations: {
        authentication: {
            email: { forwarding_email_address: 'emails.gorgias.com' },
        },
    },
} as any

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

// Jest 28 - migration changes
global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder
global.setImmediate = setImmediate

// LaunchDarkly
mockFlags({})

// Font loading
Object.defineProperty(document, 'fonts', {
    value: jest.fn(() => {
        return { ready: Promise.resolve({}) }
    }),
})

// Mock scrollIntoView element property
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    value: jest.fn(),
    writable: true,
})

global.fetch = jest.fn(() =>
    Promise.resolve({ arrayBuffer: () => ({}) } as Response),
)

jest.mock('core/theme/useTheme.ts', () =>
    jest.fn(() => ({
        name: THEME_NAME.Light,
        resolvedName: THEME_NAME.Light,
        tokens: themeTokenMap[THEME_NAME.Light],
    })),
)

jest.mock('@repo/feature-flags', () => {
    const mockModule = jest.createMockFromModule(
        '@repo/feature-flags',
    ) as typeof import('@repo/feature-flags')
    const actual = jest.requireActual(
        '@repo/feature-flags',
    ) as typeof import('@repo/feature-flags')
    return {
        ...mockModule,
        FeatureFlagKey: actual.FeatureFlagKey,
        useFlag: jest.fn(),
        useFlagWithLoading: jest.fn(() => ({ value: false, isLoading: false })),
    }
})

const SocketManagerMock = () => ({
    registerJoinEvents: jest.fn(),
    registerReceivedEvents: jest.fn(),
    registerSendEvents: jest.fn(),
    unregisterReceivedEvents: jest.fn(),
    onMessage: jest.fn(),
    onHealthCheck: jest.fn(),
    onServerMessage: jest.fn(),
    onDisconnect: jest.fn(),
    onConnect: jest.fn(),
    send: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
    dispatchReduxAction: jest.fn(),
    onReload: jest.fn(),
    resetWorker: jest.fn(),
})

/*running the SocketManager creates flakiness in the tests
  due to the setTimeout of onDisconnect triggering an action dispatch*/
jest.mock('services/socketManager', () => ({
    __esModule: true,
    default: SocketManagerMock(),
}))
jest.mock('services/socketManager/socketManager', () => ({
    __esModule: true,
    default: SocketManagerMock(),
}))

jest.mock('pages/AppContext', () => ({
    useAppContext: jest.fn(() => ({
        collapsibleColumnChildren: null,
        setCollapsibleColumnChildren: jest.fn(),
        isCollapsibleColumnOpen: false,
        setIsCollapsibleColumnOpen: jest.fn(),
    })),
    AppContextProvider: ({ children }: { children: React.ReactNode }) =>
        children,
}))
