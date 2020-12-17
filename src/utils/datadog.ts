import {datadogLogs} from '@datadog/browser-logs'

import {Account} from '../state/currentAccount/types'
import {User} from '../config/types/user'
import {DATADOG_CLIENT_TOKEN} from '../config'

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
