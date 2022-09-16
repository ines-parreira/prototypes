import {captureException, init, setTag, setUser} from '@sentry/react'
import {ScopeContext} from '@sentry/types'
import {Metric, onINP} from 'web-vitals'
import {BrowserTracingOptions} from '@sentry/tracing/types/browser/browsertracing'
import {Transaction} from '@sentry/tracing'

import {
    initErrorReporter,
    InitErrorReporterParams,
    PatchedBrowserTracing,
    reportError,
    withInpMeasurements,
} from 'utils/errors'
import {
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
const initMock = init as jest.MockedFunction<typeof init>
const setUserMock = setUser as jest.MockedFunction<typeof setUser>
const setTagMock = setTag as jest.MockedFunction<typeof setTag>

const consoleErrorMock = jest.fn()
global.console.error = consoleErrorMock

const userAgentMock = jest.fn()
Object.defineProperty(global.navigator, 'userAgent', {
    get: userAgentMock,
})

const onInpMock = onINP as jest.MockedFunction<typeof onINP>

describe('errors util', () => {
    beforeEach(() => {
        jest.clearAllMocks()
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

            expect(initMock.mock.calls).toMatchSnapshot()
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
            expect(setUserMock.mock.calls).toMatchSnapshot()
        })

        it.each<[string, string]>([
            [
                'IE8',
                'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)',
            ],
            [
                'mobile safari',
                'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1',
            ],
        ])('should disable reporting for %s', (testName, userAgent) => {
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
        const defaultOptions: Partial<ScopeContext> = {
            extra: {
                foo: 'bar',
            },
        }

        it('should only display error on the console in development environment', () => {
            mockDevelopmentEnvironment()
            reportError(Error('Test error'), defaultOptions)

            expect(captureExceptionMock).not.toBeCalled()
            expect(consoleErrorMock.mock.calls).toMatchSnapshot()
        })

        it('should only report error to Sentry in production environment', () => {
            mockProductionEnvironment()
            reportError(new Error('Test error'), defaultOptions)

            expect(consoleErrorMock).not.toHaveBeenCalled()
            expect(captureExceptionMock.mock.calls).toMatchSnapshot()
        })

        it('should report error to Sentry and display error on the console in staging environment', () => {
            mockStagingEnvironment()
            reportError(new Error('Test error'), defaultOptions)

            expect(captureExceptionMock.mock.calls).toMatchSnapshot()
            expect(consoleErrorMock.mock.calls).toMatchSnapshot()
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
