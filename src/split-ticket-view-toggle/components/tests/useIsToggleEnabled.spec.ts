import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import * as utils from 'utils'

import useIsToggleEnabled from '../useIsToggleEnabled'

jest.mock('react-router-dom', () => ({
    useLocation: jest.fn().mockReturnValue({pathname: '/'}),
}))

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

describe('useIsToggleEnabled', () => {
    const isDirectTicketPathSpy = jest.spyOn(utils, 'isDirectTicketPath')

    beforeEach(() => {
        isDirectTicketPathSpy.mockReturnValue(false)
        useAppSelectorMock.mockReturnValue(fromJS({}))
    })

    it('should return isEnabled as true if the path is not a direct ticket path', () => {
        const {result} = renderHook(() => useIsToggleEnabled())

        expect(result.current.isEnabled).toBe(true)
    })

    it('should return isEnabled as false if the path is a direct ticket path and active view is not defined', () => {
        isDirectTicketPathSpy.mockReturnValue(true)
        const {result} = renderHook(() => useIsToggleEnabled())

        expect(result.current.isEnabled).toBe(false)
    })

    it('should return isEnabled as true if the path is a direct ticket path and active view is defined', () => {
        isDirectTicketPathSpy.mockReturnValue(true)
        useAppSelectorMock.mockReturnValue(fromJS({id: 1}))
        const {result} = renderHook(() => useIsToggleEnabled())

        expect(result.current.isEnabled).toBe(true)
    })
})
