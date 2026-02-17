import type { ComponentProps } from 'react'
import React from 'react'

import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import _noop from 'lodash/noop'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import useStatResource from 'domains/reporting/hooks/useStatResource'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type DEPRECATED_TagsStatsFilter from 'domains/reporting/pages/common/filters/DEPRECATED_TagsStatsFilter'
import { usePerformancePageAgentAvailabilities } from 'domains/reporting/pages/live/agents/hooks/usePerformancePageAgentAvailabilities'
import LiveAgents from 'domains/reporting/pages/live/agents/LiveAgents'
import { initialState as uiFiltersInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { account } from 'fixtures/account'
import { agents } from 'fixtures/agents'
import { userPerformanceOverview } from 'fixtures/stats'
import { teams } from 'fixtures/teams'
import type FeaturePaywall from 'pages/common/components/FeaturePaywall/FeaturePaywall'
import { AccountFeature } from 'state/currentAccount/types'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

jest.mock('domains/reporting/hooks/useStatResource')
jest.mock('react-chartjs-2', () => ({ Bar: () => <canvas /> }))
jest.mock(
    'domains/reporting/pages/common/filters/DEPRECATED_TagsStatsFilter',
    () =>
        ({ value }: ComponentProps<typeof DEPRECATED_TagsStatsFilter>) => (
            <div>TagsStatsFilterMock, value: {JSON.stringify(value)}</div>
        ),
)
jest.mock(
    'pages/common/components/FeaturePaywall/FeaturePaywall',
    () =>
        ({ feature }: ComponentProps<typeof FeaturePaywall>) => {
            return <div>Paywall for {feature}</div>
        },
)
jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModal.tsx',
    () => ({
        DrillDownModal: () => null,
    }),
)
jest.mock(
    'domains/reporting/pages/common/components/charts/TableStat/cells/AgentAvailabilityCell',
    () => ({
        AgentAvailabilityCell: () => <div>AgentAvailabilityCell</div>,
    }),
)
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
jest.mock('@repo/agent-status', () => ({
    ...jest.requireActual('@repo/agent-status'),
    useListUserAvailabilities: jest.fn(() => ({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
    })),
    LiveAgentsRealtimeListener: ({ userIds }: { userIds: number[] }) => (
        <div data-testid="live-agents-realtime-listener">
            LiveAgentsRealtimeListener: {userIds.join(',')}
        </div>
    ),
}))
jest.mock(
    'domains/reporting/pages/live/agents/hooks/usePerformancePageAgentAvailabilities',
    () => ({
        usePerformancePageAgentAvailabilities: jest.fn(),
    }),
)
jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000)
jest.mock(
    'domains/reporting/pages/common/filters/DEPRECATED_ChannelsStatsFilter',
    () => () => <div>ChannelsStatsFilter</div>,
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>
const useFlagMock = assumeMock(useFlag)
const usePerformancePageAgentAvailabilitiesMock = assumeMock(
    usePerformancePageAgentAvailabilities,
)

describe('LiveAgents', () => {
    const defaultState = {
        currentAccount: fromJS(account),
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: withDefaultLogicalOperator([TicketChannel.Chat]),
                agents: withDefaultLogicalOperator([agents[0].id]),
            },
        },
        agents: fromJS({
            all: agents,
        }),
        teams: fromJS({
            all: teams,
        }),
        entities: {
            stats: {
                'live-agents-stat/users-performance-overview':
                    userPerformanceOverview,
            },
            tags: {},
        },
        ui: {
            stats: { filters: uiFiltersInitialState },
        },
    } as unknown as RootState

    beforeEach(() => {
        useStatResourceMock.mockReturnValue([null, true, _noop])
        useFlagMock.mockReturnValue(false)
        usePerformancePageAgentAvailabilitiesMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: null,
        } as any)
    })

    it('should render the filters and stats when stats filters are defined', () => {
        useStatResourceMock.mockImplementation(() => {
            return [userPerformanceOverview, false, _noop]
        })

        const { container } = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <LiveAgents />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
        expect(screen.queryByText('ONLINE STATUS')).toBeInTheDocument()
    })

    it('should render the paywall when the current account has no user live statistics feature', () => {
        const store = mockStore({
            ...defaultState,
            currentAccount: defaultState.currentAccount.setIn(
                ['features', AccountFeature.UsersLiveStatistics, 'enabled'],
                false,
            ),
        })
        const { container } = render(
            <Provider store={store}>
                <LiveAgents />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch prev and next page when navigation buttons are clicked', () => {
        const store = mockStore({
            ...defaultState,
            stats: {
                filters: {
                    period: {
                        start_datetime: '2021-02-03T00:00:00.000Z',
                        end_datetime: '2021-02-03T23:59:59.999Z',
                    },
                },
            },
        })
        const fetchPage = jest.fn()
        useStatResourceMock.mockImplementation(() => {
            return [
                {
                    ...userPerformanceOverview,
                    meta: {
                        ...userPerformanceOverview.meta,
                        prev_cursor: 'prev-cursor',
                        next_cursor: 'next-cursor',
                    },
                },
                false,
                fetchPage,
            ]
        })

        const { getByText } = renderWithRouter(
            <Provider store={store}>
                <LiveAgents />
            </Provider>,
        )
        fireEvent.click(getByText('keyboard_arrow_left'))
        fireEvent.click(getByText('keyboard_arrow_right'))

        expect(fetchPage.mock.calls).toMatchSnapshot()
    })

    it('should render the filters and stats with online status instead of online time', () => {
        useStatResourceMock.mockImplementation(() => {
            return [userPerformanceOverview, false, _noop]
        })

        const { getByText } = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <LiveAgents />
            </Provider>,
        )

        expect(getByText('ONLINE STATUS')).toBeInTheDocument()
        expect(screen.queryByText('ONLINE TIME')).not.toBeInTheDocument()
    })

    it('should not render availability column when feature flag is disabled', () => {
        useFlagMock.mockReturnValue(false)
        useStatResourceMock.mockImplementation(() => {
            return [userPerformanceOverview, false, _noop]
        })

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <LiveAgents />
            </Provider>,
        )

        expect(screen.queryByText('AVAILABILITY')).not.toBeInTheDocument()
    })

    it('should render availability column when feature flag is enabled', () => {
        useFlagMock.mockReturnValue(true)
        useStatResourceMock.mockImplementation(() => {
            return [userPerformanceOverview, false, _noop]
        })

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <LiveAgents />
            </Provider>,
        )

        expect(screen.getByText('AVAILABILITY')).toBeInTheDocument()
    })

    it('should call usePerformancePageAgentAvailabilities with enabled=true when feature flag is enabled', () => {
        useFlagMock.mockReturnValue(true)
        useStatResourceMock.mockImplementation(() => {
            return [userPerformanceOverview, false, _noop]
        })

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <LiveAgents />
            </Provider>,
        )

        expect(usePerformancePageAgentAvailabilitiesMock).toHaveBeenCalledWith({
            enabled: true,
        })
    })

    it('should call usePerformancePageAgentAvailabilities with enabled=false when feature flag is disabled', () => {
        useFlagMock.mockReturnValue(false)
        useStatResourceMock.mockImplementation(() => {
            return [userPerformanceOverview, false, _noop]
        })

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <LiveAgents />
            </Provider>,
        )

        expect(usePerformancePageAgentAvailabilitiesMock).toHaveBeenCalledWith({
            enabled: false,
        })
    })

    it('should render LiveAgentsRealtimeListener when feature flag is enabled', () => {
        useFlagMock.mockReturnValue(true)
        useStatResourceMock.mockImplementation(() => {
            return [userPerformanceOverview, false, _noop]
        })

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <LiveAgents />
            </Provider>,
        )

        expect(
            screen.getByTestId('live-agents-realtime-listener'),
        ).toBeInTheDocument()
    })

    it('should not render LiveAgentsRealtimeListener when feature flag is disabled', () => {
        useFlagMock.mockReturnValue(false)
        useStatResourceMock.mockImplementation(() => {
            return [userPerformanceOverview, false, _noop]
        })

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <LiveAgents />
            </Provider>,
        )

        expect(
            screen.queryByTestId('live-agents-realtime-listener'),
        ).not.toBeInTheDocument()
    })

    it('should pass correct userIds to LiveAgentsRealtimeListener', () => {
        useFlagMock.mockReturnValue(true)
        useStatResourceMock.mockImplementation(() => {
            return [userPerformanceOverview, false, _noop]
        })

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <LiveAgents />
            </Provider>,
        )

        const listener = screen.getByTestId('live-agents-realtime-listener')
        expect(listener).toHaveTextContent('LiveAgentsRealtimeListener: 1')
    })
})
