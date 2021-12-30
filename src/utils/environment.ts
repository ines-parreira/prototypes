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

export function getHelpCenterAuthApiBaseUrl(): string {
    if (isDevelopment()) {
        return 'http://acme.gorgias.docker:4001'
    }

    return ''
}

// TODO: Remove this to release SSP in Help Center
const SSP_HELP_CENTER_PRIVATE_LIST = [
    'self-serve.gorgias.com',
    'thisisatestforaustraliacluster.gorgias.com',
]
export function isSelfServeHelpCenterEnabled(): boolean {
    if (isProduction()) {
        return SSP_HELP_CENTER_PRIVATE_LIST.includes(location.host)
    }

    return true
}
