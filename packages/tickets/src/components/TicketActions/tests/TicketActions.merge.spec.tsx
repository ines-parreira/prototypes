import { DateFormatType, TimeFormatType } from '@repo/utils'
import { screen } from '@testing-library/react'

import { mockTicket } from '@gorgias/helpdesk-mocks'
import type { TicketsSearchListDataItem } from '@gorgias/helpdesk-types'

import { createTestQueryClient, render } from '../../../tests/render.utils'
import { MergeTicketsModal } from '../actions/merge-tickets/MergeTicketsModal'
import * as useMergeTicketsModule from '../actions/merge-tickets/useMergeTickets'
import * as useMergeTicketSearchModule from '../actions/merge-tickets/useMergeTicketSearch'

vi.mock('@repo/user', () => ({
    useUserDateTimePreferences: () => ({
        dateFormat: DateFormatType.en_US,
        timeFormat: TimeFormatType.AmPm,
        timezone: 'UTC',
    }),
}))
vi.mock('../actions/merge-tickets/useMergeTicketSearch')
vi.mock('../actions/merge-tickets/useMergeTickets')
vi.mock('../../TicketMessageSourceIcon/TicketMessageSourceIcon', () => ({
    TicketMessageSourceIcon: () => <span>channel</span>,
}))

const mockedUseMergeTicketSearch = vi.mocked(
    useMergeTicketSearchModule.useMergeTicketSearch,
)
const mockedUseMergeTickets = vi.mocked(useMergeTicketsModule.useMergeTickets)

const sourceTicket = mockTicket({
    id: 123,
    subject: 'Source Ticket',
    spam: false,
    is_unread: false,
    trashed_datetime: null,
})

const targetTicket: TicketsSearchListDataItem = {
    id: 456,
    subject: 'Target Ticket Subject',
    assignee_team: undefined,
    assignee_user: { id: 200, name: 'Agent Johnson' },
    customer: { id: 999, name: 'Jane Smith' },
}

const mockSetSearchQuery = vi.fn()
const mockMergeTickets = vi.fn()
const mockOnOpenChange = vi.fn()

function renderComponent() {
    return render(
        <MergeTicketsModal
            isOpen={true}
            onOpenChange={mockOnOpenChange}
            ticket={sourceTicket}
        />,
        {
            queryClient: createTestQueryClient(),
        },
    )
}

describe('TicketActions merge tickets', () => {
    beforeEach(() => {
        mockSetSearchQuery.mockReset()
        mockMergeTickets.mockReset()
        mockOnOpenChange.mockReset()
        mockMergeTickets.mockResolvedValue(undefined)

        mockedUseMergeTicketSearch.mockReturnValue({
            tickets: {
                data: {
                    data: [targetTicket],
                },
            } as any,
            isFetching: false,
            searchQuery: '',
            setSearchQuery: mockSetSearchQuery,
        })

        mockedUseMergeTickets.mockReturnValue({
            mergeTickets: mockMergeTickets,
        })
    })

    it('should render search step and disabled merge button', async () => {
        renderComponent()

        expect(await screen.findByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText('Select ticket')).toBeInTheDocument()
        expect(screen.getByText('Select properties')).toBeInTheDocument()
        expect(
            screen.getByText(/Select the ticket you want to merge/i),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: 'Merge tickets',
            }),
        ).toBeDisabled()
    })

    it('should close modal when user cancels', async () => {
        const { user } = renderComponent()

        await user.click(await screen.findByRole('button', { name: /close/i }))

        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('should update search query when typing', async () => {
        const { user } = renderComponent()

        const searchInput = await screen.findByPlaceholderText(
            'Search for a ticket',
        )
        await user.type(searchInput, 'target')

        await vi.waitFor(() => {
            expect(mockSetSearchQuery).toHaveBeenCalled()
        })
    })

    it('should search and display ticket results', async () => {
        renderComponent()

        expect(
            await screen.findByText('Target Ticket Subject'),
        ).toBeInTheDocument()
    })

    it('should complete merge workflow successfully', async () => {
        const { user } = renderComponent()

        const targetTicketRow = (
            await screen.findByText('Target Ticket Subject')
        ).closest('tr')
        expect(targetTicketRow).toBeInTheDocument()

        await user.click(targetTicketRow!)

        const confirmationCheckbox = await screen.findByLabelText(
            'I understand that this action is irreversible.',
        )
        await user.click(confirmationCheckbox)

        const mergeButton = await screen.findByRole('button', {
            name: 'Merge tickets',
        })

        await vi.waitFor(() => {
            expect(mergeButton).not.toBeDisabled()
        })

        await user.click(mergeButton)

        await vi.waitFor(() => {
            expect(mockMergeTickets).toHaveBeenCalledWith(
                {
                    assignee_user: { id: 200 },
                    customer: { id: 999 },
                    subject: 'Target Ticket Subject',
                },
                {
                    source_id: 123,
                    target_id: 456,
                },
            )
        })
    })
})
