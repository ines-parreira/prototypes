import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCreateCustomUserAvailabilityStatusHandler,
    mockDeleteCustomUserAvailabilityStatusHandler,
    mockListCustomUserAvailabilityStatusesHandler,
} from '@gorgias/helpdesk-mocks'

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

/**
 * Helper function to open the create status modal
 */
async function openCreateStatusModal() {
    const user = userEvent.setup()
    renderComponent()

    await waitFor(() => {
        expect(screen.getByText('Lunch break')).toBeInTheDocument()
    })

    const createButton = screen.getByRole('button', {
        name: /Create status/i,
    })
    await act(() => user.click(createButton))

    await waitFor(() => {
        expect(
            screen.getByRole('heading', { name: /^Create status$/i }),
        ).toBeInTheDocument()
    })

    return { user }
}

/**
 * Helper function to fill in the status name
 */
async function fillStatusName(
    user: ReturnType<typeof userEvent.setup>,
    name: string,
) {
    const nameInput = screen.getByPlaceholderText('Lunch break')
    await act(() => user.type(nameInput, name))
}

/**
 * Helper function to select a duration option from the dropdown
 */
async function selectDurationOption(optionValue: string) {
    const durationSelects = screen.getAllByTestId('hidden-select-container')
    const durationSelect = durationSelects[0].querySelector('select')

    await act(() => {
        if (durationSelect) {
            durationSelect.value = optionValue
            durationSelect.dispatchEvent(new Event('change', { bubbles: true }))
        }
    })
}

/**
 * Helper function to fill in custom duration fields
 */
async function fillCustomDuration(
    user: ReturnType<typeof userEvent.setup>,
    value: string,
    unit: string,
) {
    // Wait for custom duration value field to appear (has hidden "Amount" label)
    const customValueInput = await screen.findByLabelText('Amount')
    await act(() => user.clear(customValueInput))
    await act(() => user.type(customValueInput, value))

    // Select the unit - use data-testid since Axiom's Select has complex internal structure
    // The unit select is the second select container when custom duration is visible
    const unitSelects = screen.getAllByTestId('hidden-select-container')
    const unitSelect = unitSelects[1]?.querySelector('select')
    if (unitSelect) {
        await act(() => {
            unitSelect.value = unit
            unitSelect.dispatchEvent(new Event('change', { bubbles: true }))
        })
    }
}

/**
 * Helper function to submit the create status form
 */
