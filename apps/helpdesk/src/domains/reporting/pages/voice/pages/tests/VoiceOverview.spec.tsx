import { ComponentProps } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useReportRestrictions } from 'domains/reporting/hooks/dashboards/useReportRestrictions'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    FilterComponentKey,
    FilterKey,
    StatsFilters,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import * as VoiceCallCallerExperienceMetric from 'domains/reporting/pages/voice/components/VoiceCallerExperienceMetric/VoiceCallCallerExperienceMetric'
import { VoiceOverviewDownloadDataButton } from 'domains/reporting/pages/voice/components/VoiceOverviewDownloadDataButton/VoiceOverviewDownloadDataButton'
import {
    ABANDONED_CALLS_METRIC_TITLE,
    AVERAGE_TALK_TIME_METRIC_TITLE,
    AVERAGE_WAIT_TIME_METRIC_TITLE,
    CALL_LIST_TITLE,
    CALLBACK_REQUESTED_CALLS_METRIC_TITLE,
    CANCELLED_CALLS_METRIC_TITLE,
    INBOUND_CALLS_METRIC_TITLE,
    MISSED_CALLS_METRIC_TITLE,
    OUTBOUND_CALLS_METRIC_TITLE,
    TOTAL_CALLS_METRIC_TITLE,
    UNANSWERED_CALLS_METRIC_TITLE,
    VOICE_OVERVIEW_PAGE_TITLE,
} from 'domains/reporting/pages/voice/constants/voiceOverview'
import { useVoiceCallAverageTimeTrend } from 'domains/reporting/pages/voice/hooks/useVoiceCallAverageTimeTrend'
import { useVoiceCallCountTrend } from 'domains/reporting/pages/voice/hooks/useVoiceCallCountTrend'
import VoiceOverview from 'domains/reporting/pages/voice/pages/VoiceOverview'
import { VoiceMetric } from 'domains/reporting/state/ui/stats/types'
import { account } from 'fixtures/account'
import { agents } from 'fixtures/agents'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyAutomationPlan,
    VOICE_PRODUCT_ID,
    voicePlan1,
} from 'fixtures/productPrices'
import { tags } from 'fixtures/tag'
import { user } from 'fixtures/users'
import { AccountFeature } from 'state/currentAccount/types'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModal.tsx',
    () => ({
        DrillDownModal: () => null,
    }),
)

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('domains/reporting/pages/voice/hooks/useVoiceCallCountTrend')
jest.mock('domains/reporting/pages/voice/hooks/useVoiceCallAverageTimeTrend')
jest.mock('domains/reporting/pages/voice/VoicePaywall', () => () => (
    <div>VoicePaywall</div>
))
jest.mock(
    'domains/reporting/pages/voice/components/VoiceOverviewDownloadDataButton/VoiceOverviewDownloadDataButton',
)
const VoiceOverviewDownloadDataButtonMock = assumeMock(
    VoiceOverviewDownloadDataButton,
)
jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    },
)

assumeMock(useVoiceCallCountTrend).mockReturnValue({
    data: { prevValue: 10, value: 15 },
    isFetching: false,
    isError: false,
})
assumeMock(useVoiceCallAverageTimeTrend).mockReturnValue({
    data: { prevValue: 1, value: 2 },
    isFetching: false,
    isError: false,
})
const VoiceCallCallerExperienceMetricSpy = jest.spyOn(
    VoiceCallCallerExperienceMetric,
    'default',
)

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = assumeMock(useFlag)

jest.mock('domains/reporting/hooks/dashboards/useReportRestrictions')
const useReportRestrictionsMock = assumeMock(useReportRestrictions)
useReportRestrictionsMock.mockReturnValue({
    reportRestrictionsMap: {},
    chartRestrictionsMap: {},
    moduleRestrictionsMap: {},
})

