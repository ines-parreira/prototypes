declare global {
    interface GorgiasStateCurrentAccount {
        domain: string
    }

    interface GorgiasStateCurrentUser {
        id?: number | null
    }

    interface GorgiasStateShared {
        currentAccount: GorgiasStateCurrentAccount
    }

    // Navigation API (not yet in lib.dom). Explicit declaration needed because
    // @trackstar/react-trackstar-link declares `[string]: Trackstar` on Window.
    interface Window {
        navigation?: EventTarget
        CLIENT_ID: string
        DEVELOPMENT: boolean
        PRODUCTION: boolean
        STAGING: boolean
        CSRF_TOKEN: string
        GORGIAS_RELEASE: string
        IMAGE_PROXY_SIGN_KEY: string | null | undefined
        IMAGE_PROXY_URL: string
        GORGIAS_STATE: GorgiasStateShared & {
            currentAccount: GorgiasStateCurrentAccount & {
                id?: number | null
            }
            currentUser?: GorgiasStateCurrentUser | null
        }
        USER_IMPERSONATED: true | null
        SEGMENT_ANALYTICS_USER_ID: string
        GORGIAS_CLUSTER: string
        HARNESS_CLIENT_SDK_KEY?: string
    }
}

export {}
