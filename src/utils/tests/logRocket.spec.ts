import LogRocket from 'logrocket'
import {Metric} from 'web-vitals'
import {createMemoryHistory} from 'history'

import {account} from 'fixtures/account'
import {user} from 'fixtures/users'
import {
    initLogRocket,
    InitLogRocketParams,
    LogRocketCustomMetric,
} from 'utils/logRocket'
import {measureInp} from 'utils/performance'

jest.mock('logrocket')
jest.mock('utils/performance')

const measureInpMock = measureInp as jest.MockedFunction<typeof measureInp>

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

        it('track inp measurements as custom event', () => {
            initLogRocket(defaultParams)

            const handler = measureInpMock.mock.calls[0][1]!
            const inp = {value: 123} as Metric
            const location = createMemoryHistory().location
            handler(inp, location)

            expect(LogRocket.track).toHaveBeenLastCalledWith(
                LogRocketCustomMetric.Inp,
                {page: location.pathname, value: inp.value}
            )
        })
    })
})
