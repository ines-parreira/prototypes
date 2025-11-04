import { assumeMock } from '@repo/testing'
import * as envUtils from '@repo/utils'
import { fromJS } from 'immutable'
import { initApp } from 'init'

import { account } from 'fixtures/account'
import { user } from 'fixtures/users'
import { GorgiasInitialState, InitialReactQueryState } from 'types'
import { initDatadogLogger, initDatadogRum } from 'utils/datadog'
import { initErrorReporter } from 'utils/errors'
import { identifyUser } from 'utils/hotjar'
import { initSDKs } from 'utils/sdk'

type fromJSType = typeof fromJS

jest.mock('common/store', () => {
    const { fromJS } = jest.requireActual('immutable')
    return {
        store: {
            dispatch: jest.fn(),
            getState: () => ({
                billing: (fromJS as fromJSType)([]),
                currentAccount: (fromJS as fromJSType)({ id: 1 }),
                currentUser: (fromJS as fromJSType)({ id: 1 }),
            }),
        },
    }
})

jest.mock('utils/sdk')
jest.mock('utils/datadog')
jest.mock('utils/errors')
jest.mock('utils/launchDarkly')
jest.mock('utils/hotjar')

jest.mock('@repo/utils')
const envVarsMock = envUtils.envVars as envUtils.EnvVars
const getEnvironmentMock = assumeMock(envUtils.getEnvironment)
const isDevelopmentMock = assumeMock(envUtils.isDevelopment)
const isStagingMock = assumeMock(envUtils.isStaging)
const isProductionMock = assumeMock(envUtils.isProduction)

describe('init', () => {
    beforeEach(() => {
        getEnvironmentMock.mockReturnValue(envUtils.GorgiasUIEnv.Development)
        isDevelopmentMock.mockReturnValue(false)
        isStagingMock.mockReturnValue(false)
        isProductionMock.mockReturnValue(false)
    })

    describe('initApp()', () => {
        const defaultSentryDsn = 'test-sentry-dsn'
        const defaultGorgiasRelease = 'test-gorgias-release'
        const defaultWebAppRelease = 'test-web-app-release'
        const defaultGorgiasState = {
            currentAccount: account,
            currentUser: user,
        } as GorgiasInitialState & InitialReactQueryState
        const defaultEnvironment = envUtils.GorgiasUIEnv.Development

        beforeEach(() => {
            window.SENTRY_DSN = defaultSentryDsn
            window.GORGIAS_RELEASE = defaultGorgiasRelease
            envVarsMock.WEB_APP_RELEASE = defaultWebAppRelease
            window.GORGIAS_STATE = defaultGorgiasState
            getEnvironmentMock.mockReturnValue(
                envUtils.GorgiasUIEnv.Development,
            )
        })

        describe.each([
            {
                environment: envUtils.GorgiasUIEnv.Staging,
                setup: () => isStagingMock.mockReturnValue(true),
            },
            {
                environment: envUtils.GorgiasUIEnv.Production,
                setup: () => isProductionMock.mockReturnValue(true),
            },
        ])('$environment environment', ({ environment, setup }) => {
            beforeEach(() => {
                getEnvironmentMock.mockReturnValue(environment)
                setup()
            })

            it('should init datadog rum', () => {
                const expectedParams: Parameters<typeof initDatadogRum> = [
                    {
                        account,
                        user,
                        environment,
                        serverVersion: defaultGorgiasRelease,
                        clientVersion: defaultWebAppRelease,
                    },
                ]

                initApp()

                expect(initDatadogRum).toHaveBeenLastCalledWith(
                    ...expectedParams,
                )
            })

            it('should init datadog logger', () => {
                const expectedParams: Parameters<typeof initDatadogLogger> = [
                    {
                        account,
                        user,
                        environment,
                        serverVersion: defaultGorgiasRelease,
                        clientVersion: defaultWebAppRelease,
                    },
                ]

                initApp()

                expect(initDatadogLogger).toHaveBeenLastCalledWith(
                    ...expectedParams,
                )
            })
        })

        it('should not init datadog rum and logger on development environment', () => {
            initApp()

            expect(initDatadogRum).not.toHaveBeenCalled()
            expect(initDatadogLogger).not.toHaveBeenCalled()
        })

        it('should init error reporter when SENTRY_DSN is defined', () => {
            const expectedParams: Parameters<typeof initErrorReporter> = [
                {
                    dsn: defaultSentryDsn,
                    serverVersion: defaultGorgiasRelease,
                    clientVersion: defaultWebAppRelease,
                    environment: defaultEnvironment,
                    currentUser: defaultGorgiasState.currentUser,
                    currentAccount: defaultGorgiasState.currentAccount,
                },
            ]

            initApp()

            expect(initErrorReporter).toHaveBeenLastCalledWith(
                ...expectedParams,
            )
        })

        it('should not init error reporter when SENTRY_DSN is an empty string', () => {
            window.SENTRY_DSN = ''

            initApp()

            expect(initErrorReporter).not.toHaveBeenCalled()
        })

        it('should identify hotjar user', () => {
            initApp()

            expect(identifyUser).toHaveBeenCalledWith({
                serverVersion: defaultGorgiasRelease,
                clientVersion: defaultWebAppRelease,
                currentUser: defaultGorgiasState.currentUser,
                currentAccount: defaultGorgiasState.currentAccount,
            })
        })

        it('should init sdk libs', () => {
            initApp()

            expect(initSDKs).toHaveBeenCalled()
        })
    })
})
