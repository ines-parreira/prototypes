import {datadogLogs} from '@datadog/browser-logs'
import {datadogRum} from '@datadog/browser-rum'

import {Account} from 'state/currentAccount/types'
import {User} from 'config/types/user'
import {
    DATADOG_CLIENT_TOKEN,
    DATADOG_RUM_APPLICATION_ID,
    DATADOG_RUM_CLIENT_TOKEN,
} from 'config'
import {GorgiasUIEnv} from './environment'

export const DATADOG_SITE = 'datadoghq.com'
export const DATADOG_LOGS_SERVICE = 'web-client'
export const DATADOG_LOGS_SESSION_SAMPLE_RATE = 100
export const DATADOG_RUM_SERVICE = 'helpdesk-web-app'
export const DATADOG_RUM_SESSION_SAMPLE_RATE = 5
export const DATADOG_RUM_SESSION_REPLAY_SAMPLE_RATE = 0

export type InitDatadogLoggerOptions = {
    account: Account
    user: User
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
        forwardErrorsToLogs: true,
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
    account: Account
    user: User
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
