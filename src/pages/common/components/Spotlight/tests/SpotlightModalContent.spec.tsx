import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {
    CUSTOMERS_LABEL,
    TICKETS_LABEL,
} from 'pages/common/components/Spotlight/constants'
import {CustomerWithHighlights, TicketWithHighlights} from 'models/search/types'
import SpotlightCustomerRow from 'pages/common/components/Spotlight/SpotlightCustomerRow'
import {customer} from 'fixtures/customer'
import SpotlightTicketRow, {
    PickedTicket,
} from 'pages/common/components/Spotlight/SpotlightTicketRow'
import {ViewType} from 'models/view/types'
import mockedVirtuoso from 'tests/mockedVirtuoso'
import {
    MORE_RESULTS_LABEL,
    RECENTLY_ACCESSED_LABEL,
    SpotlightModalContent,
} from 'pages/common/components/Spotlight/SpotlightModalContent'
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
        onTabChange: jest.fn(),
    }
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
        const props = {
            ...defaultProps,
            searchItemsType: ViewType.TicketList,
            resultsWithHighlights: [ticketWithHighlights],
            isSearchWithHighlights: true,
        }

        render(
            <SpotlightModalContent {...props} isSearchWithHighlights={true} />
        )

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

    it('should render tickets and customers in Federated Search', async () => {
        const props = {
            ...defaultProps,
            data: undefined,
            searchItemsType: ViewType.All,
            resultsWithHighlights: [
                ticketWithHighlights,
                customerWithHighlights,
            ],
            isSearchWithHighlights: true,
        }
        const {getByText} = render(<SpotlightModalContent {...props} />)

        await waitFor(() => {
            expect(SpotlightTicketRowMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    item: ticketWithHighlights.entity,
                    highlights: ticketWithHighlights.highlights,
                }),
                {}
            )
            expect(SpotlightCustomerRowMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    item: customerWithHighlights.entity,
                    highlights: customerWithHighlights.highlights,
                }),
                {}
            )
            expect(getByText(TICKETS_LABEL)).toBeInTheDocument()
            expect(getByText(CUSTOMERS_LABEL)).toBeInTheDocument()
        })
    })

    it('should render recent tickets and customers in Federated Search', async () => {
        const props = {
            ...defaultProps,
            data: undefined,
            searchItemsType: ViewType.All,
            recentTickets: [ticketWithHighlights.entity],
            recentCustomers: [customerWithHighlights.entity],
            isSearchWithHighlights: true,
            hasSearched: false,
        }
        const {getByText} = render(<SpotlightModalContent {...props} />)

        await waitFor(() => {
            expect(SpotlightTicketRowMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    item: ticketWithHighlights.entity,
                }),
                {}
            )
            expect(SpotlightCustomerRowMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    item: customerWithHighlights.entity,
                }),
                {}
            )
            expect(getByText(RECENTLY_ACCESSED_LABEL)).toBeInTheDocument()
        })
    })

    it('should allow switching to specific tabs from Federated Search', async () => {
        const onTabChange = jest.fn()
        const props = {
            ...defaultProps,
            searchItemsType: ViewType.All,
            resultsWithHighlights: [
                ticketWithHighlights,
                customerWithHighlights,
            ],
            isSearchWithHighlights: true,
            onTabChange,
        }
        render(<SpotlightModalContent {...props} />)

        const moreTickets = await screen.findAllByText(MORE_RESULTS_LABEL)
        if (moreTickets) {
            userEvent.click(moreTickets[0])
        }

        expect(onTabChange).toHaveBeenCalled()
    })
})
