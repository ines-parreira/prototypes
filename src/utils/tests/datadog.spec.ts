import {datadogLogs} from '@datadog/browser-logs'
import {datadogRum} from '@datadog/browser-rum'
import {Metric, onINP} from 'web-vitals'

import {initDatadogLogger, initDatadogRum} from 'utils/datadog'
import {user} from 'fixtures/users'
import {account} from 'fixtures/account'
import {assumeMock} from 'utils/testing'

jest.mock('@datadog/browser-rum')
jest.mock('web-vitals')

describe('datadog', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('initDatadogLogger', () => {
        it('should init datadog logger', () => {
            jest.spyOn(datadogLogs, 'init')
            jest.spyOn(datadogLogs, 'setLoggerGlobalContext')

            initDatadogLogger(account, user, 'v1.4.5')
            expect(assumeMock(datadogLogs.init).mock.calls).toMatchSnapshot()
            expect(
                assumeMock(datadogLogs.setLoggerGlobalContext).mock.calls
            ).toMatchSnapshot()
        })
    })

    describe('initDatadogRum', () => {
        it('should init datadog rum', () => {
            initDatadogRum(account, user, 'v1.4.5')
            expect(assumeMock(datadogRum.init).mock.calls).toMatchSnapshot()
        })

        it('should set user context', () => {
            initDatadogRum(account, user, 'v1.4.5')
            expect(datadogRum.setUser).toHaveBeenLastCalledWith({
                id: user.id.toString(),
                email: user.email,
                domain: account.domain,
            })
        })

        it('should report INP', () => {
            initDatadogRum(account, user, 'v1.4.5')

            const reportInp = assumeMock(onINP).mock.calls[0][0]!
            reportInp({
                value: 123,
            } as Metric)

            expect(
                assumeMock(datadogRum.addAction).mock.calls
            ).toMatchSnapshot()
        })
    })
})
