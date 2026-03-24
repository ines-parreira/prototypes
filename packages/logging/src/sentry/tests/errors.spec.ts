import { GorgiasUIEnv } from '@repo/utils'
import {
    captureException,
    init,
    setTag,
    setUser,
    withScope,
} from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import type { ScopeContext } from '@sentry/types'

import type { InitErrorReporterParams } from '../errors'
import {
    ACCOUNT_DOMAIN_TAG,
    DENY_URLS,
    ERROR_EXTRA_CONSOLE_LOG_MESSAGE,
    getAdditionalErrorInfo,
    getCallerInfo,
    IGNORED_ERRORS,
    initErrorReporter,
    LANGUAGE_TAG,
    LANGUAGE_TAG_VALUE,
    reportError,
    SERVER_VERSION_TAG,
    TRACE_SAMPLE_RATE,
} from '../errors'

vi.mock('@sentry/react', () => ({
    captureException: vi.fn(),
    init: vi.fn(),
    setTag: vi.fn(),
    setUser: vi.fn(),
    withScope: vi.fn(),
}))

vi.mock('@sentry/tracing', () => ({
    BrowserTracing: vi.fn(),
}))

const captureExceptionMock = vi.mocked(captureException)
const initMock = vi.mocked(init)
const setUserMock = vi.mocked(setUser)
const setTagMock = vi.mocked(setTag)
const withScopeMock = vi.mocked(withScope)
const BrowserTracingMock = vi.mocked(BrowserTracing)

const account = {
    domain: 'acme.gorgias.help',
}

const user = {
    id: 1,
    email: 'agent@gorgias.com',
    name: 'Ada Lovelace',
}

const mockProductionEnvironment = () => {
    window.DEVELOPMENT = false
    window.STAGING = false
    window.PRODUCTION = true
}

const mockStagingEnvironment = () => {
    window.DEVELOPMENT = false
    window.STAGING = true
    window.PRODUCTION = false
}

const mockDevelopmentEnvironment = () => {
    window.DEVELOPMENT = true
    window.STAGING = false
    window.PRODUCTION = false
}

