import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockListCustomUserAvailabilityStatusesHandler } from '@gorgias/helpdesk-mocks'

import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import AgentUnavailabilityStatuses from '../AgentStatuses'

const server = setupServer()

const mockHandler = mockListCustomUserAvailabilityStatusesHandler(
    async ({ data }) =>
        HttpResponse.json({
            ...data,
            data: [
                {
                    id: '1',
                    name: 'Lunch break',
                    duration_unit: 'minutes',
                    duration_value: 30,
                    created_datetime: '2024-01-01T00:00:00Z',
                    updated_datetime: '2024-01-01T00:00:00Z',
                },
                {
                    id: '2',
                    name: 'Meeting',
                    duration_unit: null,
                    duration_value: null,
                    created_datetime: '2024-01-02T00:00:00Z',
                    updated_datetime: '2024-01-02T00:00:00Z',
                },
            ],
        }),
)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockHandler.handler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const renderComponent = () =>
    renderWithStoreAndQueryClientAndRouter(
        <AgentUnavailabilityStatuses />,
        {},
        {
            path: '/app/settings/agent-unavailability',
            route: '/app/settings/agent-unavailability',
        },
    )

describe('AgentUnavailabilityStatuses', () => {
    describe('Page Structure', () => {
        it('should render page header with title', async () => {
            renderComponent()

            expect(
                screen.getByRole('heading', { name: /agent unavailability/i }),
            ).toBeInTheDocument()

            await waitFor(() => {
                expect(screen.getByText('Lunch break')).toBeInTheDocument()
            })
        })

        it('should render action buttons in header', async () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /Learning resources/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /Create status/i }),
            ).toBeInTheDocument()

            await waitFor(() => {
                expect(screen.getByText('Lunch break')).toBeInTheDocument()
            })
        })

        it('should render description text with link to live-agents stats', async () => {
            renderComponent()

            expect(
                screen.getByText(
                    /Create and manage agent unavailable statuses/i,
                ),
            ).toBeInTheDocument()

            const link = screen.getByRole('link', { name: /here/i })
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute('href', '/app/stats/live-agents')

            await waitFor(() => {
                expect(screen.getByText('Lunch break')).toBeInTheDocument()
            })
        })
    })

    describe('Data Loading', () => {
        it('should render loading state initially', () => {
            renderComponent()

            expect(screen.getByRole('table')).toBeInTheDocument()
        })

        it('should display custom statuses after loading', async () => {
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Lunch break')).toBeInTheDocument()
                expect(screen.getByText('Meeting')).toBeInTheDocument()
            })
        })

        it('should always display system statuses', async () => {
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Unavailable')).toBeInTheDocument()
                expect(screen.getByText('On a call')).toBeInTheDocument()
                expect(screen.getByText('Call wrap-up')).toBeInTheDocument()
            })
        })
    })

    describe('Empty State', () => {
        it('should render system statuses when no custom statuses exist', async () => {
            const mockHandlerWithEmptyData =
                mockListCustomUserAvailabilityStatusesHandler(
                    async ({ data }) =>
                        HttpResponse.json({
                            ...data,
                            data: [],
                        }),
                )

            server.use(mockHandlerWithEmptyData.handler)

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Unavailable')).toBeInTheDocument()
                expect(screen.getByText('On a call')).toBeInTheDocument()
                expect(screen.getByText('Call wrap-up')).toBeInTheDocument()
            })

            expect(screen.queryByText('Lunch break')).not.toBeInTheDocument()
            expect(screen.queryByText('Meeting')).not.toBeInTheDocument()
        })
    })

    describe('Error State', () => {
        it('should handle error state when API call fails', async () => {
            const mockHandlerWithError =
                mockListCustomUserAvailabilityStatusesHandler(async () =>
                    HttpResponse.json({} as any, { status: 500 }),
                )

            server.use(mockHandlerWithError.handler)

            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByText(/Failed to load custom statuses/i),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(/Something went wrong/i),
                ).toBeInTheDocument()
            })

            // System statuses should still be visible
            expect(screen.getByText('Unavailable')).toBeInTheDocument()
            expect(screen.getByText('On a call')).toBeInTheDocument()
            expect(screen.getByText('Call wrap-up')).toBeInTheDocument()

            // Retry button should be visible
            expect(
                screen.getByRole('button', { name: /retry/i }),
            ).toBeInTheDocument()
        })

        it('should allow retry after error', async () => {
            const mockHandlerWithError =
                mockListCustomUserAvailabilityStatusesHandler(async () =>
                    HttpResponse.json({} as any, { status: 500 }),
                )

            server.use(mockHandlerWithError.handler)

            const user = userEvent.setup()
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByText(/Failed to load custom statuses/i),
                ).toBeInTheDocument()
            })

            const refreshButton = screen.getByRole('button', {
                name: /retry/i,
            })
            expect(refreshButton).toBeInTheDocument()

            // Switch to success handler before clicking retry
            server.use(mockHandler.handler)
            await act(() => user.click(refreshButton))

            await waitFor(() => {
                expect(
                    screen.queryByText(/Failed to load custom statuses/i),
                ).not.toBeInTheDocument()
                expect(screen.getByText('Lunch break')).toBeInTheDocument()
            })
        })
    })

    describe('Table Structure', () => {
        it('should render the agent statuses table with correct structure', async () => {
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Lunch break')).toBeInTheDocument()
            })

            const table = screen.getByRole('table', {
                name: /agent availability statuses/i,
            })
            expect(table).toBeInTheDocument()

            expect(
                screen.getByRole('columnheader', { name: /status/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('columnheader', { name: /description/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('columnheader', { name: /duration/i }),
            ).toBeInTheDocument()
        })

        it('should render edit and delete buttons for all statuses', async () => {
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Lunch break')).toBeInTheDocument()
            })

            const editButtons = screen.getAllByRole('button', {
                name: /edit/i,
            })
            const deleteButtons = screen.getAllByRole('button', {
                name: /delete/i,
            })

            // 3 system statuses + 2 custom statuses = 5 total
            expect(editButtons.length).toBe(5)
            expect(deleteButtons.length).toBe(5)
        })
    })

    describe('Button States for System vs Custom Statuses', () => {
        it('should disable edit and delete buttons for system statuses', async () => {
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Unavailable')).toBeInTheDocument()
            })

            const disabledEditButton = screen.getByRole('button', {
                name: /cannot edit system status unavailable/i,
            })
            const disabledDeleteButton = screen.getByRole('button', {
                name: /cannot delete system status unavailable/i,
            })

            expect(disabledEditButton).toBeDisabled()
            expect(disabledDeleteButton).toBeDisabled()
        })

        it('should enable edit and delete buttons for custom statuses', async () => {
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Lunch break')).toBeInTheDocument()
            })

            const enabledEditButton = screen.getByRole('button', {
                name: /edit lunch break status/i,
            })
            const enabledDeleteButton = screen.getByRole('button', {
                name: /delete lunch break status/i,
            })

            expect(enabledEditButton).toBeEnabled()
            expect(enabledDeleteButton).toBeEnabled()
            expect(enabledEditButton).not.toBeDisabled()
            expect(enabledDeleteButton).not.toBeDisabled()
        })
    })

    describe('User Interactions', () => {
        it('should not crash when clicking Create status button', async () => {
            const user = userEvent.setup()
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Lunch break')).toBeInTheDocument()
            })

            const createButton = screen.getByRole('button', {
                name: /Create status/i,
            })

            await act(() => user.click(createButton))

            expect(createButton).toBeInTheDocument()
        })

        it('should not crash when clicking Learning resources button', async () => {
            const user = userEvent.setup()
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Lunch break')).toBeInTheDocument()
            })

            const learningResourcesButton = screen.getByRole('button', {
                name: /Learning resources/i,
            })

            await act(() => user.click(learningResourcesButton))

            expect(learningResourcesButton).toBeInTheDocument()
        })
    })
})
