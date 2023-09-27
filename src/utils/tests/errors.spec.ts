import {captureException, init, setTag, setUser} from '@sentry/react'
import {ScopeContext} from '@sentry/types'
import {Metric, onINP} from 'web-vitals'
import {BrowserTracing, Transaction} from '@sentry/tracing'
import {BrowserTracingOptions} from '@sentry/tracing/types/browser/browsertracing'

import {
    DENY_URLS,
    ERROR_EXTRA_CONSOLE_LOG_MESSAGE,
    IGNORED_ERRORS,
    initErrorReporter,
    InitErrorReporterParams,
    PatchedBrowserTracing,
    reportError,
    TRACE_SAMPLE_RATE,
    withInpMeasurements,
} from 'utils/errors'
import {
    assumeMock,
    mockDevelopmentEnvironment,
    mockProductionEnvironment,
    mockStagingEnvironment,
} from 'utils/testing'
import {GorgiasUIEnv} from 'utils/environment'
import {account} from 'fixtures/account'
import {user} from 'fixtures/users'

jest.mock('@sentry/react')
jest.mock('web-vitals')

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

const onInpMock = onINP as jest.MockedFunction<typeof onINP>

describe('errors util', () => {
    beforeEach(() => {
        userAgentMock.mockReturnValue(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36'
        )
    })

    describe('initErrorReporter', () => {
        const defaultInitOptions: InitErrorReporterParams = {
            dsn: 'https://example.com/error',
            release: 'foo',
            environment: GorgiasUIEnv.Development,
        }

        it('should init sentry', () => {
            initErrorReporter(defaultInitOptions)

            expect(initMock).toHaveBeenCalledWith({
                dsn: defaultInitOptions.dsn,
                release: defaultInitOptions.release,
                environment: defaultInitOptions.environment,
                tracesSampleRate: TRACE_SAMPLE_RATE,
                ignoreErrors: IGNORED_ERRORS,
                denyUrls: DENY_URLS,
                enabled: true,
                integrations: [expect.any(BrowserTracing)],
            })
        })

        it('should set tag "language" equal "javascript"', () => {
            initErrorReporter(defaultInitOptions)

            expect(setTagMock).toHaveBeenCalledWith('language', 'javascript')
        })

        it('should set account domain tag when currentAccount option is defined', () => {
            initErrorReporter({
                ...defaultInitOptions,
                currentAccount: account,
            })

            expect(setTagMock).toHaveBeenCalledWith(
                'account.domain',
                account.domain
            )
        })

        it('should set user when currentUser option is defined', () => {
            initErrorReporter({
                ...defaultInitOptions,
                currentUser: user,
            })

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

    describe('withInpMeasurement', () => {
        class TestBrowserTracing implements PatchedBrowserTracing {
            public name: string
            public options: BrowserTracingOptions
            public testTransactionSpy?: jest.SpiedFunction<
                Transaction['setMeasurement']
            >

            constructor() {
                this.name = 'TestBrowserTracing'
                this.options = {} as BrowserTracingOptions
            }

            setupOnce = jest.fn()

            simulateNavigation = () => {
                this._createRouteTransaction()
            }

            _createRouteTransaction = () => {
                const transaction = new Transaction({name: 'test transaction'})
                this.testTransactionSpy = jest.spyOn(
                    transaction,
                    'setMeasurement'
                )
                return transaction
            }
        }

        it('should add the last INP measurement to the route transaction', () => {
            const browserTracing = withInpMeasurements(new TestBrowserTracing())
            const reportInp = onInpMock.mock.calls[0][0]!

            reportInp({
                value: 123,
            } as Metric)
            reportInp({
                value: 456,
            } as Metric)
            browserTracing.simulateNavigation()

            expect(browserTracing.testTransactionSpy).toHaveBeenLastCalledWith(
                'inp',
                456,
                'ms'
            )
        })

        it('should not add the INP measurement to the route transaction if no INP measurement available', () => {
            const browserTracing = withInpMeasurements(new TestBrowserTracing())

            browserTracing.simulateNavigation()

            expect(browserTracing.testTransactionSpy).not.toHaveBeenCalled()
        })

        it('should add the INP measurement only once', () => {
            const browserTracing = withInpMeasurements(new TestBrowserTracing())
            const reportInp = onInpMock.mock.calls[0][0]!

            reportInp({
                value: 123,
            } as Metric)
            browserTracing.simulateNavigation()
            browserTracing.testTransactionSpy?.mockReset()
            browserTracing.simulateNavigation()

            expect(browserTracing.testTransactionSpy).not.toHaveBeenCalled()
        })
    })
})
