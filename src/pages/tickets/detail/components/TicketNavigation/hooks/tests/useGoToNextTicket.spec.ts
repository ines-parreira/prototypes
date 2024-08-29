import {renderHook} from '@testing-library/react-hooks'
import {useParams} from 'react-router-dom'
import {fromJS} from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {useSplitTicketView} from 'split-ticket-view-toggle'
import history from 'pages/history'

import useGoToNextTicket from '../useGoToNextTicket'
import usePrevNextTicketNavigation from '../usePrevNextTicketNavigation'

jest.mock('split-ticket-view-toggle/hooks/useSplitTicketView')
const mockUseSplitTicketViewMock = useSplitTicketView as jest.Mock

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))

const useParamsMock = useParams as jest.Mock

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = useAppDispatch as jest.Mock

jest.mock('../usePrevNextTicketNavigation')
const mockUsePrevNextTicketNavigation = usePrevNextTicketNavigation as jest.Mock

const mockUsePrevNextTicketNavigationFn = jest.fn()

jest.mock('pages/history')

describe('useGoToNextTicket', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValue(fromJS({}))
        useAppDispatchMock.mockReturnValue(jest.fn().mockReturnValue(true))
        mockUseSplitTicketViewMock.mockReturnValue({isEnabled: false})
        useParamsMock.mockReturnValue({})
        mockUsePrevNextTicketNavigation.mockReturnValue(jest.fn())
    })

    it('should return the old ticket navigation method and return isEnabled as true', async () => {
        mockUsePrevNextTicketNavigation.mockReturnValue(
            mockUsePrevNextTicketNavigationFn
        )

        const {result} = renderHook(() => useGoToNextTicket('123'))
        expect(result.current.goToTicket).toBeDefined()
        expect(result.current.isEnabled).toBe(true)

        await result.current.goToTicket()
        expect(mockUsePrevNextTicketNavigationFn).toHaveBeenCalled()
    })

    it('should return the old ticket navigation method and return isEnabled as false if ticket navigation is not available', () => {
        mockUsePrevNextTicketNavigation.mockReturnValue(
            mockUsePrevNextTicketNavigationFn
        )
        useAppDispatchMock.mockReturnValue(jest.fn().mockReturnValue(false))

        const {result} = renderHook(() => useGoToNextTicket('123'))
        expect(result.current.goToTicket).toBeDefined()
        expect(result.current.isEnabled).toBe(false)
    })

    it('should return the old ticket navigation method and return isEnabled as true if DTP is enabled, but search view is active', async () => {
        mockUseSplitTicketViewMock.mockReturnValue({
            isEnabled: true,
            nextTicketId: 456,
        })
        mockUsePrevNextTicketNavigation.mockReturnValue(
            mockUsePrevNextTicketNavigationFn
        )
        useAppSelectorMock.mockReturnValue(fromJS({search: ''}))

        const {result} = renderHook(() => useGoToNextTicket('123'))
        expect(result.current.goToTicket).toBeDefined()
        expect(result.current.isEnabled).toBe(true)

        await result.current.goToTicket()
        expect(mockUsePrevNextTicketNavigationFn).toHaveBeenCalled()
    })

    it('should return the DTP ticket navigation method and return isEnabled as true', async () => {
        mockUseSplitTicketViewMock.mockReturnValue({
            isEnabled: true,
            nextTicketId: 456,
        })
        useParamsMock.mockReturnValue({viewId: '123'})

        const {result} = renderHook(() => useGoToNextTicket('123'))
        expect(result.current.goToTicket).toBeDefined()
        expect(result.current.isEnabled).toBe(true)

        await result.current.goToTicket()
        expect(mockUsePrevNextTicketNavigationFn).not.toHaveBeenCalled()
        expect(history.push).toHaveBeenCalledWith('/app/views/123/456')
    })
})