describe('VoiceOverview', () => {
    beforeEach(() => {
        VoiceOverviewDownloadDataButtonMock.mockImplementation(() => <div />)
    })

    const renderVoiceOverview = (featureEnabled = true) => {
        const statsFilters: StatsFilters = {
            period: {
                start_datetime: '2023-12-11T00:00:00.000Z',
                end_datetime: '2023-12-11T23:59:59.999Z',
            },
            agents: withDefaultLogicalOperator([agents[0].id]),
            tags: [
                {
                    ...withDefaultLogicalOperator([tags[0].id]),
                    filterInstanceId: TagFilterInstanceId.First,
                },
            ],
        }
        const state = {
            currentUser: fromJS(user) as Map<any, any>,
            currentAccount: fromJS({
                current_subscription: {
                    ...account.current_subscription,
                    products: {
                        ...account.current_subscription.products,
                        [AUTOMATION_PRODUCT_ID]:
                            basicYearlyAutomationPlan.price_id,
                        ...(featureEnabled && {
                            [VOICE_PRODUCT_ID]: voicePlan1.price_id,
                        }),
                    },
                },
                features: fromJS({
                    [AccountFeature.PhoneNumber]: {
                        enabled: featureEnabled,
                    },
                }),
            }),
            billing: fromJS(billingState),
            stats: {
                filters: statsFilters,
            },
            integrations: fromJS({ integrations: [] }),
            ui: {
                stats: {
                    filters: {
                        cleanStatsFilters: statsFilters,
                        isFilterDirty: false,
                    },
                },
            },
            entities: { tags: { [tags[0].id]: tags[0] } },
        } as RootState
        return render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <VoiceOverview />
                </Provider>
            </QueryClientProvider>,
        )
    }

    it('should render page', () => {
        const { queryByText } = renderVoiceOverview()

        // header elements
        expect(queryByText(VOICE_OVERVIEW_PAGE_TITLE)).toBeInTheDocument()
        expect(queryByText('Voice add-on features')).toBeNull()

        expect(VoiceOverviewDownloadDataButtonMock).toHaveBeenCalled()

        expect(queryByText(TOTAL_CALLS_METRIC_TITLE)).toBeInTheDocument()
        expect(queryByText(OUTBOUND_CALLS_METRIC_TITLE)).toBeInTheDocument()
        expect(queryByText(INBOUND_CALLS_METRIC_TITLE)).toBeInTheDocument()
        expect(queryByText(UNANSWERED_CALLS_METRIC_TITLE)).toBeInTheDocument()

        expect(queryByText(MISSED_CALLS_METRIC_TITLE)).toBeInTheDocument()
        expect(queryByText(CANCELLED_CALLS_METRIC_TITLE)).toBeInTheDocument()
        expect(queryByText(ABANDONED_CALLS_METRIC_TITLE)).toBeInTheDocument()
        expect(
            queryByText(CALLBACK_REQUESTED_CALLS_METRIC_TITLE),
        ).toBeInTheDocument()

        expect(queryByText(AVERAGE_TALK_TIME_METRIC_TITLE)).toBeInTheDocument()
        expect(queryByText(AVERAGE_WAIT_TIME_METRIC_TITLE)).toBeInTheDocument()

        // list of calls section
        expect(queryByText(CALL_LIST_TITLE)).toBeInTheDocument()

        // filters by direction
        expect(queryByText('All')).toBeInTheDocument()
        expect(queryByText('Inbound')).toBeInTheDocument()
        expect(queryByText('Outbound')).toBeInTheDocument()

        // footer
        expect(
            queryByText('Analytics are using EST timezone'),
        ).toBeInTheDocument()
    })

    it('should render Download data button', () => {
        renderVoiceOverview()

        expect(VoiceOverviewDownloadDataButtonMock).toHaveBeenCalled()
    })

    it('should render paywall page', () => {
        const { getByText } = renderVoiceOverview(false)

        expect(getByText('VoicePaywall')).toBeInTheDocument()
    })

    it('should pass correct props to VoiceCallCallerExperienceMetric', () => {
        renderVoiceOverview()

        expect(VoiceCallCallerExperienceMetricSpy).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                metricData: {
                    metricName: VoiceMetric.AverageWaitTime,
                    title: AVERAGE_WAIT_TIME_METRIC_TITLE,
                },
            }),
            {},
        )
        expect(VoiceCallCallerExperienceMetricSpy).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                metricData: {
                    metricName: VoiceMetric.AverageTalkTime,
                    title: AVERAGE_TALK_TIME_METRIC_TITLE,
                },
            }),
            {},
        )
    })

    it('should render optional filters', () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.VoiceCallDuringBusinessHours) {
                return true
            }
        })

        const { getByText } = renderVoiceOverview()

        expect(getByText(FilterKey.Agents)).toBeInTheDocument()
        expect(
            getByText(FilterComponentKey.PhoneIntegrations),
        ).toBeInTheDocument()
        expect(getByText(FilterKey.Tags)).toBeInTheDocument()
        expect(getByText(FilterKey.VoiceQueues)).toBeInTheDocument()
        expect(getByText(FilterKey.IsDuringBusinessHours)).toBeInTheDocument()
    })

    it('should render old optional filters when FF is disabled', () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.VoiceCallDuringBusinessHours) {
                return false
            }
        })

        const { queryByText } = renderVoiceOverview()

        expect(queryByText(FilterKey.Agents)).toBeInTheDocument()
        expect(
            queryByText(FilterComponentKey.PhoneIntegrations),
        ).toBeInTheDocument()
        expect(queryByText(FilterKey.Tags)).toBeInTheDocument()
        expect(queryByText(FilterKey.VoiceQueues)).toBeInTheDocument()
        expect(
            queryByText(FilterKey.IsDuringBusinessHours),
        ).not.toBeInTheDocument()
    })
})
