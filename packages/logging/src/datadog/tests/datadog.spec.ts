import { datadogLogs } from '@datadog/browser-logs'
import { datadogRum } from '@datadog/browser-rum'
import { GorgiasUIEnv } from '@repo/utils'

import type {
    InitDatadogLoggerOptions,
    InitDatadogRumOptions,
} from '../datadog'
import {
    DATADOG_CLIENT_TOKEN,
    DATADOG_LOGS_SERVICE,
    DATADOG_LOGS_SESSION_SAMPLE_RATE,
    DATADOG_RUM_APPLICATION_ID,
    DATADOG_RUM_CLIENT_TOKEN,
    DATADOG_RUM_SERVICE,
    DATADOG_RUM_SESSION_REPLAY_SAMPLE_RATE,
    DATADOG_RUM_SESSION_SAMPLE_RATE,
    DATADOG_SITE,
    initDatadogLogger,
    initDatadogRum,
} from '../datadog'

const account = {
    domain: 'acme.gorgias.help',
}

const user = {
    id: 123,
    email: 'agent@gorgias.com',
}

vi.mock('@datadog/browser-logs', () => ({
    datadogLogs: {
        init: vi.fn(),
        setGlobalContext: vi.fn(),
        setUser: vi.fn(),
    },
}))

vi.mock('@datadog/browser-rum', () => ({
    datadogRum: {
        init: vi.fn(),
        setGlobalContext: vi.fn(),
        setUser: vi.fn(),
    },
}))

describe('datadog', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

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
                forwardErrorsToLogs: false,
                version: defaultClientVersion,
                service: DATADOG_LOGS_SERVICE,
                env: defaultEnvironment,
                sessionSampleRate: DATADOG_LOGS_SESSION_SAMPLE_RATE,
            })
        })

        it('should set logger global context', () => {
            initDatadogLogger(defaultOptions)

            expect(datadogLogs.setGlobalContext).toHaveBeenCalledWith({
                serverVersion: defaultServerVersion,
            })
        })

        it('should set user context', () => {
            initDatadogLogger(defaultOptions)

            expect(datadogLogs.setUser).toHaveBeenLastCalledWith({
                id: user.id.toString(),
                email: user.email,
                domain: account.domain,
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
                beforeSend: expect.any(Function),
                clientToken: DATADOG_RUM_CLIENT_TOKEN,
                applicationId: DATADOG_RUM_APPLICATION_ID,
                site: DATADOG_SITE,
                service: DATADOG_RUM_SERVICE,
                version: defaultClientVersion,
                env: defaultEnvironment,
                sessionSampleRate: DATADOG_RUM_SESSION_SAMPLE_RATE,
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

            expect(datadogRum.setGlobalContext).toHaveBeenCalledWith({
                serverVersion: defaultServerVersion,
            })
        })

        it('should filter out errors in beforeSend', () => {
            initDatadogRum(defaultOptions)

            const initCall = vi.mocked(datadogRum.init).mock
                .calls[0][0] as unknown as {
                beforeSend: (
                    event: { type: string },
                    context?: unknown,
                ) => boolean
            }
            const beforeSend = initCall.beforeSend

            expect(
                beforeSend(
                    {
                        type: 'error',
                    },
                    {},
                ),
            ).toBe(false)

            expect(
                beforeSend(
                    {
                        type: 'action',
                    },
                    {},
                ),
            ).toBe(true)
        })
    })
})
