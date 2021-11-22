import type {RavenStatic} from 'raven-js'

import {reportError} from '../errors'
import {
    mockDevelopmentEnvironment,
    mockProductionEnvironment,
    mockStagingEnvironment,
} from '../testing'

const captureExceptionMock = jest.fn()
window.Raven = {
    captureException: captureExceptionMock,
} as unknown as RavenStatic

const consoleErrorMock = jest.fn()
global.console.error = consoleErrorMock

describe('errors util', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('reportError', () => {
        it('should only display error on the console in development environment', () => {
            mockDevelopmentEnvironment()
            reportError(Error('Test error'), {
                extra: {
                    foo: 'bar',
                },
            })

            expect(captureExceptionMock).not.toBeCalled()
            expect(consoleErrorMock.mock.calls).toMatchSnapshot()
        })

        it('should only report error to Sentry in production environment', () => {
            mockProductionEnvironment()
            reportError(new Error('Test error'), {
                extra: {
                    foo: 'bar',
                },
            })

            expect(consoleErrorMock).not.toHaveBeenCalled()
            expect(captureExceptionMock.mock.calls).toMatchSnapshot()
        })

        it('should report error to Sentry and display error on the console in staging environment', () => {
            mockStagingEnvironment()
            reportError(new Error('Test error'), {
                extra: {
                    foo: 'bar',
                },
            })

            expect(captureExceptionMock.mock.calls).toMatchSnapshot()
            expect(consoleErrorMock.mock.calls).toMatchSnapshot()
        })
    })
})
