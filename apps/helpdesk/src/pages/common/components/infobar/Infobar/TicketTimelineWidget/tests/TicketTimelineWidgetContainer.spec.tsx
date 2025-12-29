import { render, screen } from '@testing-library/react'
// Import the mocked modules
import { useParams } from 'react-router-dom'

import type { CustomField, TicketCompact } from '@gorgias/helpdesk-queries'
import { useGetTicket } from '@gorgias/helpdesk-queries'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { useGetCustomer } from 'models/customer/queries'
import { useTicketList } from 'timeline/hooks/useTicketList'
import { useTimelinePanel } from 'timeline/hooks/useTimelinePanel'

import { TicketTimelineWidgetContainer } from '../TicketTimelineWidgetContainer'
import { useTicketTimelineData } from '../useTicketTimelineData'

// Mock all the hooks
jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useGetTicket: jest.fn(),
}))

jest.mock('timeline/hooks/useTicketList', () => ({
    useTicketList: jest.fn(),
}))

jest.mock('timeline/hooks/useTimelinePanel', () => ({
    useTimelinePanel: jest.fn(),
}))

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions', () => ({
    useCustomFieldDefinitions: jest.fn(),
}))

jest.mock('models/customer/queries', () => ({
    useGetCustomer: jest.fn(),
}))

jest.mock('../useTicketTimelineData', () => ({
    useTicketTimelineData: jest.fn(),
}))

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
const mockUseGetTicket = useGetTicket as jest.MockedFunction<
    typeof useGetTicket
>
const mockUseTicketList = useTicketList as jest.MockedFunction<
    typeof useTicketList
>
const mockUseTimelinePanel = useTimelinePanel as jest.MockedFunction<
    typeof useTimelinePanel
>
const mockUseCustomFieldDefinitions =
    useCustomFieldDefinitions as jest.MockedFunction<
        typeof useCustomFieldDefinitions
    >
const mockUseGetCustomer = useGetCustomer as jest.MockedFunction<
    typeof useGetCustomer
>
const mockUseTicketTimelineData = useTicketTimelineData as jest.MockedFunction<
    typeof useTicketTimelineData
>

const createMockTicket = (
    overrides: Partial<TicketCompact>,
): TicketCompact => ({
    id: 1,
    uri: 'https://example.com',
    external_id: null,
    language: 'en',
    status: 'open',
    priority: 'normal',
    channel: 'email',
    via: 'email',
    customer: {
        id: 123,
        email: 'customer@example.com',
        name: 'Test Customer',
    } as any,
    assignee_user: null,
    assignee_team: null,
    subject: 'Test Subject',
    excerpt: 'Test excerpt',
    created_datetime: '2025-01-01T00:00:00Z',
    updated_datetime: '2025-01-01T00:00:00Z',
    opened_datetime: '2025-01-01T00:00:00Z',
    last_received_message_datetime: '2025-01-01T00:00:00Z',
    last_message_datetime: '2025-01-01T00:00:00Z',
    last_sent_message_not_delivered: false,
    spam: false,
    trashed_datetime: null,
    closed_datetime: null,
    snooze_datetime: null,
    is_unread: false,
    tags: [],
    custom_fields: null,
    integrations: [],
    messages_count: 1,
    from_agent: false,
    meta: {},
    ...overrides,
})

