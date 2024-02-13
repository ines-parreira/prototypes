import React, {ComponentProps} from 'react'
import LD from 'launchdarkly-react-client-sdk'
import {render, screen, fireEvent} from '@testing-library/react'

import useAppDispatch from 'hooks/useAppDispatch'
import * as ticketActions from 'state/ticket/actions'
import Tooltip from 'pages/common/components/Tooltip'
import {useSplitTicketView} from 'split-ticket-view-toggle'
import {FeatureFlagKey} from 'config/featureFlags'
import TicketNavigationArrowPagination from '../TicketNavigationArrowPagination'
import useGoToNextTicket from '../hooks/useGoToNextTicket'
import useGoToPreviousTicket from '../hooks/useGoToPreviousTicket'

jest.mock('hooks/useAppDispatch', () => jest.fn())

// Mock Tooltip component
jest.mock(
    'pages/common/components/Tooltip',
    () =>
        ({children}: ComponentProps<typeof Tooltip>) =>
            <div>{children}</div>
)
jest.mock('split-ticket-view-toggle/hooks/useSplitTicketView')
const useSplitTicketViewMock = useSplitTicketView as jest.Mock

const mockGoToPreviousTicket = jest.fn()
jest.mock('../hooks/useGoToPreviousTicket')
const mockUseGoToPreviousTicket = useGoToPreviousTicket as jest.Mock

const mockGoToNextTicket = jest.fn()
jest.mock('../hooks/useGoToNextTicket')
const mockUseGoToNextTicket = useGoToNextTicket as jest.Mock

describe('TicketNavigationArrowPagination', () => {
    const ticketId = '123'

    let dispatch: jest.Mock
    const useAppDispatchMock = useAppDispatch as jest.Mock
    const isTicketNavigationAvailableMock = jest.spyOn(
        ticketActions,
        'isTicketNavigationAvailable'
    )

    beforeEach(() => {
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
        jest.spyOn(LD, 'useFlags').mockReturnValue({
            [FeatureFlagKey.SplitTicketView]: false,
        })
        useSplitTicketViewMock.mockReturnValue({isEnabled: false})

        mockUseGoToPreviousTicket.mockReturnValue({
            goToTicket: mockGoToPreviousTicket,
            isDisabled: false,
        })
        mockUseGoToNextTicket.mockReturnValue({
            goToTicket: mockGoToNextTicket,
            isDisabled: false,
        })
    })

    it('should render & test buttons: enabled PREV & enabled NEXT with tooltips', () => {
        useAppDispatchMock.mockReturnValue(jest.fn(() => true))

        render(<TicketNavigationArrowPagination ticketId={ticketId} />)

        const prevArrow = screen.getByText('keyboard_arrow_left')
        const nextArrow = screen.getByText('keyboard_arrow_right')

        expect(prevArrow.parentElement?.id).toEqual(
            'pagination-item-arrow-previous'
        )
        expect(screen.getByText('Previous ticket')).toBeInTheDocument()

        expect(nextArrow.parentElement?.id).toEqual(
            'pagination-item-arrow-next'
        )
        expect(screen.getByText('Next ticket')).toBeInTheDocument()

        fireEvent.click(prevArrow)
        fireEvent.click(nextArrow)

        expect(mockGoToPreviousTicket).toHaveBeenCalledTimes(1)
        expect(mockGoToNextTicket).toHaveBeenCalledTimes(1)

        expect(isTicketNavigationAvailableMock).toHaveBeenCalledTimes(1)
    })

    it('should render without PREV & NEXT buttons when DTP is disabled', () => {
        render(<TicketNavigationArrowPagination ticketId={ticketId} />)

        const prevArrow = screen.queryByText('keyboard_arrow_left')
        const nextArrow = screen.queryByText('keyboard_arrow_right')

        expect(prevArrow).toBeNull()
        expect(nextArrow).toBeNull()

        expect(screen.queryByText('Previous ticket')).toBeNull()
        expect(screen.queryByText('Next ticket')).toBeNull()

        expect(isTicketNavigationAvailableMock).toHaveBeenCalledTimes(1)
    })

    it('should render without PREV & NEXT buttons when DTP is enabled', () => {
        jest.spyOn(LD, 'useFlags').mockReturnValue({
            [FeatureFlagKey.SplitTicketView]: true,
        })
        useSplitTicketViewMock.mockReturnValue({isEnabled: true})
        mockUseGoToPreviousTicket.mockReturnValue({
            isDisabled: true,
        })
        mockUseGoToNextTicket.mockReturnValue({
            isDisabled: true,
        })
        render(<TicketNavigationArrowPagination ticketId={ticketId} />)

        const prevArrow = screen.queryByText('keyboard_arrow_left')
        const nextArrow = screen.queryByText('keyboard_arrow_right')

        expect(prevArrow).toBeNull()
        expect(nextArrow).toBeNull()

        expect(screen.queryByText('Previous ticket')).toBeNull()
        expect(screen.queryByText('Next ticket')).toBeNull()
    })
})
