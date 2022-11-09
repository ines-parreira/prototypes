import {createMemoryHistory} from 'history'
import {Metric, onINP} from 'web-vitals'

import {measureInp} from 'utils/performance'

jest.mock('web-vitals')
const onInpMock = onINP as jest.MockedFunction<typeof onINP>

describe('performance utils', () => {
    describe('measureInp', () => {
        let stopMeasuring: () => void | undefined

        afterEach(() => {
            stopMeasuring?.()
        })

        it('should report the latest INP metric on page transition', () => {
            const history = createMemoryHistory()
            const handler = jest.fn()
            const inp1 = {
                value: 123,
            } as Metric
            const inp2 = {
                value: 456,
            } as Metric

            stopMeasuring = measureInp(history, handler)
            history.push('/foo')
            const reportInp = onInpMock.mock.calls[0][0]!
            reportInp(inp1)
            reportInp(inp2)
            history.push('/bar')

            expect(handler).toHaveBeenCalledWith(
                inp2,
                expect.objectContaining({pathname: '/foo'})
            )
        })

        it('should not report the INP metric on page transition when no INP measured', () => {
            const history = createMemoryHistory()
            const handler = jest.fn()

            stopMeasuring = measureInp(history, handler)
            history.push('/foo')
            history.push('/bar')

            expect(handler).not.toHaveBeenCalled()
        })
    })
})