async function submitCreateStatusForm(
    user: ReturnType<typeof userEvent.setup>,
) {
    const createStatusButton = screen.getByRole('button', {
        name: /^Create status$/i,
    })
    await act(() => user.click(createStatusButton))
}

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

    it('should open modal when Create status button is clicked', async () => {
        renderComponent()

        const createButton = screen.getByRole('button', {
            name: /Create status/i,
        })
        await act(() => userEvent.click(createButton))

        // Modal should be visible - check for modal heading
        await waitFor(() => {
            expect(
                screen.getByRole('heading', { name: /^Create status$/i }),
            ).toBeInTheDocument()
        })
    })

    it('should close modal when Cancel is clicked', async () => {
        renderComponent()

        // Open modal
        const createButton = screen.getByRole('button', {
            name: /Create status/i,
        })
        await act(() => userEvent.click(createButton))

        // Wait for modal to open - check for modal heading
        await waitFor(() => {
            expect(
                screen.getByRole('heading', { name: /^Create status$/i }),
            ).toBeInTheDocument()
        })

        // Close modal
        const cancelButton = screen.getAllByRole('button', {
            name: /Cancel/i,
        })[0]
        await act(() => userEvent.click(cancelButton))

        // Modal should be closed - heading should not be visible
        await waitFor(() => {
            expect(
                screen.queryByRole('heading', { name: /^Create status$/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('Delete Functionality', () => {
        it('should open delete modal when delete button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Lunch break')).toBeInTheDocument()
            })

            const deleteButton = screen.getByRole('button', {
                name: /delete lunch break status/i,
            })

            await act(() => user.click(deleteButton))

            await waitFor(() => {
                expect(screen.getByText('Delete status?')).toBeInTheDocument()
            })

            expect(
                screen.getByText(/You are about to delete/),
            ).toBeInTheDocument()

            const modal = screen.getByRole('dialog')
            expect(modal).toHaveTextContent('Lunch break')
        })

        it('should close delete modal when Cancel is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Lunch break')).toBeInTheDocument()
            })

            const deleteButton = screen.getByRole('button', {
                name: /delete lunch break status/i,
            })
            await act(() => user.click(deleteButton))

            await waitFor(() => {
                expect(screen.getByText('Delete status?')).toBeInTheDocument()
            })

            const cancelButton = screen.getByRole('button', {
                name: /^Cancel$/i,
            })
            await act(() => user.click(cancelButton))

            await waitFor(() => {
                expect(
                    screen.queryByText('Delete status?'),
                ).not.toBeInTheDocument()
            })
        })

        it('should not open delete modal for system statuses', async () => {
            const user = userEvent.setup()
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Unavailable')).toBeInTheDocument()
            })

            const deleteButton = screen.getByRole('button', {
                name: /cannot delete system status unavailable/i,
            })

            expect(deleteButton).toBeDisabled()

            await act(() => user.click(deleteButton))

            expect(screen.queryByText('Delete status?')).not.toBeInTheDocument()
        })

        it('should display correct status name in modal for different statuses', async () => {
            const user = userEvent.setup()
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Meeting')).toBeInTheDocument()
            })

            const deleteButton = screen.getByRole('button', {
                name: /delete meeting status/i,
            })

            await act(() => user.click(deleteButton))

            await waitFor(() => {
                expect(screen.getByText('Delete status?')).toBeInTheDocument()
            })

            expect(
                screen.getByText(/You are about to delete/),
            ).toBeInTheDocument()

            const modal = screen.getByRole('dialog')
            expect(modal).toBeInTheDocument()
            expect(modal).toHaveTextContent('Meeting')
        })

        it('should keep modal open and statuses visible after opening', async () => {
            const user = userEvent.setup()
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Lunch break')).toBeInTheDocument()
            })

            const deleteButton = screen.getByRole('button', {
                name: /delete lunch break status/i,
            })

            await act(() => user.click(deleteButton))

            await waitFor(() => {
                expect(screen.getByText('Delete status?')).toBeInTheDocument()
            })

            expect(screen.getByText('Unavailable')).toBeInTheDocument()
            expect(screen.getByText('On a call')).toBeInTheDocument()
            expect(screen.getByText('Call wrap-up')).toBeInTheDocument()
        })

        it('should delete status and update list on confirmation', async () => {
            const mockDeleteHandler =
                mockDeleteCustomUserAvailabilityStatusHandler()

            const mockUpdatedListHandler =
                mockListCustomUserAvailabilityStatusesHandler(
                    async ({ data }) =>
                        HttpResponse.json({
                            ...data,
                            data: [
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

            server.use(mockDeleteHandler.handler)

            const user = userEvent.setup()
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Lunch break')).toBeInTheDocument()
            })

            const deleteButton = screen.getByRole('button', {
                name: /delete lunch break status/i,
            })

            await act(() => user.click(deleteButton))

            await waitFor(() => {
                expect(screen.getByText('Delete status?')).toBeInTheDocument()
            })

            server.use(mockUpdatedListHandler.handler)

            const confirmDeleteButton = screen.getByRole('button', {
                name: /Delete status/i,
            })

            await act(() => user.click(confirmDeleteButton))

            await waitFor(() => {
                expect(
                    screen.queryByText('Delete status?'),
                ).not.toBeInTheDocument()
            })

            await waitFor(() => {
                expect(
                    screen.queryByText('Lunch break'),
                ).not.toBeInTheDocument()
            })

            expect(screen.getByText('Meeting')).toBeInTheDocument()
        })

        it('should show error notification when delete fails', async () => {
            const mockDeleteHandler =
                mockDeleteCustomUserAvailabilityStatusHandler(async () =>
                    HttpResponse.json(
                        { error: { msg: 'Delete failed' } } as unknown as null,
                        { status: 500 },
                    ),
                )
            server.use(mockDeleteHandler.handler)

            const user = userEvent.setup()
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getAllByText('Lunch break').length,
                ).toBeGreaterThan(0)
            })

            const deleteButton = screen.getByRole('button', {
                name: /delete lunch break status/i,
            })

            await act(() => user.click(deleteButton))

            await waitFor(() => {
                expect(screen.getByText('Delete status?')).toBeInTheDocument()
            })

            const confirmDeleteButton = screen.getByRole('button', {
                name: /Delete status/i,
            })

            await act(() => user.click(confirmDeleteButton))

            await waitFor(() => {
                expect(
                    screen.getAllByText('Lunch break').length,
                ).toBeGreaterThan(0)
            })

            expect(screen.getByText('Delete status?')).toBeInTheDocument()
        })
    })

    describe('Create Status', () => {
        it('should create a status with unlimited duration', async () => {
            const mockCreateStatus =
                mockCreateCustomUserAvailabilityStatusHandler()
            const waitForCreateRequest = mockCreateStatus.waitForRequest(server)
            server.use(mockCreateStatus.handler)

            const { user } = await openCreateStatusModal()
            await fillStatusName(user, 'Team meeting')
            await submitCreateStatusForm(user)

            await waitForCreateRequest(async (request) => {
                const body = await request.json()
                expect(body.name).toBe('Team meeting')
                expect(body.duration_unit).toBeNull()
                expect(body.duration_value).toBeNull()
            })
        })

        it('should create a status with 30 minutes duration', async () => {
            const mockCreateStatus =
                mockCreateCustomUserAvailabilityStatusHandler()
            const waitForCreateRequest = mockCreateStatus.waitForRequest(server)
            server.use(mockCreateStatus.handler)

            const { user } = await openCreateStatusModal()
            await fillStatusName(user, 'Lunch')
            await selectDurationOption('30-minutes')
            await submitCreateStatusForm(user)

            await waitForCreateRequest(async (request) => {
                const body = await request.json()
                expect(body.name).toBe('Lunch')
                expect(body.duration_unit).toBe('minutes')
                expect(body.duration_value).toBe(30)
            })
        })

        it('should create a status with 1 hour duration', async () => {
            const mockCreateStatus =
                mockCreateCustomUserAvailabilityStatusHandler()
            const waitForCreateRequest = mockCreateStatus.waitForRequest(server)
            server.use(mockCreateStatus.handler)

            const { user } = await openCreateStatusModal()
            await fillStatusName(user, 'Training')
            await selectDurationOption('1-hour')
            await submitCreateStatusForm(user)

            await waitForCreateRequest(async (request) => {
                const body = await request.json()
                expect(body.name).toBe('Training')
                expect(body.duration_unit).toBe('hours')
                expect(body.duration_value).toBe(1)
            })
        })

        it('should create a status with 4 hours duration', async () => {
            const mockCreateStatus =
                mockCreateCustomUserAvailabilityStatusHandler()
            const waitForCreateRequest = mockCreateStatus.waitForRequest(server)
            server.use(mockCreateStatus.handler)

            const { user } = await openCreateStatusModal()
            await fillStatusName(user, 'Workshop')
            await selectDurationOption('4-hours')
            await submitCreateStatusForm(user)

            await waitForCreateRequest(async (request) => {
                const body = await request.json()
                expect(body.name).toBe('Workshop')
                expect(body.duration_unit).toBe('hours')
                expect(body.duration_value).toBe(4)
            })
        })

        it('should create a status with 15 minutes preset duration', async () => {
            const mockCreateStatus =
                mockCreateCustomUserAvailabilityStatusHandler()
            const waitForCreateRequest = mockCreateStatus.waitForRequest(server)
            server.use(mockCreateStatus.handler)

            const { user } = await openCreateStatusModal()
            await fillStatusName(user, 'Quick break')
            await selectDurationOption('15-minutes')
            await submitCreateStatusForm(user)

            await waitForCreateRequest(async (request) => {
                const body = await request.json()
                expect(body.name).toBe('Quick break')
                expect(body.duration_unit).toBe('minutes')
                expect(body.duration_value).toBe(15)
            })
        })
    })

    describe('Create Status with Custom Duration', () => {
        it('should create a status with custom duration in minutes', async () => {
            const mockCreateStatus =
                mockCreateCustomUserAvailabilityStatusHandler()
            const waitForCreateRequest = mockCreateStatus.waitForRequest(server)
            server.use(mockCreateStatus.handler)

            const { user } = await openCreateStatusModal()
            await fillStatusName(user, 'Coffee break')
            await selectDurationOption('custom')
            await fillCustomDuration(user, '15', 'minutes')
            await submitCreateStatusForm(user)

            await waitForCreateRequest(async (request) => {
                const body = await request.json()
                expect(body.name).toBe('Coffee break')
                expect(body.duration_unit).toBe('minutes')
                expect(body.duration_value).toBe(15)
            })
        })

        it('should create a status with custom duration in hours', async () => {
            const mockCreateStatus =
                mockCreateCustomUserAvailabilityStatusHandler()
            const waitForCreateRequest = mockCreateStatus.waitForRequest(server)
            server.use(mockCreateStatus.handler)

            const { user } = await openCreateStatusModal()
            await fillStatusName(user, 'Extended break')
            await selectDurationOption('custom')
            await fillCustomDuration(user, '2', 'hours')
            await submitCreateStatusForm(user)

            await waitForCreateRequest(async (request) => {
                const body = await request.json()
                expect(body.name).toBe('Extended break')
                expect(body.duration_unit).toBe('hours')
                expect(body.duration_value).toBe(2)
            })
        })
    })
})
