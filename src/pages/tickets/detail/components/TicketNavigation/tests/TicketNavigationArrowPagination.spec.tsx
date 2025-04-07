import React, { ComponentProps } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import useAppSelector from 'hooks/useAppSelector'
import { useSplitTicketView } from 'split-ticket-view-toggle'

import useGoToNextTicket from '../hooks/useGoToNextTicket'
import useGoToPreviousTicket from '../hooks/useGoToPreviousTicket'
import useIsTicketNavigationAvailable from '../hooks/useIsTicketNavigationAvailable'
import TicketNavigationArrowPagination from '../TicketNavigationArrowPagination'

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('@gorgias/merchant-ui-kit', () => {
    return {
        ...jest.requireActual('@gorgias/merchant-ui-kit'),
        Tooltip: ({ children }: ComponentProps<typeof Tooltip>) => {
            return <div aria-label="tooltip mock">{children}</div>
        },
    } as Record<string, unknown>
})
jest.mock('split-ticket-view-toggle/hooks/useSplitTicketView')
const useSplitTicketViewMock = useSplitTicketView as jest.Mock

const mockGoToPreviousTicket = jest.fn()
jest.mock('../hooks/useGoToPreviousTicket')
const mockUseGoToPreviousTicket = useGoToPreviousTicket as jest.Mock

const mockGoToNextTicket = jest.fn()
jest.mock('../hooks/useGoToNextTicket')
const mockUseGoToNextTicket = useGoToNextTicket as jest.Mock

jest.mock('../hooks/useIsTicketNavigationAvailable')
const mockUseIsTicketNavigationAvailable =
    useIsTicketNavigationAvailable as jest.Mock

describe('TicketNavigationArrowPagination', () => {
    const ticketId = '123'

    beforeEach(() => {
        useAppSelectorMock.mockReturnValue(fromJS({}))
        useSplitTicketViewMock.mockReturnValue({ isEnabled: false })
        mockUseIsTicketNavigationAvailable.mockReturnValue(false)
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
        mockUseIsTicketNavigationAvailable.mockReturnValue(true)
        render(<TicketNavigationArrowPagination ticketId={ticketId} />)

        const prevArrow = screen.getByText('keyboard_arrow_left')
        const nextArrow = screen.getByText('keyboard_arrow_right')

        expect(prevArrow.parentElement?.id).toEqual(
            'pagination-item-arrow-previous',
        )
        expect(screen.getByText('Previous ticket')).toBeInTheDocument()

        expect(nextArrow.parentElement?.id).toEqual(
            'pagination-item-arrow-next',
        )
        expect(screen.getByText('Next ticket')).toBeInTheDocument()

        fireEvent.click(prevArrow)
        fireEvent.click(nextArrow)

        expect(mockGoToPreviousTicket).toHaveBeenCalledTimes(1)
        expect(mockGoToNextTicket).toHaveBeenCalledTimes(1)
    })

    it('should render without PREV & NEXT buttons when DTP is disabled', () => {
        render(<TicketNavigationArrowPagination ticketId={ticketId} />)

        const prevArrow = screen.queryByText('keyboard_arrow_left')
        const nextArrow = screen.queryByText('keyboard_arrow_right')

        expect(prevArrow).toBeNull()
        expect(nextArrow).toBeNull()

        expect(screen.queryByText('Previous ticket')).toBeNull()
        expect(screen.queryByText('Next ticket')).toBeNull()
    })

    it('should render without PREV & NEXT buttons when DTP is enabled and navigation is disabled', () => {
        useSplitTicketViewMock.mockReturnValue({ isEnabled: true })
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

    it('should not evaluate DTP related navigation if DTP is enabled, but search view is active', () => {
        useSplitTicketViewMock.mockReturnValue({ isEnabled: true })
        useAppSelectorMock.mockReturnValue(fromJS({ search: '' }))
        mockUseIsTicketNavigationAvailable.mockReturnValue(true)

        render(<TicketNavigationArrowPagination ticketId={ticketId} />)

        const prevArrow = screen.queryByText('keyboard_arrow_left')
        const nextArrow = screen.queryByText('keyboard_arrow_right')

        expect(prevArrow).toBeInTheDocument()
        expect(nextArrow).toBeInTheDocument
    })
})
