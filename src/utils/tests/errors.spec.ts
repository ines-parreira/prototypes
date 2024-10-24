import {captureException, init, setTag, setUser} from '@sentry/react'
import {BrowserTracing} from '@sentry/tracing'
import {ScopeContext} from '@sentry/types'

import {account} from 'fixtures/account'
import {user} from 'fixtures/users'
import {GorgiasUIEnv} from 'utils/environment'
import {
    ACCOUNT_DOMAIN_TAG,
    DENY_URLS,
    ERROR_EXTRA_CONSOLE_LOG_MESSAGE,
    IGNORED_ERRORS,
    initErrorReporter,
    InitErrorReporterParams,
    LANGUAGE_TAG,
    LANGUAGE_TAG_VALUE,
    reportError,
    SERVER_VERSION_TAG,
    TRACE_SAMPLE_RATE,
} from 'utils/errors'
import {
    assumeMock,
    mockDevelopmentEnvironment,
    mockProductionEnvironment,
    mockStagingEnvironment,
} from 'utils/testing'

jest.mock('@sentry/react')

const captureExceptionMock = captureException as jest.MockedFunction<
    typeof captureException
>
const initMock = assumeMock(init)
const setUserMock = assumeMock(setUser)
const setTagMock = assumeMock(setTag)

const consoleErrorMock = jest.fn()
global.console.error = consoleErrorMock

const userAgentMock = jest.fn()
Object.defineProperty(global.navigator, 'userAgent', {
    get: userAgentMock,
})

describe('errors util', () => {
    beforeEach(() => {
        userAgentMock.mockReturnValue(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36'
        )
    })

    describe('initErrorReporter', () => {
        const defaultInitOptions: InitErrorReporterParams = {
            dsn: 'https://example.com/error',
            clientVersion: 'foo',
            serverVersion: 'bar',
            environment: GorgiasUIEnv.Development,
            currentAccount: account,
            currentUser: user,
        }

        it('should init sentry', () => {
            initErrorReporter(defaultInitOptions)

            expect(initMock).toHaveBeenCalledWith({
                dsn: defaultInitOptions.dsn,
                release: defaultInitOptions.clientVersion,
                environment: defaultInitOptions.environment,
                tracesSampleRate: TRACE_SAMPLE_RATE,
                ignoreErrors: IGNORED_ERRORS,
                denyUrls: DENY_URLS,
                enabled: true,
                integrations: [expect.any(BrowserTracing)],
            })
        })

        it(`should set tag "${LANGUAGE_TAG}" equal "${LANGUAGE_TAG_VALUE}"`, () => {
            initErrorReporter(defaultInitOptions)

            expect(setTagMock).toHaveBeenCalledWith(
                LANGUAGE_TAG,
                LANGUAGE_TAG_VALUE
            )
        })

        it(`should set tag "${SERVER_VERSION_TAG}"`, () => {
            initErrorReporter(defaultInitOptions)

            expect(setTagMock).toHaveBeenCalledWith(
                SERVER_VERSION_TAG,
                defaultInitOptions.serverVersion
            )
        })

        it(`should set tag "${ACCOUNT_DOMAIN_TAG}"`, () => {
            initErrorReporter(defaultInitOptions)

            expect(setTagMock).toHaveBeenCalledWith(
                ACCOUNT_DOMAIN_TAG,
                account.domain
            )
        })

        it('should set user', () => {
            initErrorReporter(defaultInitOptions)

            expect(setUserMock).toHaveBeenCalledWith({
                id: user.id.toString(),
                name: user.name,
                email: user.email,
            })
        })

        it.each([
            {
                browser: 'IE8',
                userAgent:
                    'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)',
            },
            {
                browser: 'mobile safari',
                userAgent:
                    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1',
            },
        ])('should disable reporting for $browser', ({userAgent}) => {
            userAgentMock.mockReturnValue(userAgent)

            initErrorReporter(defaultInitOptions)

            expect(initMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    enabled: false,
                })
            )
        })
    })

    describe('reportError', () => {
        const testError = Error('Test error')
        const defaultOptions: Partial<ScopeContext> = {
            extra: {
                foo: 'bar',
            },
        }

        it('should only display error on the console in development environment', () => {
            mockDevelopmentEnvironment()

            reportError(testError, defaultOptions)

            expect(captureExceptionMock).not.toBeCalled()
            expect(consoleErrorMock).toHaveBeenCalledWith(testError)
            expect(consoleErrorMock).toHaveBeenCalledWith(
                ERROR_EXTRA_CONSOLE_LOG_MESSAGE,
                defaultOptions.extra
            )
        })

        it('should only report error to Sentry in production environment', () => {
            mockProductionEnvironment()

            reportError(testError, defaultOptions)

            expect(consoleErrorMock).not.toHaveBeenCalled()
            expect(captureExceptionMock).toHaveBeenCalledWith(
                testError,
                defaultOptions
            )
        })

        it('should report error to Sentry and display error on the console in staging environment', () => {
            mockStagingEnvironment()

            reportError(testError, defaultOptions)

            expect(captureExceptionMock).toHaveBeenCalledWith(
                testError,
                defaultOptions
            )
            expect(consoleErrorMock).toHaveBeenCalledWith(testError)
            expect(consoleErrorMock).toHaveBeenCalledWith(
                ERROR_EXTRA_CONSOLE_LOG_MESSAGE,
                defaultOptions.extra
            )
        })
    })
})
