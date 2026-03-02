import type { ReactNode } from 'react'

import { renderHook } from '@repo/testing'
import type { match as Match } from 'react-router-dom'
import { MemoryRouter, useRouteMatch } from 'react-router-dom'

import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { VoiceDeviceContextState } from 'pages/integrations/integration/components/voice/VoiceDeviceContext'
import useGoToNextTicket from 'pages/tickets/detail/components/TicketNavigation/hooks/useGoToNextTicket'
import useGoToPreviousTicket from 'pages/tickets/detail/components/TicketNavigation/hooks/useGoToPreviousTicket'
import useIsTicketNavigationAvailable from 'pages/tickets/detail/components/TicketNavigation/hooks/useIsTicketNavigationAvailable'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { NotificationStatus } from 'state/notifications/types'

import { useLegacyDispatchDismissNotification } from '../useLegacyDispatchDismissNotification'
import { useTicketLegacyBridgeFunctions } from '../useTicketLegacyBridgeFunctions'

type RouteMatchResult<T extends Record<string, string>> = Match<T> | null

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useRouteMatch: jest.fn(),
    useLocation: jest.fn(() => ({ pathname: '/' })),
}))
jest.mock('hooks/integrations/phone/useVoiceDevice')
jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')
jest.mock(
    'pages/tickets/detail/components/TicketNavigation/hooks/useGoToNextTicket',
)
jest.mock(
    'pages/tickets/detail/components/TicketNavigation/hooks/useGoToPreviousTicket',
)
jest.mock(
    'pages/tickets/detail/components/TicketNavigation/hooks/useIsTicketNavigationAvailable',
)
jest.mock('split-ticket-view-toggle')

const useVoiceDeviceMock = jest.mocked(useVoiceDevice)
const useRouteMatchMock = jest.mocked(useRouteMatch)
const useAppDispatchMock = jest.mocked(useAppDispatch)
const useAppSelectorMock = jest.mocked(useAppSelector)
const useGoToNextTicketMock = jest.mocked(useGoToNextTicket)
const useGoToPreviousTicketMock = jest.mocked(useGoToPreviousTicket)
const useIsTicketNavigationAvailableMock = jest.mocked(
    useIsTicketNavigationAvailable,
)
const useSplitTicketViewMock = jest.mocked(useSplitTicketView)

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
)

