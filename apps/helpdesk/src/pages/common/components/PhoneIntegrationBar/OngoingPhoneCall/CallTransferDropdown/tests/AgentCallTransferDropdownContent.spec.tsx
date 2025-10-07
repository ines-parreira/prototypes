import { createRef } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
    act,
    cleanup,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'

import { mockListUsersHandler } from '@gorgias/helpdesk-mocks'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import AgentCallTransferDropdownContent from 'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/CallTransferDropdown/AgentCallTransferDropdownContent'
import {
    getAvailabilityBadgeColor,
    getAvailabilityStatus,
    mergeAgentData,
} from 'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/utils'
import { mockStore } from 'utils/testing'

jest.mock('pages/common/utils/labels', () => ({
    AgentLabel: ({
        name,
        badgeColor,
        status,
    }: {
        name: string
        badgeColor?: string
        status?: string
    }) => (
        <div>
            {name}
            <div data-testid="badge">{badgeColor}</div>
            <div data-testid="status">{status}</div>
        </div>
    ),
}))
jest.mock('pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/utils')

const mockGetAvailabilityBadgeColor = getAvailabilityBadgeColor as jest.Mock
const mockGetAvailabilityStatus = getAvailabilityStatus as jest.Mock
const mockMergeAgentData = mergeAgentData as jest.Mock

const server = setupServer()
const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})

describe('AgentCallTransferDropdownContent', () => {
    const setSelectedAgentId = jest.fn()
    const clearErrors = jest.fn()
    const mockListUsers = mockListUsersHandler()

    const allAgents = [
        { id: 1, name: 'Agent 1', status: 'online' },
        { id: 2, name: 'Agent 2', status: 'online' },
        { id: 3, name: 'Agent 3', status: 'online' },
        { id: 4, name: 'Agent 4', status: 'online' },
    ]

    const TestAgentCallTransferDropdownContent = (
        props: Partial<
            React.ComponentProps<typeof AgentCallTransferDropdownContent>
        > = {},
    ) => (
        <Provider
            store={mockStore({
                agents: fromJS({
                    all: allAgents,
                }),
                currentUser: fromJS({
                    id: 2,
                }),
            } as any)}
        >
            <QueryClientProvider client={queryClient}>
                <Dropdown
                    isOpen={true}
                    onToggle={() => {}}
                    target={createRef<HTMLElement>()}
                >
                    <AgentCallTransferDropdownContent
                        setSelectedAgentId={setSelectedAgentId}
                        clearErrors={clearErrors}
                        {...props}
                    />
                </Dropdown>
            </QueryClientProvider>
        </Provider>
    )

    const renderComponent = (props = {}) =>
        render(<TestAgentCallTransferDropdownContent {...props} />)

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(mockListUsers.handler)
        mockMergeAgentData.mockReturnValue(allAgents)
        jest.clearAllMocks()
    })

    afterEach(() => {
        server.resetHandlers()
        queryClient.clear()
        cleanup()
    })

    afterAll(() => {
        server.close()
    })

    it('shows agent list when active', async () => {
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Available (4)')).toBeInTheDocument()
        })
    })

    it("filters out current agent and doesn't display them", async () => {
        renderComponent()

        await waitFor(() => {
            expect(mockMergeAgentData).toHaveBeenCalledWith(
                allAgents.filter((agent) => agent.id !== 2),
                mockListUsers.data.data,
            )
        })
    })

    it('renders agents with correct availability status badges', () => {
        mockGetAvailabilityBadgeColor.mockImplementation(
            (status: string) => status,
        )
        mockGetAvailabilityStatus.mockImplementation((status: string) => status)
        mockMergeAgentData.mockReturnValue([
            {
                id: 1,
                name: 'Agent 1',
                status: 'online',
            },
        ])

        renderComponent()

        const agent1 = screen.getByText('Agent 1')
        expect(agent1).toBeInTheDocument()
        expect(within(agent1).getByTestId('badge')).toHaveTextContent('online')
        expect(within(agent1).getByTestId('status')).toHaveTextContent('online')
    })

    it('displays Available and Unavailable sections with correct counts', () => {
        mockMergeAgentData.mockReturnValue([
            { id: 1, name: 'Agent 1', status: 'online' },
            { id: 2, name: 'Agent 2', status: 'online' },
            { id: 3, name: 'Agent 3', status: 'online' },
            { id: 4, name: 'Agent 4', status: 'offline' },
        ])
        renderComponent()

        expect(screen.getByText('Available (3)')).toBeInTheDocument()
        expect(screen.getByText('Unavailable (1)')).toBeInTheDocument()
    })

    it('sections always render even when empty', () => {
        mockMergeAgentData.mockReturnValue([
            { id: 1, name: 'Agent 1', status: 'online' },
        ])
        renderComponent()

        expect(screen.getByText('Available (1)')).toBeInTheDocument()
        expect(screen.getByText('Unavailable (0)')).toBeInTheDocument()
    })

    it('disables agents in unavailable section', () => {
        mockMergeAgentData.mockReturnValue([
            { id: 1, name: 'Agent 1', status: 'online' },
            { id: 4, name: 'Agent 4', status: 'offline' },
        ])
        renderComponent()

        const availableAgent = screen.getByRole('option', {
            name: /agent 1/i,
        })
        const unavailableAgent = screen.getByRole('option', {
            name: /agent 4/i,
        })

        expect(availableAgent.className).not.toContain('disabled')
        expect(unavailableAgent.className).toContain('disabled')
    })

    it('calls setSelectedAgentId when agent is selected', async () => {
        const user = userEvent.setup()
        renderComponent()

        const agent1 = screen.getByRole('option', {
            name: /agent 1/i,
        })
        await act(() => user.click(agent1))

        expect(setSelectedAgentId).toHaveBeenCalledWith(1)
    })

    it('passes all query parameters to list users request', async () => {
        const waitForListUsersRequest = mockListUsers.waitForRequest(server)

        renderComponent({ showNewVersion: true })

        await waitForListUsersRequest(async (request) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('limit')).toBe('100')
            expect(url.searchParams.get('relationships')).toBe(
                'availability_status',
            )
            expect(url.searchParams.get('available_first')).toBe('true')
        })
    })

    it('clears errors when clicking on dropdown body', async () => {
        const user = userEvent.setup()
        renderComponent()

        const agent1 = screen.getByRole('option', {
            name: /agent 1/i,
        })
        await act(() => user.click(agent1))

        expect(clearErrors).toHaveBeenCalled()
    })
})
