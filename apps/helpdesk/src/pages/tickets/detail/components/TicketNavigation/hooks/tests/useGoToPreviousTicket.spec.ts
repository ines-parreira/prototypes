import { history } from '@repo/routing'
import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { useSplitTicketView } from 'split-ticket-view-toggle'

import useGoToPreviousTicket from '../useGoToPreviousTicket'
import useIsTicketNavigationAvailable from '../useIsTicketNavigationAvailable'
import usePrevNextTicketNavigation from '../usePrevNextTicketNavigation'

jest.mock('split-ticket-view-toggle/hooks/useSplitTicketView')
const mockUseSplitTicketViewMock = useSplitTicketView as jest.Mock

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

const useParamsMock = useParams as jest.Mock

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('../useIsTicketNavigationAvailable')
const mockUseIsTicketNavigationAvailable =
    useIsTicketNavigationAvailable as jest.Mock

jest.mock('../usePrevNextTicketNavigation')
const mockUsePrevNextTicketNavigation = usePrevNextTicketNavigation as jest.Mock

const mockUsePrevNextTicketNavigationFn = jest.fn()

jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
    },
}))

describe('useGoToPreviousTicket', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValue(fromJS({}))
        mockUseIsTicketNavigationAvailable.mockReturnValue(true)
        mockUseSplitTicketViewMock.mockReturnValue({ isEnabled: false })
        useParamsMock.mockReturnValue({})
        mockUsePrevNextTicketNavigation.mockReturnValue(jest.fn())
    })

    it('should return the old ticket navigation method and return isEnabled as true', async () => {
        mockUsePrevNextTicketNavigation.mockReturnValue(
            mockUsePrevNextTicketNavigationFn,
        )

        const { result } = renderHook(() => useGoToPreviousTicket('123'))
        expect(result.current.goToTicket).toBeDefined()
        expect(result.current.isEnabled).toBe(true)

        await result.current.goToTicket()
        expect(mockUsePrevNextTicketNavigationFn).toHaveBeenCalled()
    })

    it('should return the old ticket navigation method and return isEnabled as false if ticket navigation is not available', () => {
        mockUsePrevNextTicketNavigation.mockReturnValue(
            mockUsePrevNextTicketNavigationFn,
        )
        mockUseIsTicketNavigationAvailable.mockReturnValue(false)

        const { result } = renderHook(() => useGoToPreviousTicket('123'))
        expect(result.current.goToTicket).toBeDefined()
        expect(result.current.isEnabled).toBe(false)
    })

    it('should return the old ticket navigation method and return isEnabled as true if DTP is enabled, but search view is active', async () => {
        mockUseSplitTicketViewMock.mockReturnValue({
            isEnabled: true,
            previousTicketId: 456,
        })
        mockUsePrevNextTicketNavigation.mockReturnValue(
            mockUsePrevNextTicketNavigationFn,
        )
        useAppSelectorMock.mockReturnValue(fromJS({ search: '' }))

        const { result } = renderHook(() => useGoToPreviousTicket('123'))
        expect(result.current.goToTicket).toBeDefined()
        expect(result.current.isEnabled).toBe(true)

        await result.current.goToTicket()
        expect(mockUsePrevNextTicketNavigationFn).toHaveBeenCalled()
    })

    it('should return the DTP ticket navigation method and return isEnabled as true', async () => {
        mockUseSplitTicketViewMock.mockReturnValue({
            isEnabled: true,
            previousTicketId: 111,
        })
        useParamsMock.mockReturnValue({ viewId: '123' })

        const { result } = renderHook(() => useGoToPreviousTicket('123'))
        expect(result.current.goToTicket).toBeDefined()
        expect(result.current.isEnabled).toBe(true)

        await result.current.goToTicket()
        expect(mockUsePrevNextTicketNavigationFn).not.toHaveBeenCalled()
        expect(history.push).toHaveBeenCalledWith('/app/views/123/111')
    })
})
