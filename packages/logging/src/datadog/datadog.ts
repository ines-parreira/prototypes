import { datadogLogs } from '@datadog/browser-logs'
import { datadogRum } from '@datadog/browser-rum'
import type { GorgiasUIEnv } from '@repo/utils'

export const DATADOG_CLIENT_TOKEN = 'pubc9857173f4901f3b10fc39dfcde707c6' // gitleaks:allow
export const DATADOG_RUM_CLIENT_TOKEN = 'pube64f1e4ec3c5172711f0a2d03cb1a0ff' // gitleaks:allow
export const DATADOG_RUM_APPLICATION_ID = 'a9fcd4e9-2ebd-47e7-92c2-9438dd12c9df'

export const DATADOG_SITE = 'datadoghq.com'
export const DATADOG_LOGS_SERVICE = 'web-client'
export const DATADOG_LOGS_SESSION_SAMPLE_RATE = 100
export const DATADOG_RUM_SERVICE = 'helpdesk-web-app'
export const DATADOG_RUM_SESSION_SAMPLE_RATE = 5
export const DATADOG_RUM_SESSION_REPLAY_SAMPLE_RATE = 0
type DatadogEvent = { type: string }

export type DatadogAccount = {
    domain: string
}

export type DatadogUser = {
    id: number | string
    email: string
}

export type InitDatadogLoggerOptions = {
    account: DatadogAccount
    user: DatadogUser
    clientVersion: string
    serverVersion: string
    environment: GorgiasUIEnv
}

export const initDatadogLogger = ({
    account,
    user,
    clientVersion,
    serverVersion,
    environment,
}: InitDatadogLoggerOptions) => {
    datadogLogs.init({
        clientToken: DATADOG_CLIENT_TOKEN,
        site: DATADOG_SITE,
        forwardErrorsToLogs: false,
        version: clientVersion,
        env: environment,
        service: DATADOG_LOGS_SERVICE,
        sessionSampleRate: DATADOG_LOGS_SESSION_SAMPLE_RATE,
    })
    datadogLogs.setGlobalContext({
        serverVersion,
    })
    datadogLogs.setUser({
        id: user.id.toString(),
        email: user.email,
        domain: account.domain,
    })
}

export type InitDatadogRumOptions = {
    account: DatadogAccount
    user: DatadogUser
    clientVersion: string
    serverVersion: string
    environment: GorgiasUIEnv
}

export const initDatadogRum = ({
    account,
    user,
    clientVersion,
    serverVersion,
    environment,
}: InitDatadogRumOptions) => {
    datadogRum.init({
        clientToken: DATADOG_RUM_CLIENT_TOKEN,
        applicationId: DATADOG_RUM_APPLICATION_ID,
        site: DATADOG_SITE,
        service: DATADOG_RUM_SERVICE,
        version: clientVersion,
        env: environment,
        sessionSampleRate: DATADOG_RUM_SESSION_SAMPLE_RATE,
        sessionReplaySampleRate: DATADOG_RUM_SESSION_REPLAY_SAMPLE_RATE,
        trackResources: true,
        trackLongTasks: true,
        beforeSend: (event: DatadogEvent) => {
            /**
             * Error monitoring is handled by Sentry.
             * We don't need to send errors to Datadog.
             * We only use Datadog for performance monitoring.
             */
            if (event.type === 'error') {
                return false
            }
            return true
        },
    })
    datadogRum.setUser({
        id: user.id.toString(),
        email: user.email,
        domain: account.domain,
    })
    datadogRum.setGlobalContext({
        serverVersion,
    })
}
