import {render} from '@testing-library/react'
import React from 'react'
import {CustomerWithHighlights, TicketWithHighlights} from 'models/search/types'
import SpotlightCustomerRow from 'pages/common/components/Spotlight/SpotlightCustomerRow'
import {customer} from 'fixtures/customer'
import SpotlightTicketRow, {
    PickedTicket,
} from 'pages/common/components/Spotlight/SpotlightTicketRow'
import {ViewType} from 'models/view/types'
import mockedVirtuoso from 'tests/mockedVirtuoso'
import {SpotlightModalContent} from 'pages/common/components/Spotlight/SpotlightModalContent'
import {ticket} from 'fixtures/ticket'
import {assumeMock} from 'utils/testing'

jest.mock('react-virtuoso', () => mockedVirtuoso)

jest.mock('pages/common/components/Spotlight/SpotlightTicketRow')
const SpotlightTicketRowMock = assumeMock(SpotlightTicketRow)

jest.mock('pages/common/components/Spotlight/SpotlightCustomerRow')
const SpotlightCustomerRowMock = assumeMock(SpotlightCustomerRow)

describe('<SpotlightModalContent />', () => {
    const defaultProps = {
        isLoading: false,
        searchItemsType: ViewType.TicketList,
        tickets: [],
        customers: [],
        resultsWithHighlights: [],
        recentTickets: [],
        recentCustomers: [],
        goToAdvancedSearch: jest.fn(),
        searchRank: {
            isRunning: false,
            registerResultsRequest: jest.fn(),
            registerResultsResponse: jest.fn(),
            registerResultSelection: jest.fn(),
            endScenario: jest.fn(),
        },
        modalBodyRef: {current: null},
        nextCursor: undefined,
        handleLoadMore: jest.fn(),
        isFetchingMore: false,
        onCloseModal: jest.fn(),
        handleHover: jest.fn(),
        selectedIndex: 0,
        hasSearched: true,
        logRecentlyAccessedSegmentEvent: jest.fn(),
    }

    beforeEach(() => {
        SpotlightTicketRowMock.mockImplementation(() => <div />)
        SpotlightCustomerRowMock.mockImplementation(() => <div />)
    })

    it('should render tickets', () => {
        const props = {
            ...defaultProps,
            searchItemsType: ViewType.TicketList,
            tickets: [ticket as PickedTicket],
            isSearchWithHighlights: false,
        }

        render(<SpotlightModalContent {...props} />)

        expect(SpotlightTicketRowMock).toHaveBeenCalledWith(
            expect.objectContaining({
                item: ticket,
            }),
            {}
        )
    })

    it('should render tickets with highlights', () => {
        const highlightedContent = '<em>some Highlighted text</em>'
        const ticketWithHighlights: TicketWithHighlights = {
            type: 'Ticket',
            entity: ticket as PickedTicket,
            highlights: {
                id: [],
                subject: [],
                messages: {
                    body: [highlightedContent],
                    from: {
                        name: [highlightedContent],
                        address: [highlightedContent],
                    },
                    to: {
                        name: [highlightedContent],
                        address: [highlightedContent],
                    },
                },
            },
        }
        const props = {
            ...defaultProps,
            searchItemsType: ViewType.TicketList,
            resultsWithHighlights: [ticketWithHighlights],
            isSearchWithHighlights: true,
        }

        render(<SpotlightModalContent {...props} />)

        expect(SpotlightTicketRowMock).toHaveBeenCalledWith(
            expect.objectContaining({
                item: ticketWithHighlights.entity,
                highlights: ticketWithHighlights.highlights,
            }),
            {}
        )
    })

    it('should render customers', () => {
        const props = {
            ...defaultProps,
            searchItemsType: ViewType.CustomerList,
            customers: [customer],
            isSearchWithHighlights: false,
        }

        render(<SpotlightModalContent {...props} />)

        expect(SpotlightCustomerRowMock).toHaveBeenCalledWith(
            expect.objectContaining({
                item: customer,
            }),
            {}
        )
    })

    it('should render customers with highlights', () => {
        const highlightedContent = '<em>some Highlighted text</em>'
        const customerWithHighlights: CustomerWithHighlights = {
            type: 'Customer',
            entity: customer,
            highlights: {
                channels: {
                    address: [highlightedContent],
                },
                name: [highlightedContent],
                email: [highlightedContent],
                order_ids: [highlightedContent],
            },
        }
        const props = {
            ...defaultProps,
            searchItemsType: ViewType.CustomerList,
            resultsWithHighlights: [customerWithHighlights],
            isSearchWithHighlights: true,
        }

        render(<SpotlightModalContent {...props} />)

        expect(SpotlightCustomerRowMock).toHaveBeenCalledWith(
            expect.objectContaining({
                item: customerWithHighlights.entity,
                highlights: customerWithHighlights.highlights,
            }),
            {}
        )
    })
})