describe('errors', () => {
    const userAgentGetter = vi.fn()
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        vi.clearAllMocks()
        userAgentGetter.mockReturnValue(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36',
        )
        Object.defineProperty(global.navigator, 'userAgent', {
            configurable: true,
            get: userAgentGetter,
        })
        withScopeMock.mockImplementation((callback: any) => {
            callback({
                setFingerprint: vi.fn(),
            })
        })
        consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => undefined)
    })

    afterEach(() => {
        consoleErrorSpy.mockRestore()
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

            expect(BrowserTracingMock).toHaveBeenCalledTimes(1)
            expect(initMock).toHaveBeenCalledWith({
                dsn: defaultInitOptions.dsn,
                release: defaultInitOptions.clientVersion,
                environment: defaultInitOptions.environment,
                tracesSampleRate: TRACE_SAMPLE_RATE,
                ignoreErrors: IGNORED_ERRORS,
                denyUrls: DENY_URLS,
                enabled: true,
                integrations: [expect.anything()],
            })
        })

        it(`should set tag "${LANGUAGE_TAG}" equal "${LANGUAGE_TAG_VALUE}"`, () => {
            initErrorReporter(defaultInitOptions)

            expect(setTagMock).toHaveBeenCalledWith(
                LANGUAGE_TAG,
                LANGUAGE_TAG_VALUE,
            )
        })

        it(`should set tag "${SERVER_VERSION_TAG}"`, () => {
            initErrorReporter(defaultInitOptions)

            expect(setTagMock).toHaveBeenCalledWith(
                SERVER_VERSION_TAG,
                defaultInitOptions.serverVersion,
            )
        })

        it(`should set tag "${ACCOUNT_DOMAIN_TAG}"`, () => {
            initErrorReporter(defaultInitOptions)

            expect(setTagMock).toHaveBeenCalledWith(
                ACCOUNT_DOMAIN_TAG,
                account.domain,
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
        ])('should disable reporting for $browser', ({ userAgent }) => {
            userAgentGetter.mockReturnValue(userAgent)

            initErrorReporter(defaultInitOptions)

            expect(initMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })
    })

    describe('reportError', () => {
        const testError = Error('Test error')
        const callerInfo = getCallerInfo(testError)
        const defaultOptions: Partial<ScopeContext> = {
            extra: {
                caller_function: callerInfo.functionName,
                caller_file: callerInfo.fileName,
                caller_line: callerInfo.lineNumber,
                caller_column: callerInfo.columnNumber,
                cookies_enabled: true,
                document_ready_state: 'complete',
                environment: 'staging',
                focused_element: 'BODY',
                focused_element_id: '',
                page_hidden: false,
                page_visible: true,
                pathname: '/',
                referrer: '',
                search: {},
                title: '',
                url: window.location.href,
            },
        }

        it('should only display error on the console in development environment', () => {
            mockDevelopmentEnvironment()

            reportError(testError, defaultOptions)

            expect(captureExceptionMock).not.toHaveBeenCalled()
            expect(consoleErrorSpy).toHaveBeenCalledWith(testError)
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                ERROR_EXTRA_CONSOLE_LOG_MESSAGE,
                defaultOptions.extra,
            )
        })

        it('should only report error to Sentry in production environment', () => {
            mockProductionEnvironment()

            reportError(testError, defaultOptions)

            expect(consoleErrorSpy).not.toHaveBeenCalled()
            expect(captureExceptionMock).toHaveBeenCalledWith(testError, {
                extra: { ...defaultOptions.extra, environment: 'production' },
            })
        })

        it('should report error to Sentry and display error on the console in staging environment', () => {
            mockStagingEnvironment()

            reportError(testError, defaultOptions)

            expect(captureExceptionMock).toHaveBeenCalledWith(
                testError,
                defaultOptions,
            )
            expect(consoleErrorSpy).toHaveBeenCalledWith(testError)
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                ERROR_EXTRA_CONSOLE_LOG_MESSAGE,
                defaultOptions.extra,
            )
        })

        it('should convert non-Error objects to Error instances', () => {
            mockProductionEnvironment()

            const stringError = 'String error message'
            reportError(stringError)

            expect(captureExceptionMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: stringError,
                }),
                expect.any(Object),
            )
        })

        it('should handle reportError without options.extra in development', () => {
            mockDevelopmentEnvironment()

            reportError(testError)

            expect(consoleErrorSpy).toHaveBeenCalledWith(testError)
            expect(consoleErrorSpy).not.toHaveBeenCalledWith(
                ERROR_EXTRA_CONSOLE_LOG_MESSAGE,
                expect.anything(),
            )
        })

        it('should set fingerprints when provided in production', () => {
            mockProductionEnvironment()
            const mockSetFingerprint = vi.fn()
            withScopeMock.mockImplementation((callback: any) => {
                callback({
                    setFingerprint: mockSetFingerprint,
                })
            })

            const fingerprints = ['custom', 'fingerprint']
            reportError(testError, defaultOptions, fingerprints)

            expect(mockSetFingerprint).toHaveBeenCalledWith(fingerprints)
        })

        it('should not call setFingerprint when fingerprints not provided', () => {
            mockProductionEnvironment()
            const mockSetFingerprint = vi.fn()
            withScopeMock.mockImplementation((callback: any) => {
                callback({
                    setFingerprint: mockSetFingerprint,
                })
            })

            reportError(testError, defaultOptions)

            expect(mockSetFingerprint).not.toHaveBeenCalled()
        })
    })

    describe('getAdditionalErrorInfo', () => {
        it('should return error info with minimal data when called without error', () => {
            const result = getAdditionalErrorInfo()

            expect(result).toHaveProperty('extra')
            expect(result.extra).toMatchObject({
                environment: expect.any(String),
                document_ready_state: expect.any(String),
                page_visible: expect.any(Boolean),
                page_hidden: expect.any(Boolean),
                cookies_enabled: expect.any(Boolean),
                url: expect.any(String),
                pathname: expect.any(String),
                title: expect.any(String),
            })
        })

        it('should return error info with caller details and environment data', () => {
            const testError = new Error('Test error')
            const result = getAdditionalErrorInfo(testError)

            expect(result).toHaveProperty('extra')
            expect(result.extra).toMatchObject({
                environment: expect.any(String),
                caller_function: expect.any(String),
                caller_file: expect.any(String),
                caller_line: expect.any(Number),
                caller_column: expect.any(Number),
                document_ready_state: expect.any(String),
                page_visible: expect.any(Boolean),
                page_hidden: expect.any(Boolean),
                cookies_enabled: expect.any(Boolean),
                url: expect.any(String),
                pathname: expect.any(String),
                title: expect.any(String),
            })
        })

        it('should capture focused element tagName and id when element has id', () => {
            const mockElement = document.createElement('input')
            mockElement.id = 'test-input'
            Object.defineProperty(document, 'activeElement', {
                value: mockElement,
                configurable: true,
            })

            const testError = new Error('Test error')
            const result = getAdditionalErrorInfo(testError)

            expect((result.extra as any).focused_element).toBe('INPUT')
            expect((result.extra as any).focused_element_id).toBe('test-input')
        })

        it('should capture focused element tagName when element has no id', () => {
            const mockElement = document.createElement('button')
            Object.defineProperty(document, 'activeElement', {
                value: mockElement,
                configurable: true,
            })

            const testError = new Error('Test error')
            const result = getAdditionalErrorInfo(testError)

            expect((result.extra as any).focused_element).toBe('BUTTON')
            expect((result.extra as any).focused_element_id).toBe('')
        })

        it('should handle undefined activeElement', () => {
            Object.defineProperty(document, 'activeElement', {
                value: undefined,
                configurable: true,
            })

            const testError = new Error('Test error')
            const result = getAdditionalErrorInfo(testError)

            expect((result.extra as any).focused_element).toBeUndefined()
            expect((result.extra as any).focused_element_id).toBeUndefined()
        })

        it('should return error info object when getCallerInfo throws', () => {
            const mockError = {
                stack: undefined,
            } as Error

            const result = getAdditionalErrorInfo(mockError)

            expect(result).toHaveProperty('extra')
            expect((result.extra as any).info_error).toBe(
                'Failed to get additional error info',
            )
        })

        it('should merge options.extra when getCallerInfo throws', () => {
            const mockError = {
                stack: undefined,
            } as Error
            const options: Partial<ScopeContext> = {
                extra: {
                    customField: 'customValue',
                },
            }

            const result = getAdditionalErrorInfo(mockError, options)

            expect(result).toHaveProperty('extra')
            expect((result.extra as any).info_error).toBe(
                'Failed to get additional error info',
            )
            expect((result.extra as any).customField).toBe('customValue')
        })
    })

    describe('getCallerInfo', () => {
        it('should call getCallerInfo without error', () => {
            const result = getCallerInfo()

            expect(result).toHaveProperty('functionName')
            expect(result).toHaveProperty('fileName')
            expect(result).toHaveProperty('lineNumber')
            expect(result).toHaveProperty('columnNumber')
        })

        it('should parse Firefox stack trace format', () => {
            const mockError = {
                stack: `Error: Test error
someFunction@http://example.com/file.js:42:10
anotherFunction@http://example.com/other.js:100:5
testFunction@http://example.com/test.js:25:15`,
            } as Error

            const result = getCallerInfo(mockError)

            expect(result).toEqual({
                functionName: 'testFunction',
                fileName: 'http://example.com/test.js',
                lineNumber: 25,
                columnNumber: 15,
            })
        })
    })
})
