import LogRocket from 'logrocket'

import {account} from 'fixtures/account'
import {user} from 'fixtures/users'
import {initLogRocket, InitLogRocketParams} from 'utils/logRocket'

jest.mock('logrocket')

describe('logRocket', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('initLogRocket', () => {
        const defaultParams: InitLogRocketParams = {
            appId: 'foo',
            currentAccount: account,
            currentUser: user,
            release: 'v1',
        }

        it('should init logrocket client', () => {
            initLogRocket(defaultParams)

            expect((LogRocket.init as jest.Mock).mock.calls).toMatchSnapshot()
        })

        it('should identify the user', () => {
            initLogRocket(defaultParams)

            expect(
                (LogRocket.identify as jest.Mock).mock.calls
            ).toMatchSnapshot()
        })
    })
})
