import { AgentStatusLegacyBridgeProvider } from '@repo/agent-status'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCreateCustomUserAvailabilityStatusHandler,
    mockDeleteCustomUserAvailabilityStatusHandler,
    mockListCustomUserAvailabilityStatusesHandler,
    mockUpdateCustomUserAvailabilityStatusHandler,
} from '@gorgias/helpdesk-mocks'

import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import AgentUnavailabilityStatuses from '../AgentStatuses'

const server = setupServer()

const mockListHandler = mockListCustomUserAvailabilityStatusesHandler(
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
            ],
        }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => {
    server.use(mockListHandler.handler)
    jest.clearAllMocks()
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const mockDispatchNotification = jest.fn()

const renderComponent = () =>
    renderWithStoreAndQueryClientAndRouter(
        <AgentStatusLegacyBridgeProvider
            dispatchNotification={mockDispatchNotification}
        >
            <AgentUnavailabilityStatuses />
        </AgentStatusLegacyBridgeProvider>,
        {},
        {
            path: '/app/settings/agent-unavailability',
            route: '/app/settings/agent-unavailability',
        },
    )

async function openCreateModal() {
    const user = userEvent.setup()
    renderComponent()

    await waitFor(() =>
        expect(screen.getByText('Lunch break')).toBeInTheDocument(),
    )

    await act(() =>
        user.click(screen.getByRole('button', { name: /Create status/i })),
    )

    await waitFor(() =>
        expect(
            screen.getByRole('heading', { name: /^Create status$/i }),
        ).toBeInTheDocument(),
    )

    return user
}

async function openEditModal(statusName: string) {
    const user = userEvent.setup()
    renderComponent()

    await waitFor(() =>
        expect(screen.getByText(statusName)).toBeInTheDocument(),
    )

    await act(() =>
        user.click(
            screen.getByRole('button', {
                name: new RegExp(`edit ${statusName} status`, 'i'),
            }),
        ),
    )

    await waitFor(() =>
        expect(
            screen.getByRole('heading', { name: /^Edit status$/i }),
        ).toBeInTheDocument(),
    )

    return user
}

async function fillForm(
    user: ReturnType<typeof userEvent.setup>,
    options: {
        name?: string
        duration?: { option: string; customValue?: string; customUnit?: string }
    },
) {
    if (options.name) {
        const nameInput = screen.getByPlaceholderText('Lunch break')
        await act(() => user.type(nameInput, options.name || ''))
    }

    if (options.duration) {
        const selects = screen.getAllByTestId('hidden-select-container')
        const durationSelect = selects[0]?.querySelector('select')
        if (durationSelect) {
            await act(() => {
                durationSelect.value = options.duration!.option
                durationSelect.dispatchEvent(
                    new Event('change', { bubbles: true }),
                )
            })
        }

        if (
            options.duration.option === 'custom' &&
            options.duration.customValue &&
            options.duration.customUnit
        ) {
            const valueInput = await screen.findByLabelText('Amount')
            await act(() => user.clear(valueInput))
            await act(() =>
                user.type(valueInput, options.duration!.customValue as string),
            )

            // Wait for the unit select to appear
            await waitFor(() => {
                const containers = screen.getAllByTestId(
                    'hidden-select-container',
                )
                expect(containers.length).toBeGreaterThan(1)
            })

            const updatedSelects = screen.getAllByTestId(
                'hidden-select-container',
            )
            const unitSelect = updatedSelects[1]?.querySelector('select')
            if (unitSelect) {
                await act(() => {
                    unitSelect.value = options.duration!.customUnit as string
                    unitSelect.dispatchEvent(
                        new Event('change', { bubbles: true }),
                    )
                })
            }
        }
    }
}

async function submitForm(
    user: ReturnType<typeof userEvent.setup>,
    buttonName: RegExp,
) {
    await act(() =>
        user.click(screen.getByRole('button', { name: buttonName })),
    )
}

describe('AgentUnavailabilityStatuses', () => {
    describe('Create Status', () => {
        it('should create status with unlimited duration', async () => {
            const mockCreate = mockCreateCustomUserAvailabilityStatusHandler()
            const waitForRequest = mockCreate.waitForRequest(server)
            server.use(mockCreate.handler)

            const user = await openCreateModal()
            await fillForm(user, { name: 'Meeting' })
            await submitForm(user, /^Create status$/i)

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body.name).toBe('Meeting')
                expect(body.duration_unit).toBeNull()
                expect(body.duration_value).toBeNull()
            })
        })

        it('should create status with preset duration', async () => {
            const mockCreate = mockCreateCustomUserAvailabilityStatusHandler()
            const waitForRequest = mockCreate.waitForRequest(server)
            server.use(mockCreate.handler)

            const user = await openCreateModal()
            await fillForm(user, {
                name: 'Lunch',
                duration: { option: '30-minutes' },
            })
            await submitForm(user, /^Create status$/i)

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body.name).toBe('Lunch')
                expect(body.duration_unit).toBe('minutes')
                expect(body.duration_value).toBe(30)
            })
        })

        it('should create status with custom duration', async () => {
            const mockCreate = mockCreateCustomUserAvailabilityStatusHandler()
            const waitForRequest = mockCreate.waitForRequest(server)
            server.use(mockCreate.handler)

            const user = await openCreateModal()
            await fillForm(user, {
                name: 'Break',
                duration: {
                    option: 'custom',
                    customValue: '15',
                    customUnit: 'minutes',
                },
            })
            await submitForm(user, /^Create status$/i)

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body.name).toBe('Break')
                expect(body.duration_unit).toBe('minutes')
                expect(body.duration_value).toBe(15)
            })
        })
    })

    describe('Update Status', () => {
        it('should update status name and duration', async () => {
            const mockUpdate = mockUpdateCustomUserAvailabilityStatusHandler()
            const waitForRequest = mockUpdate.waitForRequest(server)
            server.use(mockUpdate.handler)

            const user = await openEditModal('Lunch break')

            const nameInput = screen.getByPlaceholderText('Lunch break')
            await act(() => user.clear(nameInput))
            await act(() => user.type(nameInput, 'Updated lunch'))
            await submitForm(user, /Save changes/i)

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body.name).toBe('Updated lunch')
                expect(body.duration_unit).toBe('minutes')
                expect(body.duration_value).toBe(30)
            })
        })

        it('should update status to unlimited duration', async () => {
            const mockUpdate = mockUpdateCustomUserAvailabilityStatusHandler()
            const waitForRequest = mockUpdate.waitForRequest(server)
            server.use(mockUpdate.handler)

            const user = await openEditModal('Lunch break')
            await fillForm(user, { duration: { option: 'unlimited' } })
            await submitForm(user, /Save changes/i)

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body.duration_unit).toBeNull()
                expect(body.duration_value).toBeNull()
            })
        })

        it('should update status to custom duration', async () => {
            const mockUpdate = mockUpdateCustomUserAvailabilityStatusHandler()
            const waitForRequest = mockUpdate.waitForRequest(server)
            server.use(mockUpdate.handler)

            const user = await openEditModal('Lunch break')
            await fillForm(user, {
                duration: {
                    option: 'custom',
                    customValue: '45',
                    customUnit: 'minutes',
                },
            })
            await submitForm(user, /Save changes/i)

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body.duration_unit).toBe('minutes')
                expect(body.duration_value).toBe(45)
            })
        })

        it('should keep modal open when update fails', async () => {
            const mockUpdate = mockUpdateCustomUserAvailabilityStatusHandler(
                async () =>
                    HttpResponse.json(
                        { error: { msg: 'Update failed' } } as unknown as null,
                        { status: 500 },
                    ),
            )
            server.use(mockUpdate.handler)

            const user = await openEditModal('Lunch break')
            await fillForm(user, { name: ' updated' })
            await submitForm(user, /Save changes/i)

            await waitFor(() =>
                expect(
                    screen.getByRole('heading', { name: /^Edit status$/i }),
                ).toBeInTheDocument(),
            )
        })
    })

    describe('Delete Status', () => {
        it('should delete status and update list', async () => {
            const mockDelete = mockDeleteCustomUserAvailabilityStatusHandler()
            const mockUpdatedList =
                mockListCustomUserAvailabilityStatusesHandler(
                    async ({ data }) =>
                        HttpResponse.json({ ...data, data: [] }),
                )

            server.use(mockDelete.handler)

            const user = userEvent.setup()
            renderComponent()

            await waitFor(() =>
                expect(screen.getByText('Lunch break')).toBeInTheDocument(),
            )

            await act(() =>
                user.click(
                    screen.getByRole('button', {
                        name: /delete lunch break status/i,
                    }),
                ),
            )

            await waitFor(() =>
                expect(screen.getByText('Delete status?')).toBeInTheDocument(),
            )

            server.use(mockUpdatedList.handler)

            await act(() =>
                user.click(
                    screen.getByRole('button', { name: /Delete status/i }),
                ),
            )

            await waitFor(() =>
                expect(
                    screen.queryByText('Lunch break'),
                ).not.toBeInTheDocument(),
            )
        })

        it('should keep modal open when delete fails', async () => {
            const mockDelete = mockDeleteCustomUserAvailabilityStatusHandler(
                async () =>
                    HttpResponse.json(
                        { error: { msg: 'Delete failed' } } as unknown as null,
                        { status: 500 },
                    ),
            )
            server.use(mockDelete.handler)

            const user = userEvent.setup()
            renderComponent()

            await waitFor(() =>
                expect(screen.getByText('Lunch break')).toBeInTheDocument(),
            )

            await act(() =>
                user.click(
                    screen.getByRole('button', {
                        name: /delete lunch break status/i,
                    }),
                ),
            )

            await waitFor(() =>
                expect(screen.getByText('Delete status?')).toBeInTheDocument(),
            )

            await act(() =>
                user.click(
                    screen.getByRole('button', { name: /Delete status/i }),
                ),
            )

            await waitFor(() =>
                expect(screen.getByText('Delete status?')).toBeInTheDocument(),
            )
        })
    })

    describe('Error Handling', () => {
        it('should show error banner with retry button when list fails to load', async () => {
            const mockError = mockListCustomUserAvailabilityStatusesHandler(
                async () => HttpResponse.json({} as any, { status: 500 }),
            )
            server.use(mockError.handler)

            const user = userEvent.setup()
            renderComponent()

            await waitFor(() =>
                expect(
                    screen.getByText(/Failed to load custom statuses/i),
                ).toBeInTheDocument(),
            )

            const retryButton = screen.getByRole('button', { name: /retry/i })
            expect(retryButton).toBeInTheDocument()

            server.use(mockListHandler.handler)
            await act(() => user.click(retryButton))

            await waitFor(() =>
                expect(screen.getByText('Lunch break')).toBeInTheDocument(),
            )
        })
    })

    describe('System Statuses', () => {
        it('should disable edit and delete buttons for system statuses', async () => {
            renderComponent()

            await waitFor(() =>
                expect(screen.getByText('Unavailable')).toBeInTheDocument(),
            )

            const editButton = screen.getByRole('button', {
                name: /cannot edit system status unavailable/i,
            })
            const deleteButton = screen.getByRole('button', {
                name: /cannot delete system status unavailable/i,
            })

            expect(editButton).toBeDisabled()
            expect(deleteButton).toBeDisabled()
        })
    })

    describe('Learning Resources Link', () => {
        it('should render learning resources link with correct href and target', async () => {
            renderComponent()

            await waitFor(() =>
                expect(screen.getByText('Unavailable')).toBeInTheDocument(),
            )

            const link = screen.getByRole('link', {
                name: /learning resources/i,
            })

            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute('href', 'https://docs.gorgias.com')
            expect(link).toHaveAttribute('target', '_blank')
            expect(link).toHaveAttribute('rel', 'noopener noreferrer')
        })
    })

    describe('Custom Status Limit', () => {
        it('should not show limit banner when under 25 custom statuses', async () => {
            renderComponent()

            await waitFor(() =>
                expect(screen.getByText('Lunch break')).toBeInTheDocument(),
            )

            expect(
                screen.queryByText(/reached the 25 custom status limit/i),
            ).not.toBeInTheDocument()
        })

        it('should show limit banner when 25 or more custom statuses exist', async () => {
            const customStatuses = Array.from({ length: 25 }, (_, i) => ({
                id: `${i + 1}`,
                name: `Status ${i + 1}`,
                duration_unit: null,
                duration_value: null,
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
            }))

            const mockList = mockListCustomUserAvailabilityStatusesHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: customStatuses,
                    }),
            )
            server.use(mockList.handler)

            renderComponent()

            await waitFor(() =>
                expect(
                    screen.getByText(
                        'You have reached the 25 custom status limit',
                    ),
                ).toBeInTheDocument(),
            )

            expect(
                screen.getByText(
                    /Delete existing custom statuses to add more/i,
                ),
            ).toBeInTheDocument()
        })

        it('should disable create button when limit is reached', async () => {
            const customStatuses = Array.from({ length: 25 }, (_, i) => ({
                id: `${i + 1}`,
                name: `Status ${i + 1}`,
                duration_unit: null,
                duration_value: null,
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
            }))

            const mockList = mockListCustomUserAvailabilityStatusesHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        data: customStatuses,
                    }),
            )
            server.use(mockList.handler)

            renderComponent()

            await waitFor(() =>
                expect(
                    screen.getByText(
                        'You have reached the 25 custom status limit',
                    ),
                ).toBeInTheDocument(),
            )

            const createButton = screen.getByRole('button', {
                name: /create status/i,
            })
            expect(createButton).toBeDisabled()
        })

        it('should enable create button when under limit', async () => {
            renderComponent()

            await waitFor(() =>
                expect(screen.getByText('Lunch break')).toBeInTheDocument(),
            )

            const createButton = screen.getByRole('button', {
                name: /create status/i,
            })
            expect(createButton).not.toBeDisabled()
        })
    })
})
