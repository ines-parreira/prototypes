import { useFlag } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'
import type { History, Location } from 'history'
import { fromJS } from 'immutable'
import { useHistory, useLocation } from 'react-router-dom'

import { ViewType } from 'models/view/types'
import { getActiveView } from 'state/views/selectors'

import useRedirectDeprecatedTicketRoutes from '../useRedirectDeprecatedTicketRoutes'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const useFlagMock = assumeMock(useFlag)
jest.mock('hooks/useAppSelector', () => (fn: () => unknown) => fn())
jest.mock('state/views/selectors', () => ({ getActiveView: jest.fn() }))
const getActiveViewMock = assumeMock(getActiveView)

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
    useLocation: jest.fn(),
}))
const useHistoryMock = assumeMock(useHistory)
const useLocationMock = assumeMock(useLocation)

describe('useRedirectDeprecatedTicketRoutes', () => {
    let replace: jest.Mock

    beforeEach(() => {
        getActiveViewMock.mockReturnValue(fromJS({}))
        useFlagMock.mockReturnValue(true)
        replace = jest.fn()
        useHistoryMock.mockReturnValue({ replace } as unknown as History)
        useLocationMock.mockReturnValue({ pathname: '/app' } as Location)
    })

    it('should do nothing if the feature flag is not enabled', () => {
        useFlagMock.mockReturnValue(false)
        renderHook(() => useRedirectDeprecatedTicketRoutes())
        expect(replace).not.toHaveBeenCalled()
    })

    it('should do nothing when on the edit-widgets url', () => {
        useLocationMock.mockReturnValue({
            pathname: '/app/ticket/123/edit-widgets',
        } as Location)
        renderHook(() => useRedirectDeprecatedTicketRoutes())
        expect(replace).not.toHaveBeenCalled()
    })

    it('should do nothing when on the print url', () => {
        useLocationMock.mockReturnValue({
            pathname: '/app/ticket/123/print',
        } as Location)
        renderHook(() => useRedirectDeprecatedTicketRoutes())
        expect(replace).not.toHaveBeenCalled()
    })

    it('should redirect /app', () => {
        useLocationMock.mockReturnValue({ pathname: '/app' } as Location)
        renderHook(() => useRedirectDeprecatedTicketRoutes())
        expect(replace).toHaveBeenCalledWith('/app/tickets')
    })

    it('should redirect /app/ticket with an active ticket view', () => {
        getActiveViewMock.mockReturnValue(
            fromJS({ id: 1, type: ViewType.TicketList }),
        )
        useLocationMock.mockReturnValue({
            pathname: '/app/ticket/123',
        } as Location)
        renderHook(() => useRedirectDeprecatedTicketRoutes())
        expect(replace).toHaveBeenCalledWith('/app/tickets/1/123')
    })

    it('should redirect /app/ticket with an active non-ticket view', () => {
        getActiveViewMock.mockReturnValue(
            fromJS({ id: 1, type: ViewType.CustomerList }),
        )
        useLocationMock.mockReturnValue({
            pathname: '/app/ticket/123',
        } as Location)
        renderHook(() => useRedirectDeprecatedTicketRoutes())
        expect(replace).toHaveBeenCalledWith('/app/tickets/0/123')
    })

    it('should redirect /app/ticket without an active view', () => {
        useLocationMock.mockReturnValue({
            pathname: '/app/ticket/123',
        } as Location)
        renderHook(() => useRedirectDeprecatedTicketRoutes())
        expect(replace).toHaveBeenCalledWith('/app/tickets/0/123')
    })

    it('should redirect /app/tickets if it has a view slug', () => {
        useLocationMock.mockReturnValue({
            pathname: '/app/tickets/123/inbox',
        } as Location)
        renderHook(() => useRedirectDeprecatedTicketRoutes())
        expect(replace).toHaveBeenCalledWith('/app/tickets/123')
    })

    it('should not redirect /app/tickets if there is no view slug', () => {
        useLocationMock.mockReturnValue({
            pathname: '/app/tickets/123',
        } as Location)
        renderHook(() => useRedirectDeprecatedTicketRoutes())
        expect(replace).not.toHaveBeenCalled()
    })

    it('should redirect /app/views without a view id', () => {
        useLocationMock.mockReturnValue({
            pathname: '/app/views',
        } as Location)
        renderHook(() => useRedirectDeprecatedTicketRoutes())
        expect(replace).toHaveBeenCalledWith('/app/tickets')
    })

    it('should redirect /app/views without a ticket id', () => {
        useLocationMock.mockReturnValue({
            pathname: '/app/views/123',
        } as Location)
        renderHook(() => useRedirectDeprecatedTicketRoutes())
        expect(replace).toHaveBeenCalledWith('/app/tickets/123')
    })

    it('should redirect /app/views with a ticket id', () => {
        useLocationMock.mockReturnValue({
            pathname: '/app/views/123/456',
        } as Location)
        renderHook(() => useRedirectDeprecatedTicketRoutes())
        expect(replace).toHaveBeenCalledWith('/app/tickets/123/456')
    })
})
