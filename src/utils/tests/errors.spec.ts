import {captureException, init, setTag, setUser} from '@sentry/react'
import {ScopeContext} from '@sentry/types'

import {
    initErrorReporter,
    InitErrorReporterParams,
    reportError,
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
})
