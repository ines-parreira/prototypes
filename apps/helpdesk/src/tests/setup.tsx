import './mockAudioContext'

import { setImmediate } from 'timers'
import { TextDecoder, TextEncoder } from 'util'
import MutationObserver from '@sheerun/mutationobserver-shim'
import mockMoment from 'moment'
import type { MomentTimezone } from 'moment-timezone'

import '@formatjs/intl-displaynames/polyfill'
import '@formatjs/intl-displaynames/locale-data/en'

import {
    featureFlagsClientMock,
    resetFeatureFlagsMocks,
} from '@repo/feature-flags/testing'
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

window.CSRF_TOKEN = 'abcd'
window.GORGIAS_RELEASE = '1'

// Required until we have some dispatch in
// react query callbacks
jest.mock('@repo/api-resources', () => {
    const axiosModule = jest.requireActual('axios') as typeof import('axios')
    const { Duration } = jest.requireActual(
        '@gorgias/toolkit',
    ) as typeof import('@gorgias/toolkit')
    const axios = axiosModule.default
    const gorgiasAppsAuthInterceptor = jest.fn()

    const appQueryClient = mockQueryClient()

    return {
        __esModule: true,
        appQueryClient,
        queryCache: appQueryClient.getQueryCache(),
        createClient: () => axios,
        default: axios,
        gorgiasAppsAuthInterceptor,
        handleNewRelease: jest.fn(),
        initializeNewReleaseHandler: jest.fn(),
        timeoutTime: Duration.hours(3),
    }
})

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

jest.mock('@gorgias/copilot', () => ({
    __esModule: true,
    CopilotProvider: jest.fn(
        ({ children }: { children: import('react').ReactNode }) => children,
    ),
    GorgiasCopilotAgent: jest.fn(),
    CopilotPanel: jest.fn(() => null),
    ArtifactCard: jest.fn(
        (props: {
            title?: string
            actionLabel?: string
            onAction?: () => void
            actions?: { label: string; onClick?: () => void }[]
        }) => {
            const React = require('react')
            return React.createElement(
                'div',
                null,
                React.createElement('span', null, props.title),
                props.actionLabel
                    ? React.createElement(
                          'button',
                          { type: 'button', onClick: props.onAction },
                          props.actionLabel,
                      )
                    : null,
                ...(props.actions ?? []).map((action, index: number) =>
                    React.createElement(
                        'button',
                        {
                            key: index,
                            type: 'button',
                            onClick: action.onClick,
                        },
                        action.label,
                    ),
                ),
            )
        },
    ),
    useCopilot: jest.fn(() => ({
        sendPrompt: () => undefined,
        newThread: () => undefined,
        switchThread: () => undefined,
        abort: () => undefined,
        agent: undefined,
        agentKey: '',
        threadId: '',
    })),
    useCopilotPanel: jest.fn(() => ({
        isOpen: false,
        setIsOpen: () => undefined,
        width: 400,
        setWidth: () => undefined,
    })),
    useMessageContextAttachments: jest.fn(() => ({
        messageAttachment: undefined,
        canAttach: true,
        setMessageAttachment: () => undefined,
        clearMessageAttachment: () => undefined,
    })),
    useCopilotContext: jest.fn(),
    useConfigureSuggestions: jest.fn(),
    useCopilotToolCallResult: jest.fn(),
    useRunLifecycle: jest.fn(() => ({ isRunning: false })),
    useSuggestionLifecycle: jest.fn(),
    useThreadLifecycle: jest.fn(),
}))

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

function getMockedFlagValue<T>(flag: string, defaultValue: T): T {
    const flags = featureFlagsClientMock.allFlags() ?? {}

    if (Object.prototype.hasOwnProperty.call(flags, flag)) {
        return flags[flag] as T
    }

    return featureFlagsClientMock.variation(flag, defaultValue) as T
}

