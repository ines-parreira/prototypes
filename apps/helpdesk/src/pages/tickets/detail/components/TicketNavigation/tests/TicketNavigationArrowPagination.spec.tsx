import { useFlag } from '@repo/feature-flags'
import { render, userEvent } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useAppSelector } from 'hooks/useAppSelector'
import { useSplitTicketView } from 'split-ticket-view-toggle'

import { useGoToNextTicket } from '../hooks/useGoToNextTicket'
import { useGoToPreviousTicket } from '../hooks/useGoToPreviousTicket'
import { useIsTicketNavigationAvailable } from '../hooks/useIsTicketNavigationAvailable'
import { TicketNavigationArrowPagination } from '../TicketNavigationArrowPagination'

jest.mock('hooks/useAppSelector', () => ({ useAppSelector: jest.fn() }))
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.Mock

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
        mockUseFlag.mockReturnValue(false)
    })

    it('should render & test buttons: enabled PREV & enabled NEXT with tooltips', async () => {
        const user = userEvent.setup()
        mockUseIsTicketNavigationAvailable.mockReturnValue(true)
        render(<TicketNavigationArrowPagination ticketId={ticketId} />)

        const prevArrow = screen.getByLabelText('previous')
        const nextArrow = screen.getByLabelText('next')

        expect(screen.getByText('keyboard_arrow_left')).toBeInTheDocument()
        expect(screen.getByText('keyboard_arrow_right')).toBeInTheDocument()

        await user.hover(prevArrow)
        expect(await screen.findByText('Previous ticket')).toBeInTheDocument()

        await user.hover(nextArrow)
        expect(await screen.findByText('Next ticket')).toBeInTheDocument()

        await user.click(prevArrow)
        await user.click(nextArrow)

        expect(mockGoToPreviousTicket).toHaveBeenCalledTimes(1)
        expect(mockGoToNextTicket).toHaveBeenCalledTimes(1)
    })

    it('should render without PREV & NEXT buttons when DTP is disabled', () => {
        render(<TicketNavigationArrowPagination ticketId={ticketId} />)

        expect(screen.queryByLabelText('previous')).toBeNull()
        expect(screen.queryByLabelText('next')).toBeNull()

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

        expect(screen.queryByLabelText('previous')).toBeNull()
        expect(screen.queryByLabelText('next')).toBeNull()

        expect(screen.queryByText('Previous ticket')).toBeNull()
        expect(screen.queryByText('Next ticket')).toBeNull()
    })

    it('should not evaluate DTP related navigation if DTP is enabled, but search view is active', () => {
        useSplitTicketViewMock.mockReturnValue({ isEnabled: true })
        useAppSelectorMock.mockReturnValue(fromJS({ search: '' }))
        mockUseIsTicketNavigationAvailable.mockReturnValue(true)

        render(<TicketNavigationArrowPagination ticketId={ticketId} />)

        expect(screen.getByLabelText('previous')).toBeInTheDocument()
        expect(screen.getByLabelText('next')).toBeInTheDocument()
    })

    it('should render arrows when navigation is available', () => {
        mockUseIsTicketNavigationAvailable.mockReturnValue(true)

        render(<TicketNavigationArrowPagination ticketId={ticketId} />)

        expect(screen.getByLabelText('previous')).toBeInTheDocument()
        expect(screen.getByLabelText('next')).toBeInTheDocument()
    })
})
