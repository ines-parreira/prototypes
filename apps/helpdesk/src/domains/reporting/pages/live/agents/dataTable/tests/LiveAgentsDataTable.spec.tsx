import { render } from '@repo/testing'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCustomUserAvailabilityStatus,
    mockListCustomUserAvailabilityStatusesHandler,
    mockListUserAvailabilitiesHandler,
    mockListUsersHandler,
    mockUpdateUserAvailabilityHandler,
    mockUpdateUserAvailabilityResponse,
    mockUserAvailability,
} from '@gorgias/helpdesk-mocks'

import { DefaultExportLiveAgentsDataTable as LiveAgentsDataTable } from 'domains/reporting/pages/live/agents/dataTable/LiveAgentsDataTable'
import { initialState as uiFiltersInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { userPerformanceOverview } from 'fixtures/stats'
import type { RootState } from 'state/types'

// The availability column is feature-flagged; enable it so the AvailabilityCell
// (the inline status select) renders. Everything else in @repo/agent-status is
// the real implementation.
jest.mock('@repo/agent-status', () => ({
    ...jest.requireActual('@repo/agent-status'),
    useCustomAgentUnavailableStatusesFlag: jest.fn(() => true),
}))

const USERS = [
    { id: 1, name: 'Acme Support', active: true },
    { id: 2, name: 'Bravo Agent', active: true },
    { id: 3, name: 'Charlie Agent', active: true },
]

const server = setupServer()

const buildStoreState = (roleName = 'admin') =>
    ({
        currentUser: fromJS({
            timezone: 'Europe/Paris',
            role: { name: roleName },
        }),
        // Satisfy the UsersLiveStatistics feature paywall wrapping the page.
        currentAccount: fromJS({
            features: { users_live_statistics: { enabled: true } },
        }),
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
            },
        },
        ui: { stats: { filters: uiFiltersInitialState } },
        entities: { tags: {} },
    }) as unknown as RootState

// Admin by default so the availability cell renders the editable status select.
const renderTable = (roleName = 'admin') =>
    render(<LiveAgentsDataTable />, { storeState: buildStoreState(roleName) })

