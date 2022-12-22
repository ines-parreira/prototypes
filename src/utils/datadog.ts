import {datadogLogs} from '@datadog/browser-logs'
import {datadogRum} from '@datadog/browser-rum'
import {onINP} from 'web-vitals'

import {Account} from 'state/currentAccount/types'
import {User} from 'config/types/user'
import {
    DATADOG_CLIENT_TOKEN,
    DATADOG_RUM_APPLICATION_ID,
    DATADOG_RUM_CLIENT_TOKEN,
} from 'config'

export const initDatadogLogger = (
    account: Account,
    user: User,
    version: string
) => {
    datadogLogs.init({
        clientToken: DATADOG_CLIENT_TOKEN,
        site: 'datadoghq.com',
        forwardErrorsToLogs: true,
        version,
        service: 'web-client',
        env: 'helpdesk-web-client-production',
        sampleRate: 100,
    })
    datadogLogs.setLoggerGlobalContext({
        user: {
            id: user.id,
            email: user.email,
        },
        account: {
            domain: account.domain,
        },
    })
}

export const initDatadogRum = (
    account: Account,
    user: User,
    version: string
) => {
    datadogRum.init({
        clientToken: DATADOG_RUM_CLIENT_TOKEN,
        applicationId: DATADOG_RUM_APPLICATION_ID,
        site: 'datadoghq.com',
        service: 'helpdesk-web-app',
        version,
        sampleRate: 0.5,
        sessionReplaySampleRate: 0,
        trackResources: true,
        trackLongTasks: true,
    })
    datadogRum.setUser({
        id: user.id.toString(),
        email: user.email,
        domain: account.domain,
    })
    onINP(
        (metric) => {
            datadogRum.addAction('customWebVital', {
                inp: metric.value,
            })
        },
        {
            reportAllChanges: true,
        }
    )
}
