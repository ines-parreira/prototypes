import {datadogLogs} from '@datadog/browser-logs'

import {initDatadogLogger} from '../datadog'
import {user} from '../../fixtures/users'
import {account} from '../../fixtures/account'

describe('initDatadogLogger()', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

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
