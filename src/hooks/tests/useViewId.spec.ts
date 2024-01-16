import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'
import {useParams} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'

import useViewId from '../useViewId'

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))
const useParamsMock = useParams as jest.Mock

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

describe('useViewId', () => {
    beforeEach(() => {
        useParamsMock.mockReturnValue({})
        useAppSelectorMock
            .mockReturnValueOnce(fromJS({}))
            .mockReturnValueOnce({id: 123})
    })

    it('should return the view id from the url if it exists', () => {
        useParamsMock.mockReturnValue({viewId: '789'})

        const {result} = renderHook(() => useViewId())
        expect(result.current).toBe(789)
    })

    it('should return the view id of the active view if it exists', () => {
        useAppSelectorMock.mockReset()
        useAppSelectorMock
            .mockReturnValueOnce(fromJS({id: 456}))
            .mockReturnValueOnce({id: 123})

        const {result} = renderHook(() => useViewId())
        expect(result.current).toBe(456)
    })

    it('should return the view id of the default view', () => {
        const {result} = renderHook(() => useViewId())
        expect(result.current).toBe(123)
    })
})
