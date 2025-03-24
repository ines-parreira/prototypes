import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { ObjectType } from '@gorgias/api-queries'

import { logEvent, SegmentEvent } from 'common/segment'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { apiListCursorPaginationResponse } from 'fixtures/axiosResponse'
import { ticketInputFieldDefinition } from 'fixtures/customField'
import { getCustomerHistory, getLoading } from 'state/customers/selectors'
import { assumeMock } from 'utils/testing'

import TicketCard from '../TicketCard'
import Timeline from '../Timeline'

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        CustomerTimelineTicketClicked: 'CustomerTimelineTicketClicked',
    },
}))
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions', () => ({
    useCustomFieldDefinitions: jest.fn(),
}))
jest.mock('hooks/useAppSelector', () => (fn: () => unknown) => fn())
jest.mock('state/customers/selectors', () => {
    const original = jest.requireActual('state/customers/selectors')

    return {
        ...original,
        getCustomerHistory: jest.fn(),
        getLoading: jest.fn(),
    }
})
jest.mock('../TicketCard', () => jest.fn(() => <div>TicketCard</div>))

const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)
const getCustomerHistoryMock = assumeMock(getCustomerHistory)
const getLoadingMock = assumeMock(getLoading)

const defaultFieldDefinitions = {
    data: apiListCursorPaginationResponse([ticketInputFieldDefinition]),
    isLoading: false,
} as ReturnType<typeof useCustomFieldDefinitions>

describe('<Timeline />', () => {
    const ticket1 = { id: 1, channel: 'email' }
    const ticket2 = { id: 2 }
    const ticket3 = { id: 3, channel: 'email' }
    beforeEach(() => {
        useCustomFieldDefinitionsMock.mockReturnValue(defaultFieldDefinitions)
        getCustomerHistoryMock.mockReturnValue(
            fromJS({
                triedLoading: true,
                tickets: [ticket1, ticket2, ticket3],
            }),
        )
        getLoadingMock.mockReturnValue(
            fromJS({
                history: false,
            }),
        )
    })

    it('should render loading spinner', () => {
        getLoadingMock.mockReturnValue(
            fromJS({
                history: true,
            }),
        )

        render(<Timeline />)

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should render no results', () => {
        getCustomerHistoryMock.mockReturnValue(
            fromJS({
                triedLoading: true,
                tickets: [],
            }),
        )

        render(<Timeline />)

        expect(
            screen.getByText('This customer doesn’t have any tickets yet.'),
        ).toBeInTheDocument()
    })

    it('should call onLoaded when triedLoading is true and hasCalledOnLoaded is false', () => {
        const onLoaded = jest.fn()
        const { rerender } = render(<Timeline onLoaded={onLoaded} />)

        expect(onLoaded).toHaveBeenCalledTimes(1)

        // Should not call onLoaded again
        rerender(<Timeline onLoaded={onLoaded} />)
        expect(onLoaded).toHaveBeenCalledTimes(1)
    })

    it('should call useCustomFieldDefinitions with correct params', () => {
        render(<Timeline />)

        expect(useCustomFieldDefinitionsMock).toHaveBeenCalledWith({
            archived: false,
            object_type: ObjectType.Ticket,
        })
    })

    it('should handle custom field definitions loading correctly', () => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as ReturnType<typeof useCustomFieldDefinitions>)

        render(<Timeline />)

        expect(TicketCard).toHaveBeenCalledWith(
            expect.objectContaining({
                isLoadingCFDefinitions: true,
                customFieldDefinitions: [],
            }),
            {},
        )
    })

    it('should call TicketCard for each ticket with a channel, in correct order, with correct props', () => {
        const ticketId = 3
        render(<Timeline ticketId={ticketId} />)

        expect(TicketCard).toHaveBeenCalledTimes(2)
        expect(TicketCard).toHaveBeenNthCalledWith(
            1,
            {
                isHighlighted: false,
                customFieldDefinitions: [ticketInputFieldDefinition],
                isLoadingCFDefinitions: false,
                ticket: ticket1,
            },
            {},
        )
        expect(TicketCard).toHaveBeenNthCalledWith(
            2,
            {
                isHighlighted: true,
                customFieldDefinitions: [ticketInputFieldDefinition],
                isLoadingCFDefinitions: false,
                ticket: ticket3,
            },
            {},
        )
    })

    it('should log event and redirect when Link is clicked', () => {
        render(<Timeline />)

        const link = screen.getAllByText('TicketCard')[0].parentElement
        link?.click()
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.CustomerTimelineTicketClicked,
        )
        expect(link).toHaveAttribute('to', '/app/ticket/1')
    })
})
