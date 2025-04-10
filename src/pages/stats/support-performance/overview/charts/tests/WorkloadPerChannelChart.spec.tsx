import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LD from 'launchdarkly-react-client-sdk'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import { FeatureFlagKey } from 'config/featureFlags'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'
import {
    useWorkloadPerChannelDistribution,
    useWorkloadPerChannelDistributionForPreviousPeriod,
} from 'hooks/reporting/distributions'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters, TagFilterInstanceId } from 'models/stat/types'
import GaugeChart from 'pages/stats/common/components/charts/GaugeChart'
import { DEFAULT_TIMEZONE } from 'pages/stats/convert/constants/components'
import { WorkloadPerChannelChart } from 'pages/stats/support-performance/overview/charts/WorkloadPerChannelChart'
import { RootState, StoreDispatch } from 'state/types'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/common/components/charts/GaugeChart')
const gaugeChartMock = assumeMock(GaugeChart)

jest.mock('hooks/reporting/distributions')
const useWorkloadPerChannelDistributionMock = assumeMock(
    useWorkloadPerChannelDistribution,
)
jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<WorkloadPerChannelChart />', () => {
    jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
        [FeatureFlagKey.AnalyticsDeferredLoadingExperiment]: false,
    }))
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
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsDeferredLoadingExperiment]: false,
        }))
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
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsDeferredLoadingExperiment]: true,
        }))
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
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsDeferredLoadingExperiment]: undefined,
        }))
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
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsDeferredLoadingExperiment]: true,
        }))
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
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.AnalyticsDeferredLoadingExperiment]: false,
            }))
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
