import type { ComponentProps } from 'react'
import React from 'react'

import { assumeMock, render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import { fromJS } from 'immutable'
import _noop from 'lodash/noop'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { mockListUsersHandler, mockUser } from '@gorgias/helpdesk-mocks'
import { useAgentsOnlineStatus } from '@gorgias/realtime'

import { TicketChannel } from 'business/types/ticket'
import { OPEN_TICKETS_ASSIGNMENT_STATUSES } from 'domains/reporting/config/stats'
import { useStatResource } from 'domains/reporting/hooks/useStatResource'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { DefaultExportLiveOverview as LiveOverview } from 'domains/reporting/pages/live/overview/LiveOverview'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { account } from 'fixtures/account'
import { agents } from 'fixtures/agents'
import {
    openTicketsAssignmentStatuses,
    supportVolumePerHour,
} from 'fixtures/stats'
import { teams } from 'fixtures/teams'
import type { FeaturePaywall } from 'pages/common/components/FeaturePaywall/FeaturePaywall'
import { AccountFeature } from 'state/currentAccount/types'
import type { RootState, StoreDispatch } from 'state/types'

jest.mock('domains/reporting/hooks/useStatResource')
jest.mock('@gorgias/realtime')
jest.mock('react-chartjs-2', () => ({ Line: () => <canvas /> }))
jest.mock('pages/common/components/FeaturePaywall/FeaturePaywall', () => ({
    FeaturePaywall: ({ feature }: ComponentProps<typeof FeaturePaywall>) => {
        return <div>Paywall for {feature}</div>
    },
}))
jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModal.tsx',
    () => ({
        DrillDownModal: () => null,
    }),
)
jest.mock(
    'pages/aiAgent/analyticsOverview/components/NewAutomateStatsOptInBanner/NewAutomateStatsOptInBanner',
    () => ({
        NewAutomateStatsOptInBanner: () => null,
    }),
)
jest.mock(
    'domains/reporting/pages/common/filters/DEPRECATED_ChannelsStatsFilter',
    () => ({
        DEPRECATED_ChannelsStatsFilter: () => <div>ChannelsStatsFilter</div>,
    }),
)
jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>
const useAgentsOnlineStatusMock = assumeMock(useAgentsOnlineStatus)

function getMetricCard(label: string): HTMLElement {
    const card = screen.getByText(label).parentElement
    if (!card) {
        throw new Error(`Could not find metric card for "${label}"`)
    }
    return card
}

const alice = mockUser({ id: 1, name: 'Alice', active: true })
const bob = mockUser({ id: 2, name: 'Bob', active: true })
const carol = mockUser({ id: 3, name: 'Carol', active: true })

const mockListUsers = mockListUsersHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        data: [alice, bob, carol],
        meta: { prev_cursor: null, next_cursor: null },
    }),
)

const server = setupServer(mockListUsers.handler)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

describe('LiveOverview', () => {
    const defaultState = {
        currentAccount: fromJS(account),
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: withDefaultLogicalOperator([TicketChannel.Chat]),
                agents: withDefaultLogicalOperator<number>([]),
            },
        },
        agents: fromJS({
            all: agents,
        }),
        teams: fromJS({
            all: teams,
        }),
        ui: {
            stats: { filters: uiStatsInitialState },
        },
    } as RootState

    beforeEach(() => {
        useStatResourceMock.mockImplementation(({ resourceName }) => {
            if (resourceName === OPEN_TICKETS_ASSIGNMENT_STATUSES) {
                return [openTicketsAssignmentStatuses, false, _noop]
            }
            return [supportVolumePerHour, false, _noop]
        })
        useAgentsOnlineStatusMock.mockReturnValue({ onlineAgents: {} })
    })

    it('renders online and offline agent counts from realtime presence', async () => {
        useAgentsOnlineStatusMock.mockReturnValue({
            onlineAgents: { 1: alice, 3: carol },
        })

        render(<LiveOverview />, { storeState: defaultState })

        const onlineCard = getMetricCard('Agents online')
        const offlineCard = getMetricCard('Agents offline')

        // Alice + Carol online, Bob offline.
        expect(await within(onlineCard).findByText('2')).toBeInTheDocument()
        expect(within(offlineCard).getByText('1')).toBeInTheDocument()
    })

    it('filters the agent counts by the selected agents/teams filter', async () => {
        useAgentsOnlineStatusMock.mockReturnValue({
            onlineAgents: { 1: alice, 3: carol },
        })

        const filteredState = {
            ...defaultState,
            stats: {
                filters: {
                    ...defaultState.stats.filters,
                    agents: withDefaultLogicalOperator([1, 2]),
                },
            },
        } as RootState

        render(<LiveOverview />, { storeState: filteredState })

        const onlineCard = getMetricCard('Agents online')
        const offlineCard = getMetricCard('Agents offline')

        // Filter = Alice + Bob; Carol is excluded. Alice online, Bob offline.
        expect(await within(onlineCard).findByText('1')).toBeInTheDocument()
        expect(within(offlineCard).getByText('1')).toBeInTheDocument()
    })

    it('renders the open ticket metrics alongside the agent cards', async () => {
        render(<LiveOverview />, { storeState: defaultState })

        expect(
            await screen.findByText('Assigned open tickets'),
        ).toBeInTheDocument()
        expect(screen.getByText('Unassigned open tickets')).toBeInTheDocument()
        expect(screen.getByText('5K+')).toBeInTheDocument()
        expect(screen.getByText('2,700')).toBeInTheDocument()
    })

    it('renders the paywall when the current account has no overview live statistics feature', () => {
        const store = mockStore({
            ...defaultState,
            currentAccount: defaultState.currentAccount.setIn(
                ['features', AccountFeature.OverviewLiveStatistics, 'enabled'],
                false,
            ),
        })

        render(
            <Provider store={store}>
                <LiveOverview />
            </Provider>,
        )

        expect(
            screen.getByText(
                `Paywall for ${AccountFeature.OverviewLiveStatistics}`,
            ),
        ).toBeInTheDocument()
    })
})
