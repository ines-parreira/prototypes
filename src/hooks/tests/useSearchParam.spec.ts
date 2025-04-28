import { Location } from 'history'
import { useLocation } from 'react-router-dom'

import history from 'pages/history'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useSearchParam } from '../useSearchParam'

jest.mock('react-router-dom', () => ({
    useLocation: jest.fn(),
}))
const mockedUseLocation = assumeMock(useLocation)
jest.mock('pages/history')
const mockedReplace = assumeMock(history.replace)

describe('useSearchParams hook', () => {
    const param1 = 'cursor'
    const value1 = '20-1rpz-magle'
    const param2 = 'foo'
    const value2 = 'bar'
    beforeEach(() => {
        mockedUseLocation.mockReturnValue({
            search: `${param1}=${value1}&${param2}=${value2}`,
        } as Location<unknown>)
    })

    it('should return the search param value', () => {
        const hook = renderHook(() => useSearchParam(param1))
        expect(hook.result.current[0]).toBe(value1)
    })

    it('should clear related search param if passed null, and leave the others untouched', () => {
        const hook = renderHook(() => useSearchParam(param1))
        hook.result.current[1](null)
        expect(mockedReplace).toHaveBeenCalledWith({
            search: `${param2}=${value2}`,
        })
    })

    it('should set the search param to the passed value', () => {
        const hook = renderHook(() => useSearchParam(param1))
        hook.result.current[1]('bar')
        expect(mockedReplace).toHaveBeenCalledWith({
            search: `${param1}=bar&${param2}=${value2}`,
        })
    })
})
