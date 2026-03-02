import type { ComponentProps } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { useSearchCustomer, useSearchTickets } from 'models/aiAgent/queries'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { DEFAULT_PLAYGROUND_CUSTOMER } from '../../../constants'
import { CoreProvider } from '../../contexts/CoreContext'
import { TargetSelection } from './TargetSelection'

jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    useSearchParams: jest.fn(() => [new URLSearchParams(), jest.fn()]),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/useTestSession', () => ({
    useTestSession: () => ({
        testSessionId: 'test-session-id',
        isTestSessionLoading: false,
        createTestSession: jest.fn(),
        clearTestSession: jest.fn(),
    }),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/usePlaygroundPolling', () => ({
    usePlaygroundPolling: () => ({
        testSessionLogs: undefined,
        isPolling: false,
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
    }),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/useAiAgentHttpIntegration', () => ({
    useAiAgentHttpIntegration: () => ({
        baseUrl: 'http://test.com',
    }),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/usePlaygroundChannel', () => ({
    usePlaygroundChannel: () => ({
        channel: 'email',
        channelAvailability: 'online',
        onChannelChange: jest.fn(),
        onChannelAvailabilityChange: jest.fn(),
        resetToDefaultChannel: jest.fn(),
    }),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/useDraftKnowledge', () => ({
    useDraftKnowledgeSync: jest.fn(() => ({
        isDraftKnowledgeReady: true,
    })),
}))

jest.mock('models/aiAgent/queries', () => ({
    useSearchCustomer: jest.fn(),
    useSearchTickets: jest.fn(),
}))

const mockUseSearchCustomer = jest.mocked(useSearchCustomer)
const mockUseSearchTickets = jest.mocked(useSearchTickets)

const mockOnChange = jest.fn()

const renderComponent = (
    props?: Partial<ComponentProps<typeof TargetSelection>>,
) => {
    return render(
        <QueryClientProvider client={mockQueryClient()}>
            <CoreProvider>
                <TargetSelection
                    customer={DEFAULT_PLAYGROUND_CUSTOMER}
                    onChange={mockOnChange}
                    {...props}
                />
            </CoreProvider>
        </QueryClientProvider>,
    )
}

describe('TargetSelection', () => {
    beforeEach(() => {
        mockOnChange.mockClear()

        mockUseSearchCustomer.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: {
                data: { data: [] },
            },
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useSearchCustomer>)

        mockUseSearchTickets.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: null,
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useSearchTickets>)
    })

    describe('rendering', () => {
        it('renders with Target label', () => {
            renderComponent()

            expect(screen.getByText('Target')).toBeInTheDocument()
        })

        it('renders PlaygroundCustomerSelection component', () => {
            renderComponent()

            const container = screen.getByText('Target').nextElementSibling
            expect(container).toBeInTheDocument()
            expect(
                within(container as HTMLElement).getAllByText(
                    'New customer',
                )[0],
            ).toBeInTheDocument()
        })
    })

    describe('customer selection', () => {
        it('calls onChange with customer when switching to new customer', async () => {
            const user = userEvent.setup()
            renderComponent({
                customer: {
                    ...DEFAULT_PLAYGROUND_CUSTOMER,
                    email: 'different@example.com',
                },
            })

            const selectInput = screen.getAllByDisplayValue('New customer')[0]
            await user.click(selectInput)

            const existingCustomerOption = await screen.findByRole('option', {
                name: /existing customer/i,
            })
            await user.click(existingCustomerOption)

            const selectInputAgain =
                screen.getAllByDisplayValue('Existing customer')[0]
            await user.click(selectInputAgain)

            const newCustomerOption = await screen.findByRole('option', {
                name: /new customer/i,
            })
            await user.click(newCustomerOption)

            expect(mockOnChange).toHaveBeenCalledWith({
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            })
        })
    })

    describe('sender type state', () => {
        it('initializes with NEW_CUSTOMER sender type', () => {
            renderComponent()

            expect(
                screen.getAllByDisplayValue('New customer')[0],
            ).toBeInTheDocument()
        })

        it('updates sender type when selection changes', async () => {
            const user = userEvent.setup()
            renderComponent()

            const selectInput = screen.getAllByDisplayValue('New customer')[0]
            await user.click(selectInput)

            const existingTicketOption = await screen.findByRole('option', {
                name: /existing ticket/i,
            })
            await user.click(existingTicketOption)

            expect(
                screen.getByPlaceholderText(
                    'Search by ticket id or email subject',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('default customer initialization', () => {
        it('passes DEFAULT_PLAYGROUND_CUSTOMER to PlaygroundCustomerSelection', () => {
            renderComponent()

            expect(
                screen.getAllByDisplayValue('New customer')[0],
            ).toBeInTheDocument()
        })
    })

    describe('integration with PlaygroundCustomerSelection', () => {
        it('shows ticket search when existing ticket is selected', async () => {
            const user = userEvent.setup()
            renderComponent()

            const selectInput = screen.getAllByDisplayValue('New customer')[0]
            await user.click(selectInput)

            const existingTicketOption = await screen.findByRole('option', {
                name: /existing ticket/i,
            })
            await user.click(existingTicketOption)

            expect(
                screen.getByPlaceholderText(
                    'Search by ticket id or email subject',
                ),
            ).toBeInTheDocument()
        })

        it('shows customer search when existing customer is selected', async () => {
            const user = userEvent.setup()
            renderComponent()

            const selectInput = screen.getAllByDisplayValue('New customer')[0]
            await user.click(selectInput)

            const existingCustomerOption = await screen.findByRole('option', {
                name: /existing customer/i,
            })
            await user.click(existingCustomerOption)

            expect(
                screen.getByPlaceholderText('Search customer email'),
            ).toBeInTheDocument()
        })

        it('hides conditional content when new customer is selected', async () => {
            const user = userEvent.setup()
            renderComponent()

            const selectInput = screen.getAllByDisplayValue('New customer')[0]
            await user.click(selectInput)

            const existingCustomerOption = await screen.findByRole('option', {
                name: /existing customer/i,
            })
            await user.click(existingCustomerOption)

            expect(
                screen.getByPlaceholderText('Search customer email'),
            ).toBeInTheDocument()

            const selectInputAgain =
                screen.getAllByDisplayValue('Existing customer')[0]
            await user.click(selectInputAgain)

            const newCustomerOption = await screen.findByRole('option', {
                name: /new customer/i,
            })
            await user.click(newCustomerOption)

            expect(
                screen.queryByPlaceholderText('Search customer email'),
            ).not.toBeInTheDocument()
        })
    })
})
