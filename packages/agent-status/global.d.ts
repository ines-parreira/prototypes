declare global {
    interface Window {
        DEVELOPMENT: boolean
        PRODUCTION: boolean
        STAGING: boolean
        USER_IMPERSONATED: true | null
        GORGIAS_LAUNCHDARKLY_CLIENT_ID: string
        GORGIAS_CLUSTER: string
    }
}

export {}