describe('useTicketLegacyBridgeFunctions', () => {
    const mockDispatch = jest.fn()
    const mockGoToNextTicket = jest.fn()
    const mockGoToPreviousTicket = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        useVoiceDeviceMock.mockReturnValue({
            call: null,
            device: null,
            actions: {},
        } as unknown as VoiceDeviceContextState)
        useAppDispatchMock.mockReturnValue(mockDispatch)
        useAppSelectorMock.mockReturnValue({
            get: jest.fn().mockReturnValue(null),
        })
        useRouteMatchMock.mockReturnValue(null)
        useGoToNextTicketMock.mockReturnValue({
            goToTicket: mockGoToNextTicket,
            isEnabled: false,
        })
        useGoToPreviousTicketMock.mockReturnValue({
            goToTicket: mockGoToPreviousTicket,
            isEnabled: false,
        })
        useIsTicketNavigationAvailableMock.mockReturnValue(false)
        useSplitTicketViewMock.mockReturnValue({
            isEnabled: false,
            nextTicketId: undefined,
            previousTicketId: undefined,
            setIsEnabled: jest.fn(),
            setPrevNextTicketIds: jest.fn(),
            shouldRedirectToSplitView: false,
            setShouldRedirectToSplitView: jest.fn(),
        })
    })

    describe('dispatchNotification', () => {
        it('should dispatch notification action', () => {
            const { result } = renderHook(
                () => useTicketLegacyBridgeFunctions(),
                { wrapper },
            )

            result.current.dispatchNotification({
                status: NotificationStatus.Success,
                message: 'Test notification',
            })

            expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function))
        })
    })

    describe('dispatchAuditLogEvents', () => {
        it('should dispatch audit log events action with ticket id and satisfaction survey id', () => {
            const mockTicket = {
                get: jest.fn((key: string) => {
                    if (key === 'id') return 123
                    if (key === 'satisfaction_survey') {
                        return {
                            get: jest.fn(() => 456),
                        }
                    }
                    return null
                }),
            }
            useAppSelectorMock.mockReturnValue(mockTicket)

            const { result } = renderHook(
                () => useTicketLegacyBridgeFunctions(),
                { wrapper },
            )

            result.current.dispatchAuditLogEvents()

            expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function))
        })

        it('should dispatch audit log events action without satisfaction survey', () => {
            const mockTicket = {
                get: jest.fn((key: string) => {
                    if (key === 'id') return 123
                    if (key === 'satisfaction_survey') return null
                    return null
                }),
            }
            useAppSelectorMock.mockReturnValue(mockTicket)

            const { result } = renderHook(
                () => useTicketLegacyBridgeFunctions(),
                { wrapper },
            )

            result.current.dispatchAuditLogEvents()

            expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function))
        })
    })

    describe('dispatchHideAuditLogEvents', () => {
        it('should dispatch hide audit log events action', () => {
            const { result } = renderHook(
                () => useTicketLegacyBridgeFunctions(),
                { wrapper },
            )

            result.current.dispatchHideAuditLogEvents()

            expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function))
        })
    })

    describe('toggleQuickReplies', () => {
        it('should toggle quick replies to visible', () => {
            const { result } = renderHook(
                () => useTicketLegacyBridgeFunctions(),
                { wrapper },
            )

            result.current.toggleQuickReplies(true)

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_SHOULD_DISPLAY_ALL_FOLLOW_UPS',
                payload: true,
            })
        })

        it('should toggle quick replies to hidden', () => {
            const { result } = renderHook(
                () => useTicketLegacyBridgeFunctions(),
                { wrapper },
            )

            result.current.toggleQuickReplies(false)

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_SHOULD_DISPLAY_ALL_FOLLOW_UPS',
                payload: false,
            })
        })
    })

    describe('ticketViewNavigation - split ticket view disabled', () => {
        beforeEach(() => {
            useSplitTicketViewMock.mockReturnValue({
                isEnabled: false,
                setIsEnabled: jest.fn(),
                setPrevNextTicketIds: jest.fn(),
                shouldRedirectToSplitView: false,
                setShouldRedirectToSplitView: jest.fn(),
                nextTicketId: undefined,
                previousTicketId: undefined,
            })
            useRouteMatchMock.mockImplementation((path) => {
                if (path === '/app/ticket/:ticketId') {
                    return { params: { ticketId: '123' } } as RouteMatchResult<{
                        ticketId: string
                    }>
                }
                return null
            })
        })

        it('should use legacy navigation when split ticket view is disabled', () => {
            useIsTicketNavigationAvailableMock.mockReturnValue(true)
            useGoToNextTicketMock.mockReturnValue({
                goToTicket: mockGoToNextTicket,
                isEnabled: true,
            })
            useGoToPreviousTicketMock.mockReturnValue({
                goToTicket: mockGoToPreviousTicket,
                isEnabled: true,
            })

            const { result } = renderHook(
                () => useTicketLegacyBridgeFunctions(),
                { wrapper },
            )

            expect(
                result.current.ticketViewNavigation.shouldUseLegacyFunctions,
            ).toBe(true)
            expect(result.current.ticketViewNavigation.shouldDisplay).toBe(true)
            expect(result.current.ticketViewNavigation.isNextEnabled).toBe(true)
            expect(result.current.ticketViewNavigation.isPreviousEnabled).toBe(
                true,
            )
        })

        it('should not display navigation when not available', () => {
            useIsTicketNavigationAvailableMock.mockReturnValue(false)

            const { result } = renderHook(
                () => useTicketLegacyBridgeFunctions(),
                { wrapper },
            )

            expect(result.current.ticketViewNavigation.shouldDisplay).toBe(
                false,
            )
        })
    })

    describe('ticketViewNavigation - split ticket view enabled (non-search view)', () => {
        beforeEach(() => {
            useSplitTicketViewMock.mockReturnValue({
                isEnabled: true,
                nextTicketId: 456,
                previousTicketId: 789,
                setIsEnabled: jest.fn(),
                setPrevNextTicketIds: jest.fn(),
                shouldRedirectToSplitView: false,
                setShouldRedirectToSplitView: jest.fn(),
            })
            useAppSelectorMock.mockReturnValue({
                get: jest.fn().mockReturnValue(null),
            })
            useRouteMatchMock.mockImplementation((path) => {
                if (path === '/app/views/:viewId/:ticketId?') {
                    return {
                        params: { viewId: '100', ticketId: '123' },
                    } as RouteMatchResult<{ viewId: string; ticketId: string }>
                }
                return null
            })
        })

        it('should not use legacy functions and provide ticket IDs', () => {
            useGoToNextTicketMock.mockReturnValue({
                goToTicket: mockGoToNextTicket,
                isEnabled: true,
            })
            useGoToPreviousTicketMock.mockReturnValue({
                goToTicket: mockGoToPreviousTicket,
                isEnabled: true,
            })

            const { result } = renderHook(
                () => useTicketLegacyBridgeFunctions(),
                { wrapper },
            )

            expect(
                result.current.ticketViewNavigation.shouldUseLegacyFunctions,
            ).toBe(false)
            expect(result.current.ticketViewNavigation.shouldDisplay).toBe(true)
            expect(result.current.ticketViewNavigation.nextTicketId).toBe(456)
            expect(result.current.ticketViewNavigation.previousTicketId).toBe(
                789,
            )
        })

        it('should display navigation when either direction is enabled', () => {
            useGoToNextTicketMock.mockReturnValue({
                goToTicket: mockGoToNextTicket,
                isEnabled: true,
            })
            useGoToPreviousTicketMock.mockReturnValue({
                goToTicket: mockGoToPreviousTicket,
                isEnabled: false,
            })

            const { result } = renderHook(
                () => useTicketLegacyBridgeFunctions(),
                { wrapper },
            )

            expect(result.current.ticketViewNavigation.shouldDisplay).toBe(true)
        })

        it('should not display navigation when neither direction is enabled', () => {
            useGoToNextTicketMock.mockReturnValue({
                goToTicket: mockGoToNextTicket,
                isEnabled: false,
            })
            useGoToPreviousTicketMock.mockReturnValue({
                goToTicket: mockGoToPreviousTicket,
                isEnabled: false,
            })

            const { result } = renderHook(
                () => useTicketLegacyBridgeFunctions(),
                { wrapper },
            )

            expect(result.current.ticketViewNavigation.shouldDisplay).toBe(
                false,
            )
        })
    })

    describe('ticketViewNavigation - split ticket view enabled', () => {
        beforeEach(() => {
            useSplitTicketViewMock.mockReturnValue({
                isEnabled: true,
                nextTicketId: 456,
                previousTicketId: 789,
                setIsEnabled: jest.fn(),
                setPrevNextTicketIds: jest.fn(),
                shouldRedirectToSplitView: false,
                setShouldRedirectToSplitView: jest.fn(),
            })
            useAppSelectorMock.mockReturnValue({
                get: jest.fn((key: string) =>
                    key === 'search' ? 'test' : null,
                ),
            })
            useRouteMatchMock.mockImplementation((path) => {
                if (path === '/app/views/:viewId/:ticketId?') {
                    return {
                        params: { viewId: '100', ticketId: '123' },
                    } as RouteMatchResult<{ viewId: string; ticketId: string }>
                }
                return null
            })
        })

        it('should use legacy functions in search view', () => {
            useIsTicketNavigationAvailableMock.mockReturnValue(true)

            const { result } = renderHook(
                () => useTicketLegacyBridgeFunctions(),
                { wrapper },
            )

            expect(
                result.current.ticketViewNavigation.shouldUseLegacyFunctions,
            ).toBe(true)
            expect(result.current.ticketViewNavigation.shouldDisplay).toBe(true)
        })
    })

    describe('ticketViewNavigation - legacy navigation functions', () => {
        beforeEach(() => {
            useSplitTicketViewMock.mockReturnValue({
                isEnabled: false,
                nextTicketId: undefined,
                previousTicketId: undefined,
                setIsEnabled: jest.fn(),
                setPrevNextTicketIds: jest.fn(),
                shouldRedirectToSplitView: false,
                setShouldRedirectToSplitView: jest.fn(),
            })
            useRouteMatchMock.mockImplementation((path) => {
                if (path === '/app/ticket/:ticketId') {
                    return { params: { ticketId: '123' } } as RouteMatchResult<{
                        ticketId: string
                    }>
                }
                return null
            })
            useIsTicketNavigationAvailableMock.mockReturnValue(true)
            useGoToNextTicketMock.mockReturnValue({
                goToTicket: mockGoToNextTicket,
                isEnabled: true,
            })
            useGoToPreviousTicketMock.mockReturnValue({
                goToTicket: mockGoToPreviousTicket,
                isEnabled: true,
            })
        })

        it('should provide legacy navigation functions', () => {
            const { result } = renderHook(
                () => useTicketLegacyBridgeFunctions(),
                { wrapper },
            )

            result.current.ticketViewNavigation.legacyGoToNextTicket()
            expect(mockGoToNextTicket).toHaveBeenCalled()

            result.current.ticketViewNavigation.legacyGoToPrevTicket()
            expect(mockGoToPreviousTicket).toHaveBeenCalled()
        })
    })
})

describe('useLegacyDispatchDismissNotification', () => {
    const mockDispatch = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        useAppDispatchMock.mockReturnValue(mockDispatch)
    })

    it('should dispatch dismiss notification action with id', () => {
        const { result } = renderHook(
            () => useLegacyDispatchDismissNotification(),
            { wrapper },
        )

        result.current('notification-123')

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'reapop/dismissNotification',
            payload: 'notification-123',
        })
    })
})
