import { assumeMock, userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import { useFlag } from 'core/flags'
import type { useWorkloadPerChannelDistributionForPreviousPeriod } from 'domains/reporting/hooks/distributions'
import { useWorkloadPerChannelDistribution } from 'domains/reporting/hooks/distributions'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { TagFilterInstanceId } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import GaugeChart from 'domains/reporting/pages/common/components/charts/GaugeChart'
import { DEFAULT_TIMEZONE } from 'domains/reporting/pages/convert/constants/components'
import { WorkloadPerChannelChart } from 'domains/reporting/pages/support-performance/overview/charts/WorkloadPerChannelChart'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'
import type { RootState, StoreDispatch } from 'state/types'

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

jest.mock('domains/reporting/pages/common/components/charts/GaugeChart')
const gaugeChartMock = assumeMock(GaugeChart)

jest.mock('domains/reporting/hooks/distributions')
const useWorkloadPerChannelDistributionMock = assumeMock(
    useWorkloadPerChannelDistribution,
)
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<WorkloadPerChannelChart />', () => {
    useFlagMock.mockReturnValue(false)
    const defaultStatsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
        channels: withDefaultLogicalOperator([TicketChannel.Chat]),
        integrations: withDefaultLogicalOperator([
            integrationsState.integrations[0].id,
        ]),
        agents: withDefaultLogicalOperator([agents[0].id]),
        tags: [
            {
                ...withDefaultLogicalOperator([1]),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
    }
    const defaultState = {
        stats: {
            filters: defaultStatsFilters,
        },
        ui: {
            stats: { filters: uiStatsInitialState },
        },
    } as RootState

    const workloadDistribution = {
        data: [
            {
                value: 200,
                label: TicketChannel.Email,
            },
            {
                value: 34,
                label: TicketChannel.Chat,
            },
        ],
    } as ReturnType<typeof useWorkloadPerChannelDistributionForPreviousPeriod>

    beforeEach(() => {
        jest.resetAllMocks()
        useWorkloadPerChannelDistributionMock.mockReturnValue(
            workloadDistribution,
        )
        gaugeChartMock.mockImplementation(() => <div />)
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: defaultStatsFilters,
            granularity: ReportingGranularity.Day,
            userTimezone: DEFAULT_TIMEZONE,
        })
        useFlagMock.mockReturnValue(false)
    })

    it('should fetch data and render the chart', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <WorkloadPerChannelChart />
            </Provider>,
        )

        expect(gaugeChartMock).toHaveBeenCalledWith(
            {
                data: workloadDistribution.data,
            },
            {},
        )
    })

    it('should render skeleton when no data', () => {
        useWorkloadPerChannelDistributionMock.mockReturnValue({
            data: undefined,
        } as any)

        render(
            <Provider store={mockStore(defaultState)}>
                <WorkloadPerChannelChart />
            </Provider>,
        )

        expect(
            document.querySelector('.react-loading-skeleton'),
        ).toBeInTheDocument()
    })

    it('should defer loading with a feature flag', () => {
        useFlagMock.mockReturnValue(true)
        useWorkloadPerChannelDistributionMock.mockReturnValue({
            data: undefined,
        } as any)

        render(
            <Provider store={mockStore(defaultState)}>
                <WorkloadPerChannelChart />
            </Provider>,
        )

        expect(
            document.querySelector('.react-loading-skeleton'),
        ).toBeInTheDocument()
        expect(useWorkloadPerChannelDistributionMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            false,
        )
        expect(screen.getByText('refresh')).toBeInTheDocument()
    })

    it('should defer loading until feature flag is loading but hold on with showing the refresh button', () => {
        useFlagMock.mockReturnValue(null)
        useWorkloadPerChannelDistributionMock.mockReturnValue({
            data: undefined,
        } as any)

        render(
            <Provider store={mockStore(defaultState)}>
                <WorkloadPerChannelChart />
            </Provider>,
        )

        expect(
            document.querySelector('.react-loading-skeleton'),
        ).toBeInTheDocument()
        expect(useWorkloadPerChannelDistributionMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            false,
        )
        expect(screen.queryByText('refresh')).not.toBeInTheDocument()
    })

    it('should allow loading after clicking the refresh icon', () => {
        useFlagMock.mockReturnValue(true)
        useWorkloadPerChannelDistributionMock.mockReturnValue({
            data: undefined,
        } as any)

        render(
            <Provider store={mockStore(defaultState)}>
                <WorkloadPerChannelChart />
            </Provider>,
        )

        const refreshIcon = screen.getByText('refresh')
        userEvent.click(refreshIcon)

        expect(useWorkloadPerChannelDistributionMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            true,
        )
        expect(screen.queryByText('refresh')).not.toBeInTheDocument()
    })

    describe('statsFilters', () => {
        it('should call data hook with statsFiltersWithLogicalOperators', () => {
            useFlagMock.mockReturnValue(false)
            useStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: defaultStatsFilters,
                granularity: ReportingGranularity.Day,
                userTimezone: DEFAULT_TIMEZONE,
            })
            useWorkloadPerChannelDistributionMock.mockReturnValue({
                data: undefined,
            } as any)

            render(
                <Provider store={mockStore(defaultState)}>
                    <WorkloadPerChannelChart />
                </Provider>,
            )

            expect(useWorkloadPerChannelDistributionMock).toHaveBeenCalledWith(
                defaultStatsFilters,
                DEFAULT_TIMEZONE,
                true,
            )
        })
    })
})
