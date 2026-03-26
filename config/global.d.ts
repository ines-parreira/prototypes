declare global {
    interface GorgiasStateCurrentAccount {
        domain: string
    }

    interface GorgiasStateShared {
        currentAccount: GorgiasStateCurrentAccount
    }

    interface Window {
        DEVELOPMENT: boolean
        PRODUCTION: boolean
        STAGING: boolean
        CSRF_TOKEN: string
        GORGIAS_RELEASE: string
        IMAGE_PROXY_SIGN_KEY: string | null | undefined
        IMAGE_PROXY_URL: string
        GORGIAS_STATE: GorgiasStateShared
        USER_IMPERSONATED: true | null
        SEGMENT_ANALYTICS_USER_ID: string
        GORGIAS_CLUSTER: string
        GORGIAS_LAUNCHDARKLY_CLIENT_ID: string
    }
}

export {}
