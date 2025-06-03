import { isValueOfStringEnum } from 'utils/types'

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

export enum NodeEnv {
    Development = 'development',
    Test = 'test',
    Production = 'production',
}

export interface EnvVars {
    NODE_ENV?: NodeEnv
    TZ?: string
    GORGIAS_ASSETS_URL?: string
    WEB_APP_RELEASE?: string
    DEVELOPER_NAME?: string
}

export const getEnvVars = ({
    GORGIAS_ASSETS_URL,
    NODE_ENV,
    TZ,
    WEB_APP_RELEASE,
    DEVELOPER_NAME,
}: NodeJS.ProcessEnv): EnvVars => ({
    TZ,
    GORGIAS_ASSETS_URL,
    WEB_APP_RELEASE,
    DEVELOPER_NAME,
    NODE_ENV:
        NODE_ENV && isValueOfStringEnum(NodeEnv, NODE_ENV)
            ? NODE_ENV
            : undefined,
})

export const envVars = Object.freeze(
    // We need to use a whole `process.env.VAR` path in order for
    // DefinePlugin to match and replace vars.
    // More info: https://linear.app/gorgias/issue/PLTOF-291/facade-for-processenv#comment-4bbc6958
    getEnvVars({
        NODE_ENV: process.env.NODE_ENV,
        TZ: process.env.TZ,
        DEVELOPER_NAME: process.env.DEVELOPER_NAME,
        GORGIAS_ASSETS_URL: process.env.GORGIAS_ASSETS_URL,
        WEB_APP_RELEASE: process.env.WEB_APP_RELEASE,
    }),
)
