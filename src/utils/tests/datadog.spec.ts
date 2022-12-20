import {datadogLogs} from '@datadog/browser-logs'
import {datadogRum} from '@datadog/browser-rum'

import {initDatadogLogger, initDatadogRum} from 'utils/datadog'
import {user} from 'fixtures/users'
import {account} from 'fixtures/account'

jest.mock('@datadog/browser-rum')

describe('datadog', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('initDatadogLogger', () => {
        it('should init datadog logger', () => {
            jest.spyOn(datadogLogs, 'init')
            jest.spyOn(datadogLogs, 'setLoggerGlobalContext')

            initDatadogLogger(account, user, 'v1.4.5')
            expect((datadogLogs.init as jest.Mock).mock.calls).toMatchSnapshot()
            expect(
                (datadogLogs.setLoggerGlobalContext as jest.Mock).mock.calls
            ).toMatchSnapshot()
        })
    })

    describe('initDatadogRum', () => {
        it('should init datadog rum', () => {
            initDatadogRum(account, user, 'v1.4.5')
            expect((datadogRum.init as jest.Mock).mock.calls).toMatchSnapshot()
        })

        it('should set user context', () => {
            initDatadogRum(account, user, 'v1.4.5')
            expect(datadogRum.setUser).toHaveBeenLastCalledWith({
                id: user.id.toString(),
                email: user.email,
                domain: account.domain,
            })
        })
    })
})
