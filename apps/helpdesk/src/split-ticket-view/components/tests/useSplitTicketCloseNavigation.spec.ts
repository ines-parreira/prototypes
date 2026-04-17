import { history } from '@repo/routing'
import { renderHook } from '@repo/testing'
import { useTicketViewNavigation } from '@repo/tickets'
import { act } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import { useViewId } from 'tickets/core/hooks'

import useSplitTicketCloseNavigation from '../useSplitTicketCloseNavigation'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

jest.mock('tickets/core/hooks', () => ({
    useViewId: jest.fn(),
}))

jest.mock('@repo/tickets', () => ({
    ...jest.requireActual('@repo/tickets'),
    useTicketViewNavigation: jest.fn(),
}))

jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
    },
}))

const useParamsMock = useParams as jest.Mock
const useTicketViewNavigationMock = useTicketViewNavigation as jest.Mock
const useViewIdMock = useViewId as jest.Mock
const historyMock = history as jest.Mocked<typeof history>

describe('useSplitTicketCloseNavigation', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useParamsMock.mockReturnValue({ viewId: 'test-view-id' })
        useViewIdMock.mockReturnValue(123)
        useTicketViewNavigationMock.mockReturnValue({
            ticketViewNavigation: { nextTicketId: undefined },
        })
    })

    it('returns undefined when split ticket view is false', () => {
        const { result } = renderHook(() =>
            useSplitTicketCloseNavigation({ isOnSplitTicketView: false }),
        )

        expect(result.current).toBeUndefined()
    })

    it('returns undefined when split ticket view is undefined', () => {
        const { result } = renderHook(() => useSplitTicketCloseNavigation({}))

        expect(result.current).toBeUndefined()
    })

    it('returns a callback when split ticket view is true', () => {
        const { result } = renderHook(() =>
            useSplitTicketCloseNavigation({ isOnSplitTicketView: true }),
        )

        expect(result.current).toEqual(expect.any(Function))
    })

    it('uses the shared viewId fallback when split view is enabled without a route viewId', () => {
        useParamsMock.mockReturnValue({ ticketId: '123' })
        useViewIdMock.mockReturnValue(987)

        const { result } = renderHook(() =>
            useSplitTicketCloseNavigation({ isOnSplitTicketView: true }),
        )

        act(() => result.current?.())

        expect(historyMock.push).toHaveBeenCalledWith('/app/views/987')
    })

    it('navigates to the next ticket when one is available', () => {
        useTicketViewNavigationMock.mockReturnValue({
            ticketViewNavigation: { nextTicketId: 'next-ticket-456' },
        })

        const { result } = renderHook(() =>
            useSplitTicketCloseNavigation({ isOnSplitTicketView: true }),
        )

        act(() => result.current?.())

        expect(historyMock.push).toHaveBeenCalledWith(
            '/app/views/123/next-ticket-456',
        )
    })

    it('navigates to the view URL when no next ticket is available', () => {
        const { result } = renderHook(() =>
            useSplitTicketCloseNavigation({ isOnSplitTicketView: true }),
        )

        act(() => result.current?.())

        expect(historyMock.push).toHaveBeenCalledWith('/app/views/123')
    })

    it('handles different resolved view ids', () => {
        useParamsMock.mockReturnValue({ viewId: 'different-view-id' })
        useViewIdMock.mockReturnValue(456)
        useTicketViewNavigationMock.mockReturnValue({
            ticketViewNavigation: { nextTicketId: 'ticket-789' },
        })

        const { result } = renderHook(() =>
            useSplitTicketCloseNavigation({ isOnSplitTicketView: true }),
        )

        act(() => result.current?.())

        expect(historyMock.push).toHaveBeenCalledWith(
            '/app/views/456/ticket-789',
        )
    })

    it('handles empty nextTicketId', () => {
        useTicketViewNavigationMock.mockReturnValue({
            ticketViewNavigation: { nextTicketId: '' },
        })

        const { result } = renderHook(() =>
            useSplitTicketCloseNavigation({ isOnSplitTicketView: true }),
        )

        act(() => result.current?.())

        expect(historyMock.push).toHaveBeenCalledWith('/app/views/123')
    })

    it('keeps using the last known nextTicketId when navigation rerenders before close', () => {
        const ticketViewNavigationState = {
            ticketViewNavigation: {
                nextTicketId: 456 as number | undefined,
            },
        }
        useTicketViewNavigationMock.mockImplementation(
            () => ticketViewNavigationState,
        )

        const { result, rerender } = renderHook(
            ({ isOnSplitTicketView }) =>
                useSplitTicketCloseNavigation({ isOnSplitTicketView }),
            {
                initialProps: { isOnSplitTicketView: true },
            },
        )

        ticketViewNavigationState.ticketViewNavigation.nextTicketId = undefined
        rerender({ isOnSplitTicketView: true })

        act(() => result.current?.())

        expect(historyMock.push).toHaveBeenCalledWith('/app/views/123/456')
    })

    it('resets the cached nextTicketId when the ticket or view changes', () => {
        const ticketViewNavigationState = {
            ticketViewNavigation: {
                nextTicketId: 456 as number | undefined,
            },
        }
        useTicketViewNavigationMock.mockImplementation(
            () => ticketViewNavigationState,
        )

        const { result, rerender } = renderHook(
            ({ isOnSplitTicketView }) =>
                useSplitTicketCloseNavigation({ isOnSplitTicketView }),
            {
                initialProps: { isOnSplitTicketView: true },
            },
        )

        useParamsMock.mockReturnValue({
            viewId: 'different-view-id',
            ticketId: '999',
        })
        useViewIdMock.mockReturnValue(789)
        ticketViewNavigationState.ticketViewNavigation.nextTicketId = undefined
        rerender({ isOnSplitTicketView: true })

        act(() => result.current?.())

        expect(historyMock.push).toHaveBeenCalledWith('/app/views/789')
    })

    it('resets the cached nextTicketId when only the ticket changes in the same view', () => {
        const ticketViewNavigationState = {
            ticketViewNavigation: {
                nextTicketId: 456 as number | undefined,
            },
        }
        useTicketViewNavigationMock.mockImplementation(
            () => ticketViewNavigationState,
        )
        useParamsMock.mockReturnValue({
            viewId: 'test-view-id',
            ticketId: '123',
        })

        const { result, rerender } = renderHook(
            ({ isOnSplitTicketView }) =>
                useSplitTicketCloseNavigation({ isOnSplitTicketView }),
            {
                initialProps: { isOnSplitTicketView: true },
            },
        )

        useParamsMock.mockReturnValue({
            viewId: 'test-view-id',
            ticketId: '999',
        })
        ticketViewNavigationState.ticketViewNavigation.nextTicketId = undefined
        rerender({ isOnSplitTicketView: true })

        act(() => result.current?.())

        expect(historyMock.push).toHaveBeenCalledWith('/app/views/123')
    })
})
