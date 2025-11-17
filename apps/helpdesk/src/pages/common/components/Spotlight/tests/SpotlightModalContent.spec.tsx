// sort-imports-ignore
import mockedVirtuoso from 'tests/mockedVirtuoso'

import { render, screen, waitFor } from '@testing-library/react'
import { assumeMock, userEvent } from '@repo/testing'

import { customer } from 'fixtures/customer'
import { ticket } from 'fixtures/ticket'
import { voiceCall } from 'fixtures/voiceCalls'
import type { Customer } from 'models/customer/types'
import type {
    PickedCustomerWithHighlights,
    PickedTicketWithHighlights,
} from 'models/search/types'
import { ViewType } from 'models/view/types'
import {
    CUSTOMERS_LABEL,
    TICKETS_LABEL,
} from 'pages/common/components/Spotlight/constants'
import SpotlightCallRow from 'pages/common/components/Spotlight/SpotlightCallRow'
import SpotlightCustomerRow from 'pages/common/components/Spotlight/SpotlightCustomerRow'
import {
    MORE_RESULTS_LABEL,
    RECENTLY_ACCESSED_LABEL,
    SpotlightModalContent,
} from 'pages/common/components/Spotlight/SpotlightModalContent'
import SpotlightTicketRow from 'pages/common/components/Spotlight/SpotlightTicketRow'

jest.mock('react-virtuoso', () => mockedVirtuoso)

jest.mock('pages/common/components/Spotlight/SpotlightTicketRow')
const SpotlightTicketRowMock = assumeMock(SpotlightTicketRow)

jest.mock('pages/common/components/Spotlight/SpotlightCustomerRow')
const SpotlightCustomerRowMock = assumeMock(SpotlightCustomerRow)

jest.mock('pages/common/components/Spotlight/SpotlightCallRow')
const SpotlightCallRowMock = assumeMock(SpotlightCallRow)

describe('<SpotlightModalContent />', () => {
    const defaultProps = {
        isLoading: false,
        searchItemsType: ViewType.TicketList,
        tickets: [],
        customers: [],
        calls: [],
        recentTickets: [],
        recentCustomers: [],
        recentCalls: [],
        goToAdvancedSearch: jest.fn(),
        searchRank: {
            isRunning: false,
            registerResultsRequest: jest.fn(),
            registerResultsResponse: jest.fn(),
            registerResultSelection: jest.fn(),
            endScenario: jest.fn(),
        },
        modalBodyRef: { current: null },
        nextCursor: undefined,
        handleLoadMore: jest.fn(),
        isFetchingMore: false,
        onCloseModal: jest.fn(),
        selectedIndex: 0,
        hasSearched: true,
        logRecentlyAccessedSegmentEvent: jest.fn(),
        onTabChange: jest.fn(),
        showCallsTab: false,
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
        SpotlightCallRowMock.mockImplementation(() => <div />)
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
            {},
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
            {},
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
            {},
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
            {},
        )
    })

    it('should render tickets and customers in Federated Search', async () => {
        const props = {
            ...defaultProps,
            searchItemsType: ViewType.All,
            tickets: [ticketWithHighlights],
            customers: [customerWithHighlights],
        }
        const { getByText } = render(<SpotlightModalContent {...props} />)

        await waitFor(() => {
            expect(SpotlightTicketRowMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    item: ticketWithHighlights,
                }),
                {},
            )
            expect(SpotlightCustomerRowMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    item: customerWithHighlights,
                }),
                {},
            )
            expect(getByText(TICKETS_LABEL)).toBeInTheDocument()
            expect(getByText(CUSTOMERS_LABEL)).toBeInTheDocument()
        })
    })

    it('should render recent tickets and customers in Federated Search', async () => {
        const props = {
            ...defaultProps,
            searchItemsType: ViewType.All,
            recentTickets: [ticketWithHighlights],
            recentCustomers: [customerWithHighlights],
            hasSearched: false,
        }
        const { getByText } = render(<SpotlightModalContent {...props} />)

        await waitFor(() => {
            expect(SpotlightTicketRowMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    item: ticketWithHighlights,
                }),
                {},
            )
            expect(SpotlightCustomerRowMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    item: customerWithHighlights,
                }),
                {},
            )
            expect(SpotlightCallRowMock).not.toHaveBeenCalled()
            expect(getByText(RECENTLY_ACCESSED_LABEL)).toBeInTheDocument()
        })
    })

    it('should render recent calls in Federated Search', async () => {
        const props = {
            ...defaultProps,
            searchItemsType: ViewType.All,
            recentTickets: [ticketWithHighlights],
            recentCustomers: [customerWithHighlights],
            recentCalls: [voiceCall],
            hasSearched: false,
            showCallsTab: true,
        }
        const { getByText } = render(<SpotlightModalContent {...props} />)

        await waitFor(() => {
            expect(SpotlightTicketRowMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    item: ticketWithHighlights,
                }),
                {},
            )
            expect(SpotlightCustomerRowMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    item: customerWithHighlights,
                }),
                {},
            )
            expect(SpotlightCallRowMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    item: voiceCall,
                }),
                {},
            )
            expect(getByText(RECENTLY_ACCESSED_LABEL)).toBeInTheDocument()
        })
    })

    it('should render recent calls in Calls tab', async () => {
        const props = {
            ...defaultProps,
            searchItemsType: ViewType.CallList,
            recentTickets: [ticketWithHighlights],
            recentCustomers: [customerWithHighlights],
            recentCalls: [voiceCall],
            hasSearched: false,
            showCallsTab: true,
        }
        const { getByText } = render(<SpotlightModalContent {...props} />)

        await waitFor(() => {
            expect(SpotlightTicketRowMock).not.toHaveBeenCalled()
            expect(SpotlightCustomerRowMock).not.toHaveBeenCalled()
            expect(SpotlightCallRowMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    item: voiceCall,
                }),
                {},
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

    it('should render correct message when we can search calls', () => {
        const props = {
            ...defaultProps,
            searchItemsType: ViewType.CustomerList,
            customers: [],
            hasSearched: false,
            showCallsTab: true,
        }

        const { getByText } = render(<SpotlightModalContent {...props} />)

        expect(
            getByText('Try searching for a ticket, call or customer.'),
        ).toBeInTheDocument()
    })

    it('should render correct message when we cannot search calls', () => {
        const props = {
            ...defaultProps,
            searchItemsType: ViewType.CustomerList,
            customers: [],
            hasSearched: false,
            showCallsTab: false,
        }

        const { getByText } = render(<SpotlightModalContent {...props} />)

        expect(
            getByText('Try searching for a ticket or customer.'),
        ).toBeInTheDocument()
    })

    it('should not render advanced search for voice calls tab', () => {
        const props = {
            ...defaultProps,
            searchItemsType: ViewType.CallList,
            showCallsTab: true,
            tickets: [ticketWithHighlights],
            customers: [customerWithHighlights],
        }

        const { queryByText } = render(<SpotlightModalContent {...props} />)

        expect(queryByText('Use advanced search')).toBeNull()
    })
})