describe('TicketTimelineWidgetContainer', () => {
    const mockOpenTimeline = jest.fn()
    const mockCloseTimeline = jest.fn()

    const defaultMockValues = {
        useParams: { ticketId: '1' },
        useGetTicket: {
            data: {
                data: {
                    id: 1,
                    customer: { id: 123, email: 'test@example.com' },
                },
            },
        } as any,
        useTicketList: { tickets: [], isLoading: false, isError: false },
        useTimelinePanel: {
            isOpen: false,
            shopperId: null,
            openTimeline: mockOpenTimeline,
            closeTimeline: mockCloseTimeline,
        },
        useCustomFieldDefinitions: {
            data: { data: [] as CustomField[] },
        } as any,
        useTicketTimelineData: {
            displayedTickets: [],
            totalNumber: 0,
            openTicketsNumber: 0,
            snoozedTicketsNumber: 0,
        },
        useGetCustomer: { data: undefined } as any,
    }

    beforeEach(() => {
        jest.clearAllMocks()

        // Set default mocks
        mockUseParams.mockReturnValue(defaultMockValues.useParams)
        mockUseGetTicket.mockReturnValue(defaultMockValues.useGetTicket)
        mockUseTicketList.mockReturnValue(defaultMockValues.useTicketList)
        mockUseTimelinePanel.mockReturnValue(defaultMockValues.useTimelinePanel)
        mockUseCustomFieldDefinitions.mockReturnValue(
            defaultMockValues.useCustomFieldDefinitions,
        )
        mockUseTicketTimelineData.mockReturnValue(
            defaultMockValues.useTicketTimelineData,
        )
        mockUseGetCustomer.mockReturnValue(defaultMockValues.useGetCustomer)
    })

    it('should render TicketTimelineWidget with loading state', () => {
        mockUseTicketList.mockReturnValue({
            tickets: [],
            isLoading: true,
            isError: false,
        })

        render(<TicketTimelineWidgetContainer />)

        expect(screen.getByText('Tickets')).toBeInTheDocument()
        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    })

    it('should render with enriched tickets data', () => {
        const mockTickets = [
            createMockTicket({ id: 1, subject: 'First Ticket' }),
            createMockTicket({ id: 2, subject: 'Second Ticket' }),
        ]

        mockUseTicketList.mockReturnValue({
            tickets: mockTickets,
            isLoading: false,
            isError: false,
        })

        mockUseTicketTimelineData.mockReturnValue({
            displayedTickets: [
                {
                    ticket: mockTickets[0],
                    iconName: 'comm-mail',
                    customFields: [],
                    conditionsLoading: false,
                    evaluationResults: {},
                },
                {
                    ticket: mockTickets[1],
                    iconName: 'comm-mail',
                    customFields: [],
                    conditionsLoading: false,
                    evaluationResults: {},
                },
            ],
            totalNumber: 2,
            openTicketsNumber: 2,
            snoozedTicketsNumber: 0,
        })

        render(<TicketTimelineWidgetContainer />)

        expect(screen.getByText('Tickets')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('2 Open')).toBeInTheDocument()
        expect(screen.getByText('First Ticket')).toBeInTheDocument()
        expect(screen.getByText('Second Ticket')).toBeInTheDocument()
    })

    it('should fetch and display customer name when totalNumber is 1', () => {
        mockUseTicketTimelineData.mockReturnValue({
            displayedTickets: [],
            totalNumber: 1,
            openTicketsNumber: 1,
            snoozedTicketsNumber: 0,
        })

        mockUseGetCustomer.mockReturnValue({
            data: {
                data: {
                    id: 123,
                    name: 'John Doe',
                    email: 'john@example.com',
                },
            },
        } as any)

        render(<TicketTimelineWidgetContainer />)

        expect(mockUseGetCustomer).toHaveBeenCalledWith(123, { enabled: true })
        expect(
            screen.getByText("This is John Doe's first ticket"),
        ).toBeInTheDocument()
    })

    it('should not fetch customer name when totalNumber is not 1', () => {
        mockUseTicketTimelineData.mockReturnValue({
            displayedTickets: [],
            totalNumber: 2,
            openTicketsNumber: 2,
            snoozedTicketsNumber: 0,
        })

        render(<TicketTimelineWidgetContainer />)

        expect(mockUseGetCustomer).toHaveBeenCalledWith(123, {
            enabled: false,
        })
        expect(screen.queryByText(/first ticket/)).not.toBeInTheDocument()
    })

    it('should use firstname when name is not available', () => {
        mockUseTicketTimelineData.mockReturnValue({
            displayedTickets: [],
            totalNumber: 1,
            openTicketsNumber: 1,
            snoozedTicketsNumber: 0,
        })

        mockUseGetCustomer.mockReturnValue({
            data: {
                data: {
                    id: 123,
                    name: '',
                    firstname: 'Jane',
                    email: 'jane@example.com',
                },
            },
        } as any)

        render(<TicketTimelineWidgetContainer />)

        expect(
            screen.getByText("This is Jane's first ticket"),
        ).toBeInTheDocument()
    })

    it('should pass custom field definitions to useTicketTimelineData', () => {
        const mockCustomFieldDefinitions = [
            {
                id: 1,
                name: 'priority',
                label: 'Priority',
                type: 'text',
            },
        ] as any as CustomField[]

        mockUseCustomFieldDefinitions.mockReturnValue({
            data: {
                data: mockCustomFieldDefinitions,
            },
        } as any)

        render(<TicketTimelineWidgetContainer />)

        expect(mockUseTicketTimelineData).toHaveBeenCalledWith(
            expect.objectContaining({
                customFieldDefinitions: mockCustomFieldDefinitions,
            }),
        )
    })

    it('should pass activeTicketId from params to useTicketTimelineData', () => {
        mockUseParams.mockReturnValue({ ticketId: '456' })

        render(<TicketTimelineWidgetContainer />)

        expect(mockUseTicketTimelineData).toHaveBeenCalledWith(
            expect.objectContaining({
                activeTicketId: '456',
            }),
        )
    })

    it('should handle empty custom field definitions', () => {
        mockUseCustomFieldDefinitions.mockReturnValue({
            data: undefined,
        } as any)

        render(<TicketTimelineWidgetContainer />)

        expect(mockUseTicketTimelineData).toHaveBeenCalledWith(
            expect.objectContaining({
                customFieldDefinitions: [],
            }),
        )
    })
})
