import {datadogLogs} from '@datadog/browser-logs'
import {datadogRum} from '@datadog/browser-rum'
import {Metric, onINP} from 'web-vitals'

import {
    DATADOG_LOGS_SAMPLE_RATE,
    DATADOG_LOGS_SERVICE,
    DATADOG_RUM_CUSTOM_WEB_VITAL_ACTION,
    DATADOG_RUM_SAMPLE_RATE,
    DATADOG_RUM_SERVICE,
    DATADOG_RUM_SESSION_REPLAY_SAMPLE_RATE,
    DATADOG_SITE,
    InitDatadogLoggerOptions,
    InitDatadogRumOptions,
    initDatadogLogger,
    initDatadogRum,
} from 'utils/datadog'
import {user} from 'fixtures/users'
import {account} from 'fixtures/account'
import {assumeMock} from 'utils/testing'
import {
    DATADOG_CLIENT_TOKEN,
    DATADOG_RUM_APPLICATION_ID,
    DATADOG_RUM_CLIENT_TOKEN,
} from 'config'
import {GorgiasUIEnv} from 'utils/environment'

jest.mock('@datadog/browser-logs')
jest.mock('@datadog/browser-rum')
jest.mock('web-vitals')

describe('datadog', () => {
    describe('initDatadogLogger', () => {
        const defaultClientVersion = 'v1.4.5'
        const defaultServerVersion = 'v2.0.1'
        const defaultEnvironment = GorgiasUIEnv.Staging
        const defaultOptions: InitDatadogLoggerOptions = {
            account,
            user,
            clientVersion: defaultClientVersion,
            serverVersion: defaultServerVersion,
            environment: defaultEnvironment,
        }

        it('should init datadog logs', () => {
            initDatadogLogger(defaultOptions)

            expect(datadogLogs.init).toHaveBeenCalledWith({
                clientToken: DATADOG_CLIENT_TOKEN,
                site: DATADOG_SITE,
                forwardErrorsToLogs: true,
                version: defaultClientVersion,
                service: DATADOG_LOGS_SERVICE,
                env: defaultEnvironment,
                sampleRate: DATADOG_LOGS_SAMPLE_RATE,
            })
        })

        it('should set logger global context', () => {
            initDatadogLogger(defaultOptions)

            expect(datadogLogs.setLoggerGlobalContext).toHaveBeenCalledWith({
                user: {
                    id: user.id,
                    email: user.email,
                },
                account: {
                    domain: account.domain,
                },
                serverVersion: defaultServerVersion,
            })
        })
    })

    describe('initDatadogRum', () => {
        const defaultClientVersion = 'v1.4.5'
        const defaultServerVersion = 'v2.0.1'
        const defaultEnvironment = GorgiasUIEnv.Staging
        const defaultOptions: InitDatadogRumOptions = {
            account,
            user,
            clientVersion: defaultClientVersion,
            serverVersion: defaultServerVersion,
            environment: defaultEnvironment,
        }

        it('should init datadog rum', () => {
            initDatadogRum(defaultOptions)

            expect(datadogRum.init).toHaveBeenCalledWith({
                clientToken: DATADOG_RUM_CLIENT_TOKEN,
                applicationId: DATADOG_RUM_APPLICATION_ID,
                site: DATADOG_SITE,
                service: DATADOG_RUM_SERVICE,
                version: defaultClientVersion,
                env: defaultEnvironment,
                sampleRate: DATADOG_RUM_SAMPLE_RATE,
                sessionReplaySampleRate: DATADOG_RUM_SESSION_REPLAY_SAMPLE_RATE,
                trackResources: true,
                trackLongTasks: true,
            })
        })

        it('should set user context', () => {
            initDatadogRum(defaultOptions)

            expect(datadogRum.setUser).toHaveBeenLastCalledWith({
                id: user.id.toString(),
                email: user.email,
                domain: account.domain,
            })
        })

        it('should set rum global context', () => {
            initDatadogRum(defaultOptions)

            expect(datadogRum.setRumGlobalContext).toHaveBeenCalledWith({
                serverVersion: defaultServerVersion,
            })
        })

        it('should report INP', () => {
            const inpValue = 123

            initDatadogRum(defaultOptions)
            const reportInp = assumeMock(onINP).mock.calls[0][0]!
            reportInp({
                value: inpValue,
            } as Metric)

            expect(datadogRum.addAction).toHaveBeenCalledWith(
                DATADOG_RUM_CUSTOM_WEB_VITAL_ACTION,
                {
                    inp: inpValue,
                }
            )
        })
    })
})
