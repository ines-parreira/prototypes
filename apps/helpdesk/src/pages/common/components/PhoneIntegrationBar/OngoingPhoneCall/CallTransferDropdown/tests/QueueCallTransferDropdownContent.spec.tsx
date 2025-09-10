import { createRef } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListVoiceQueuesHandler,
    mockVoiceQueue,
} from '@gorgias/helpdesk-mocks'
import { ListVoiceQueues200, VoiceQueueStatus } from '@gorgias/helpdesk-queries'

import Dropdown from 'pages/common/components/dropdown/Dropdown'

import QueueCallTransferDropdownContent from '../QueueCallTransferDropdownContent'

const server = setupServer()
const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})

describe('QueueCallTransferDropdownContent', () => {
    const setSelectedQueueId = jest.fn()
    const clearErrors = jest.fn()

    const enabledQueue1 = mockVoiceQueue({
        id: 1,
        name: 'Sales Queue',
        status: VoiceQueueStatus.Enabled,
        is_full: false,
        capacity: 10,
        queued_calls_count: 0,
    })

    const enabledQueue2 = mockVoiceQueue({
        id: 2,
        name: 'Support Queue',
        status: VoiceQueueStatus.Enabled,
        is_full: false,
        capacity: 5,
        queued_calls_count: 0,
    })

    const disabledQueue = mockVoiceQueue({
        id: 3,
        name: 'Disabled Queue',
        status: VoiceQueueStatus.Disabled,
        is_full: false,
        capacity: 10,
        queued_calls_count: 0,
    })

    const fullQueue = mockVoiceQueue({
        id: 4,
        name: 'Full Queue',
        status: VoiceQueueStatus.Enabled,
        is_full: true,
        capacity: 3,
        queued_calls_count: 3,
    })

    const mockListVoiceQueues = mockListVoiceQueuesHandler(async () =>
        HttpResponse.json({
            data: [enabledQueue1, enabledQueue2, disabledQueue, fullQueue],
        } as unknown as ListVoiceQueues200),
    )

    const TestQueueCallTransferDropdownContent = (
        props: Partial<
            React.ComponentProps<typeof QueueCallTransferDropdownContent>
        > = {},
    ) => (
        <QueryClientProvider client={queryClient}>
            <Dropdown
                isOpen={true}
                onToggle={() => {}}
                target={createRef<HTMLElement>()}
            >
                <QueueCallTransferDropdownContent
                    setSelectedQueueId={setSelectedQueueId}
                    clearErrors={clearErrors}
                    {...props}
                />
            </Dropdown>
        </QueryClientProvider>
    )

    const renderComponent = (props = {}) =>
        render(<TestQueueCallTransferDropdownContent {...props} />)

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
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

    describe('Loading state', () => {
        it('shows skeleton when loading queues', () => {
            server.use(mockListVoiceQueues.handler)
            renderComponent()

            const skeletons = document.querySelectorAll('[class*="Skeleton"]')
            expect(skeletons.length).toBeGreaterThan(0)
        })
    })

    describe('Queue sections', () => {
        it('displays available and unavailable sections with correct counts', async () => {
            server.use(mockListVoiceQueues.handler)
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Available (2)')).toBeInTheDocument()
                expect(screen.getByText('Unavailable (2)')).toBeInTheDocument()
            })
        })

        it('shows queues in correct sections based on availability', async () => {
            server.use(mockListVoiceQueues.handler)
            renderComponent()

            await waitFor(() => {
                const availableSection =
                    screen.getByText('Available (2)').parentElement
                const unavailableSection =
                    screen.getByText('Unavailable (2)').parentElement

                expect(availableSection).toHaveTextContent('Sales Queue')
                expect(availableSection).toHaveTextContent('Support Queue')

                expect(unavailableSection).toHaveTextContent('Disabled Queue')
                expect(unavailableSection).toHaveTextContent('Full Queue')
            })
        })

        it('sections always render even when empty', async () => {
            server.use(
                http.get('*/integrations/phone/voice-queues', () => {
                    return HttpResponse.json({
                        data: [],
                        meta: {
                            current_page: 1,
                            next_page: null,
                            prev_page: null,
                            total_pages: 1,
                            total_count: 0,
                        },
                    })
                }),
            )

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Available (0)')).toBeInTheDocument()
                expect(screen.getByText('Unavailable (0)')).toBeInTheDocument()
            })
        })
    })

    describe('Queue status labels', () => {
        it('shows "Disabled" for disabled queues', async () => {
            server.use(mockListVoiceQueues.handler)
            renderComponent()

            await waitFor(() => {
                const disabledQueueItem = screen
                    .getByText('Disabled Queue')
                    .closest('li')
                expect(disabledQueueItem).toHaveTextContent('Disabled')
            })
        })

        it('shows "Capacity reached" for full queues', async () => {
            server.use(mockListVoiceQueues.handler)
            renderComponent()

            await waitFor(() => {
                const fullQueueItem = screen
                    .getByText('Full Queue')
                    .closest('li')
                expect(fullQueueItem).toHaveTextContent('Capacity reached')
            })
        })

        it('shows call count and capacity for available queues', async () => {
            server.use(mockListVoiceQueues.handler)
            renderComponent()

            await waitFor(() => {
                const salesQueueItem = screen
                    .getByText('Sales Queue')
                    .closest('li')
                expect(salesQueueItem).toHaveTextContent('0 / 10 calls')

                const supportQueueItem = screen
                    .getByText('Support Queue')
                    .closest('li')
                expect(supportQueueItem).toHaveTextContent('0 / 5 calls')
            })
        })
    })

    describe('Queue selection', () => {
        it('calls setSelectedQueueId when available queue is selected', async () => {
            const user = userEvent.setup()
            server.use(mockListVoiceQueues.handler)
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Sales Queue')).toBeInTheDocument()
            })

            const salesQueue = screen.getByRole('option', {
                name: /Sales Queue/i,
            })
            await act(() => user.click(salesQueue))

            expect(setSelectedQueueId).toHaveBeenCalledWith(1)
        })

        it('does not call setSelectedQueueId when disabled queue is clicked', async () => {
            const user = userEvent.setup()
            server.use(mockListVoiceQueues.handler)
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Disabled Queue')).toBeInTheDocument()
            })

            const disabledQueue = screen.getByRole('option', {
                name: /Disabled Queue/i,
            })
            await act(() => user.click(disabledQueue))

            expect(setSelectedQueueId).not.toHaveBeenCalled()
        })

        it('does not call setSelectedQueueId when full queue is clicked', async () => {
            const user = userEvent.setup()
            server.use(mockListVoiceQueues.handler)
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Full Queue')).toBeInTheDocument()
            })

            const fullQueue = screen.getByRole('option', {
                name: /Full Queue/i,
            })
            await act(() => user.click(fullQueue))

            expect(setSelectedQueueId).not.toHaveBeenCalled()
        })

        it('disables unavailable queues visually', async () => {
            server.use(mockListVoiceQueues.handler)
            renderComponent()

            await waitFor(() => {
                const availableQueue = screen.getByRole('option', {
                    name: /Sales Queue/i,
                })
                const unavailableQueue = screen.getByRole('option', {
                    name: /Disabled Queue/i,
                })

                expect(availableQueue.className).not.toContain('disabled')
                expect(unavailableQueue.className).toContain('disabled')
            })
        })
    })

    it('clears errors when clicking on dropdown body', async () => {
        const user = userEvent.setup()
        server.use(mockListVoiceQueues.handler)
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Sales Queue')).toBeInTheDocument()
        })

        const dropdownBody = screen
            .getByText('Sales Queue')
            .closest('[class*="dropdownBody"]')

        if (dropdownBody) {
            await act(() => user.click(dropdownBody))
            expect(clearErrors).toHaveBeenCalled()
        }
    })

    it('renders search component', async () => {
        server.use(mockListVoiceQueues.handler)
        renderComponent()

        await waitFor(() => {
            const searchInput = screen.getByRole('textbox')
            expect(searchInput).toBeInTheDocument()
        })
    })

    it('passes correct limit parameter to list voice queues request', async () => {
        const waitForListVoiceQueuesRequest =
            mockListVoiceQueues.waitForRequest(server)

        server.use(mockListVoiceQueues.handler)
        renderComponent()

        await waitForListVoiceQueuesRequest(async (request) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('limit')).toBe('100')
            expect(url.searchParams.get('with_availability_info')).toBe('true')
        })
    })
})
