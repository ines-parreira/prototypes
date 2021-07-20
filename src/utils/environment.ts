export enum GorgiasUIEnv {
    Production = 'production',
    Staging = 'staging',
    Development = 'development',
}

export function getEnvironment(): GorgiasUIEnv {
    if (window.STAGING) {
        return GorgiasUIEnv.Staging
    }
    if (window.PRODUCTION) {
        return GorgiasUIEnv.Production
    }
    return GorgiasUIEnv.Development
}

export function isProduction(): boolean {
    return getEnvironment() === GorgiasUIEnv.Production
}

export function isStaging(): boolean {
    return getEnvironment() === GorgiasUIEnv.Staging
}

export function isDevelopment(): boolean {
    return getEnvironment() === GorgiasUIEnv.Development
}
