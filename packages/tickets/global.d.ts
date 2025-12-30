declare global {
    interface Window {
        DEVELOPMENT: boolean
        PRODUCTION: boolean
        STAGING: boolean
        USER_IMPERSONATED: true | null
        SEGMENT_ANALYTICS_USER_ID: string
        GORGIAS_CLUSTER: string
        GORGIAS_LAUNCHDARKLY_CLIENT_ID: string
    }
}

export {}
