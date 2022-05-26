import type {RavenStatic} from 'raven-js'
import {Middleware} from 'redux'

import {Page} from 'services/statusPageManager/types'
import {GorgiasInitialState} from 'types'
import {SystemMessage} from 'utils'

declare global {
    interface Window {
        GORGIAS_CONSTANTS: {[key: string]: any}
        GORGIAS_STATE: GorgiasInitialState
        SEGMENT_EVENTS_TO_TRACK?: {data: any; type: string}[]
        SYSTEM_MESSAGES: SystemMessage[]
        Raven?: RavenStatic
        EMAIL_FORWARDING_DOMAIN: string
        GORGIAS_ASSETS_URL: Maybe<string>
        GORGIAS_RELEASE: string
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
        // https://github.com/zendesk/sunshine-conversations-core-js/issues/81
        Smooch?: {
            open: () => void
        }
        noticeable: {
            render: (target: string, id: string) => Promise<void>
            on: (
                event: string,
                id: string,
                callback: (e: Record<string, any>) => void
            ) => void
            destroy: (target: string, id: string) => Promise<void>
        }
        noticeableWidgetId: string
        PHRASE_PREDICTION_URL: string
        PHRASE_FEEDBACK_URL: string
        GorgiasChat?: {
            open: () => void
        }
        GORGIAS_SUPPORT_EMAIL: string
        STRIPE_PUBLIC_KEY?: string
        Hotswap?: (params: {token: string; onClose?: () => void}) => {
            open: () => void
        }
        DISABLE_ACTIVITY_POLLING: string
        USER_IMPERSONATED: true | null
        SEGMENT_ANALYTICS_USER_ID: string
        GORGIAS_LAUNCHDARKLY_CLIENT_ID: string
        devToolsExtension: () => Middleware
    }

    function jestSetTimeout(
        value: () => void,
        second: number,
        test: () => void
    ): void
}
