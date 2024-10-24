import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// eslint-disable-next-line import/order
import mockedVirtuoso from 'tests/mockedVirtuoso'
import {customer} from 'fixtures/customer'
import {ticket} from 'fixtures/ticket'
import {Customer} from 'models/customer/types'
import {
    PickedCustomerWithHighlights,
    PickedTicketWithHighlights,
} from 'models/search/types'
import {ViewType} from 'models/view/types'
import {
    CUSTOMERS_LABEL,
    TICKETS_LABEL,
} from 'pages/common/components/Spotlight/constants'
import SpotlightCustomerRow from 'pages/common/components/Spotlight/SpotlightCustomerRow'
import {
    MORE_RESULTS_LABEL,
    RECENTLY_ACCESSED_LABEL,
    SpotlightModalContent,
} from 'pages/common/components/Spotlight/SpotlightModalContent'
import SpotlightTicketRow from 'pages/common/components/Spotlight/SpotlightTicketRow'
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
    const ticketWithHighlights: PickedTicketWithHighlights = {
        ...ticket,
        customer: ticket.customer as Pick<Customer, 'name' | 'id' | 'email'>,
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
    const customerWithHighlights: PickedCustomerWithHighlights = {
        ...customer,
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

    it('should render tickets without highlights', () => {
        const props = {
            ...defaultProps,
            searchItemsType: ViewType.TicketList,
            tickets: [ticket as PickedTicketWithHighlights],
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
            tickets: [ticketWithHighlights],
        }

        render(<SpotlightModalContent {...props} />)

        expect(SpotlightTicketRowMock).toHaveBeenCalledWith(
            expect.objectContaining({
                item: ticketWithHighlights,
            }),
            {}
        )
    })

    it('should render customers', () => {
        const props = {
            ...defaultProps,
            searchItemsType: ViewType.CustomerList,
            customers: [customer],
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
            customers: [customerWithHighlights],
        }

        render(<SpotlightModalContent {...props} />)

        expect(SpotlightCustomerRowMock).toHaveBeenCalledWith(
            expect.objectContaining({
                item: customerWithHighlights,
            }),
            {}
        )
    })

    it('should render tickets and customers in Federated Search', async () => {
        const props = {
            ...defaultProps,
            data: undefined,
            searchItemsType: ViewType.All,
            tickets: [ticketWithHighlights],
            customers: [customerWithHighlights],
        }
        const {getByText} = render(<SpotlightModalContent {...props} />)

        await waitFor(() => {
            expect(SpotlightTicketRowMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    item: ticketWithHighlights,
                }),
                {}
            )
            expect(SpotlightCustomerRowMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    item: customerWithHighlights,
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
            recentTickets: [ticketWithHighlights],
            recentCustomers: [customerWithHighlights],
            hasSearched: false,
        }
        const {getByText} = render(<SpotlightModalContent {...props} />)

        await waitFor(() => {
            expect(SpotlightTicketRowMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    item: ticketWithHighlights,
                }),
                {}
            )
            expect(SpotlightCustomerRowMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    item: customerWithHighlights,
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
            tickets: [ticketWithHighlights],
            customers: [customerWithHighlights],
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