jest.mock('core/theme/useTheme.ts', () => ({
    useTheme: jest.fn(() => ({
        name: THEME_NAME.Light,
        resolvedName: THEME_NAME.Light,
        tokens: themeTokenMap[THEME_NAME.Light],
    })),
}))

jest.mock('core/theme/useActualTheme.ts', () => ({
    useActualTheme: jest.fn(() => [THEME_NAME.Light, jest.fn()]),
}))

jest.mock('@repo/feature-flags', () => {
    const actual = jest.requireActual(
        '@repo/feature-flags',
    ) as typeof import('@repo/feature-flags')

    const useFlag = jest.fn(function useFlagImpl(
        flag: string,
        defaultValue: unknown = false,
    ) {
        return getMockedFlagValue(flag, defaultValue)
    })

    const useFlagWithLoading = jest.fn(function useFlagWithLoadingImpl(
        flag: string,
        defaultValue: unknown = false,
    ) {
        return {
            value: getMockedFlagValue(flag, defaultValue),
            isLoading: false,
        }
    })

    const fetchFlag = jest.fn(async function fetchFlagImpl(
        flag: string,
        defaultValue: unknown = false,
    ) {
        return {
            flag: getMockedFlagValue(flag, defaultValue),
            error: null,
        }
    })

    const useHelpdeskV2BaselineFlag = jest.fn(() => {
        const hasUIVisionBetaBaselineFlag = getMockedFlagValue(
            actual.FeatureFlagKey.UIVisionBetaBaseline,
            false,
        )

        return {
            hasUIVisionBetaBaselineFlag,
            hasUIVisionBeta: hasUIVisionBetaBaselineFlag,
            onToggle: jest.fn(),
        }
    })

    const useHelpdeskV2MS2Flag = jest.fn(() => {
        const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()

        return hasUIVisionBeta
    })

    const useHelpdeskV2WayfindingMS1Flag = jest.fn(() => {
        const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()

        return hasUIVisionBeta
    })

    const useTicketNavViewSourceSdkFlag = jest.fn(() =>
        getMockedFlagValue(actual.FeatureFlagKey.TicketNavViewSourceSdk, false),
    )

    const useDefaultViewsSourceSdkFlag = jest.fn(() =>
        getMockedFlagValue(actual.FeatureFlagKey.DefaultViewsSourceSdk, false),
    )

    const useDefaultViewsSourceSdkFlagWithLoading = jest.fn(() => ({
        isLoading: false,
        value: getMockedFlagValue(
            actual.FeatureFlagKey.DefaultViewsSourceSdk,
            false,
        ),
    }))

    const useTicketNavViewSourceSdkFlagWithLoading = jest.fn(() => ({
        isLoading: false,
        value: getMockedFlagValue(
            actual.FeatureFlagKey.TicketNavViewSourceSdk,
            false,
        ),
    }))

    const useHelpdeskV2MS4Dash6Flag = jest.fn(() => {
        const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()

        return hasUIVisionBeta
    })

    return {
        ...actual,
        FeatureFlagsProvider: ({ children }: { children: unknown }) => children,
        FeatureFlagKey: actual.FeatureFlagKey,
        initFeatureFlagsClient: jest.fn(),
        useFlag,
        fetchFlag,
        useAreFlagsLoading: jest.fn(() => false),
        useFlagWithLoading,
        useHelpdeskV2BaselineFlag,
        useHelpdeskV2MS2Flag,
        useHelpdeskV2MS4Dash6Flag,
        useHelpdeskV2WayfindingMS1Flag,
        useDefaultViewsSourceSdkFlag,
        useDefaultViewsSourceSdkFlagWithLoading,
        useTicketNavViewSourceSdkFlag,
        useTicketNavViewSourceSdkFlagWithLoading,
    }
})

beforeEach(() => {
    resetFeatureFlagsMocks()
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
    socketManager: SocketManagerMock(),
}))
jest.mock('services/socketManager/socketManager', () => ({
    __esModule: true,
    default: SocketManagerMock(),
    socketManager: SocketManagerMock(),
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
