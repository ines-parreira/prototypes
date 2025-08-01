import { assumeMock, renderHook } from '@repo/testing'
import { useParams } from 'react-router-dom'

import useViewId from '../useViewId'

jest.mock('react-router-dom', () => ({ useParams: jest.fn() }))
const useParamsMock = assumeMock(useParams)

jest.mock('hooks/useAppSelector', () => jest.fn(() => 987789))

describe('useViewId', () => {
    beforeEach(() => {
        useParamsMock.mockReturnValue({})
    })

    it('should return the default view id if no view id is in the url', () => {
        const { result } = renderHook(() => useViewId())
        expect(result.current).toBe(987789)
    })

    it('should return the view id from the url if available', () => {
        useParamsMock.mockReturnValue({ viewId: '123456' })
        const { result } = renderHook(() => useViewId())
        expect(result.current).toBe(123456)
    })
})