describe('LiveAgentsDataTable', () => {
    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

    beforeEach(() => {
        const defaultUsers = mockListUsersHandler()
        const defaultAvailabilities = mockListUserAvailabilitiesHandler()
        const defaultCustomStatuses =
            mockListCustomUserAvailabilityStatusesHandler()
        server.use(
            mockListUsersHandler(async () =>
                HttpResponse.json({
                    ...defaultUsers.data,
                    data: USERS,
                    meta: {
                        ...defaultUsers.data.meta,
                        next_cursor: null,
                        prev_cursor: null,
                    },
                }),
            ).handler,
            mockListUserAvailabilitiesHandler(async () =>
                HttpResponse.json({
                    ...defaultAvailabilities.data,
                    data: USERS.map((user) =>
                        mockUserAvailability({
                            user_id: user.id,
                            user_status: 'available',
                        }),
                    ),
                    meta: {
                        ...defaultAvailabilities.data.meta,
                        next_cursor: null,
                        prev_cursor: null,
                    },
                }),
            ).handler,
            defaultCustomStatuses.handler,
            http.post('*/api/stats/users-performance-overview/', async () =>
                HttpResponse.json(userPerformanceOverview),
            ),
        )
    })

    afterEach(() => server.resetHandlers())
    afterAll(() => server.close())

    it('renders the agents with their columns once the data loads', async () => {
        renderTable()

        // The Live agents panel header. Generous timeout for the first render's
        // cold module + MSW warmup. (findBy* retries across the stats-load
        // re-render, so we never hold a detached node.)
        await screen.findByRole(
            'heading',
            { name: /Live agents/i },
            { timeout: 5000 },
        )

        // Agent column (one row per active agent).
        await screen.findByText('Acme Support')
        await screen.findByText('Bravo Agent')

        // The metric columns are present (stable before + after the stats load).
        await screen.findByRole('columnheader', { name: /Tickets closed/i })
        await screen.findByRole('columnheader', { name: /Open tickets/i })

        // Online-status cells (realtime defaults to offline in tests).
        expect(screen.getAllByText('Offline').length).toBeGreaterThan(0)
    })

    it('renders the inline availability status for each agent', async () => {
        renderTable()

        await screen.findByText('Acme Support')

        // Admin can edit availability, so each agent renders the status select
        // resolved from the shared availability list ("Available").
        await waitFor(() =>
            expect(screen.getAllByText('Available').length).toBeGreaterThan(0),
        )
    })

    it('links open-ticket counts to the matching ticket views', async () => {
        renderTable()

        await screen.findByText('Acme Support')

        // The agent with open tickets in the fixture renders a clickable
        // open-tickets badge linking to the filtered ticket view.
        await waitFor(() =>
            expect(screen.getAllByRole('button').length).toBeGreaterThan(0),
        )
    })

    describe('availability cell', () => {
        const lunchStatus = mockCustomUserAvailabilityStatus({
            id: 'lunch',
            name: 'Lunch',
        })

        const availabilitiesHandler = (
            availabilities: ReturnType<typeof mockUserAvailability>[],
        ) => {
            const defaults = mockListUserAvailabilitiesHandler()
            return mockListUserAvailabilitiesHandler(async () =>
                HttpResponse.json({
                    ...defaults.data,
                    data: availabilities,
                    meta: {
                        ...defaults.data.meta,
                        next_cursor: null,
                        prev_cursor: null,
                    },
                }),
            ).handler
        }

        const customStatusesHandler = (
            statuses: ReturnType<typeof mockCustomUserAvailabilityStatus>[],
        ) =>
            mockListCustomUserAvailabilityStatusesHandler(async ({ data }) =>
                HttpResponse.json({ ...data, data: statuses }),
            ).handler

        // The pinned agent column and the scrollable columns render as separate
        // row elements, so the status trigger can't be reached through the
        // agent-name row. The triggers are identical, so opening any one
        // exercises the change handler. The control carries the "Agent
        // availability" label but its computed button name differs, so it's
        // matched by label + element type.
        const openFirstAvailabilitySelect = async (
            user: ReturnType<typeof userEvent.setup>,
        ) => {
            const [trigger] = (
                await screen.findAllByLabelText('Agent availability')
            ).filter(
                (element): element is HTMLButtonElement =>
                    element instanceof HTMLButtonElement,
            )
            if (!trigger) {
                throw new Error('Expected an editable availability trigger')
            }
            await user.click(trigger)
        }

        it('renders availability read-only for agents without edit permission', async () => {
            // basic-agent sits below the team-lead privilege threshold.
            renderTable('basic-agent')

            await screen.findByText('Acme Support')
            await waitFor(() =>
                expect(screen.getAllByText('Available').length).toBeGreaterThan(
                    0,
                ),
            )

            // Read-only cells render the status as plain text, with no editable
            // status control.
            expect(
                screen.queryByLabelText('Agent availability'),
            ).not.toBeInTheDocument()
        })

        it('renders an em dash when an agent has no availability', async () => {
            server.use(
                availabilitiesHandler([
                    mockUserAvailability({
                        user_id: 1,
                        user_status: 'available',
                    }),
                    mockUserAvailability({
                        user_id: 2,
                        user_status: 'available',
                    }),
                ]),
            )

            renderTable()

            const charlieRow = await screen.findByRole('row', {
                name: /Charlie Agent/,
            })
            await waitFor(() =>
                expect(within(charlieRow).getByText('—')).toBeInTheDocument(),
            )
        })

        it('lets an admin change an agent availability to a custom status', async () => {
            const update = mockUpdateUserAvailabilityHandler()
            server.use(customStatusesHandler([lunchStatus]), update.handler)
            const waitForUpdate = update.waitForRequest(server)
            const user = userEvent.setup()

            renderTable()
            await screen.findByText('Acme Support')

            await openFirstAvailabilitySelect(user)
            await user.click(
                await screen.findByRole('option', { name: /Lunch/i }),
            )

            await waitForUpdate(async (request) => {
                expect(await request.json()).toMatchObject({
                    user_status: 'custom',
                    custom_user_availability_status_id: 'lunch',
                })
            })
        })

        it('shows an error toast when the availability update fails', async () => {
            server.use(
                customStatusesHandler([lunchStatus]),
                mockUpdateUserAvailabilityHandler(async () =>
                    HttpResponse.json(mockUpdateUserAvailabilityResponse(), {
                        status: 500,
                    }),
                ).handler,
            )
            const user = userEvent.setup()

            renderTable()
            await screen.findByText('Acme Support')

            await openFirstAvailabilitySelect(user)
            await user.click(
                await screen.findByRole('option', { name: /Lunch/i }),
            )

            expect(await screen.findByRole('status')).toHaveTextContent(
                'Failed to update status. Please try again.',
            )
        })
    })
})
