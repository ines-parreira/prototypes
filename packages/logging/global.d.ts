declare global {
    interface Window {
        DEVELOPMENT: boolean
        PRODUCTION: boolean
        STAGING: boolean
        USER_IMPERSONATED: true | null
        SEGMENT_ANALYTICS_USER_ID: string
    }
}

export {}
