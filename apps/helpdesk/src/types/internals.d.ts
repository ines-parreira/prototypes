import { Middleware } from 'redux'

import { Page } from 'services/statusPageManager/types'
import { GorgiasInitialState, InitialReactQueryState } from 'types'
import { SystemMessage } from 'utils'

function ObiSDK(action: 'update', payload: { isActive: boolean }): void
function ObiSDK(action: 'startSession', payload: { planUuid: string }): void
function ObiSDK(action: 'stopSession'): void

declare global {
    interface Window {
        GORGIAS_CONSTANTS: { [key: string]: any }
        GORGIAS_STATE: GorgiasInitialState & InitialReactQueryState
        SEGMENT_EVENTS_TO_TRACK?: { data: any; type: string }[]
        SYSTEM_MESSAGES: SystemMessage[]
        GORGIAS_RELEASE: string
        SERVICE_WORKER_BUILD_URL: string
        SHARED_WORKER_BUILD_URL: string
        WS_URL: string
        CLIENT_ID: string
        StatusPage: {
            page: typeof Page
        }
        GORGIAS_CLUSTER: string
        CSRF_TOKEN: string
        DEVELOPMENT: boolean
        PRODUCTION: boolean
        STAGING: boolean
        IMAGE_PROXY_SIGN_KEY: Maybe<string>
        IMAGE_PROXY_URL: string
        noticeable: {
            render: (target: string, id: string) => Promise<void>
            on: (
                event: string,
                id: string,
                callback: (e: Record<string, any>) => void,
            ) => void
            destroy: (target: string, id: string) => Promise<void>
            do: (action: string, id: string) => void
        }
        noticeableWidgetId: string
        PHRASE_PREDICTION_URL: string
        PHRASE_FEEDBACK_URL: string
        GorgiasChat?: {
            open: () => void
            setPage: (page: string) => void
            isOpen: () => boolean
            previewFlow: (params: {
                flowLabel: string
                flowLanguage: string
                flowId: string
            }) => void
            updateSSPTexts(param: Record<string, string>): void
        }
        GorgiasCanduRouter?: {
            route: (url: string) => void
        }
        loadGorgiasChat?: (isAiAgentPath: boolean) => void
        GORGIAS_SUPPORT_EMAIL: string
        STRIPE_PUBLIC_KEY?: string
        Hotswap?: (params: { token: string; onClose?: () => void }) => {
            open: () => void
        }
        DISABLE_ACTIVITY_POLLING: string
        AUTH_TIME: number | null
        USER_IMPERSONATED: true | null
        SEGMENT_ANALYTICS_USER_ID: string
        GORGIAS_LAUNCHDARKLY_CLIENT_ID: string
        SENTRY_DSN: string
        WHATSAPP_APP_ID: string
        devToolsExtension: () => Middleware
        Candu?: {
            elementCanduRootMap?: Map<
                HTMLElement,
                { root: HTMLElement; shadowChild: ShadowRoot }
            >
            init: (params: {
                clientToken: string
                userId: string
                traits?: Record<string, unknown>
                variables?: Record<string, unknown>
                hmac?: string
                callbacks?: Record<string, unknown>
            }) => void
            providerProps?: {
                clientToken: string
                userId: string
            }
            getMembership: () => Promise<string[]>
        }
        ObiSDK?: typeof ObiSDK
        hj?: (
            method: 'event' | 'identify' | 'stateChange',
            ...data: unknown[]
        ) => void
        KNOCK_PUBLIC_KEY: string
        KNOCK_TOKEN: string
        GORGIAS_CHAT_CLUSTER_URL: string
        GORGIAS_SELF_SERVICE_PORTAL_URL: string
    }

    function jestSetTimeout(
        value: () => void,
        second: number,
        test: () => void,
    ): void

    namespace JSX {
        interface IntrinsicElements {
            'grammarly-extension': any
        }
    }

    interface PerformancePaintTiming extends PerformanceEntry {}
}
