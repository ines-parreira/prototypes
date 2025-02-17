import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React, {ComponentProps, PropsWithChildren} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {FeatureFlagKey} from 'config/featureFlags'
import {AUTO_QA_FILTER_KEYS} from 'pages/stats/common/filters/constants'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import {AchievedAndBreachedTicketsChart} from 'pages/stats/sla/components/AchievedAndBreachedTicketsChart'
import {AchievementRateTrendCard} from 'pages/stats/sla/components/AchievementRateTrendCard'
import {BreachedTicketsRateTrendCard} from 'pages/stats/sla/components/BreachedTicketsRateTrendCard'
import {DownloadSLAsData} from 'pages/stats/sla/components/DownloadSLAsData'
import {SLAPolicySelect} from 'pages/stats/sla/components/SLAPolicySelect'
import {ServiceLevelAgreements} from 'pages/stats/sla/ServiceLevelAgreements'
import {
    SERVICE_LEVEL_AGREEMENT_PAGE_TITLE,
    SERVICE_LEVEL_OPTIONAL_FILTERS,
} from 'pages/stats/sla/ServiceLevelAgreementsReportConfig'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('pages/stats/sla/components/WithSlaEmptyState', () => ({
    WithSlaEmptyState: ({children}: PropsWithChildren<unknown>) => (
        <>{children}</>
    ),
}))
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock('pages/stats/DrillDownModalTrigger.tsx', () => ({
    DrillDownModalTrigger: ({
        children,
    }: ComponentProps<typeof DrillDownModalTrigger>) => children,
}))
jest.mock('pages/stats/support-performance/SupportPerformanceFilters', () => ({
    SupportPerformanceFilters: () => <div />,
}))
jest.mock('pages/stats/sla/components/AchievedAndBreachedTicketsChart')
const AchievedAndBreachedTicketsChartMock = assumeMock(
    AchievedAndBreachedTicketsChart
)
jest.mock('pages/stats/sla/components/AchievementRateTrendCard')
const AchievementRateTrendCardMock = assumeMock(AchievementRateTrendCard)
jest.mock('pages/stats/sla/components/BreachedTicketsRateTrendCard')
const BreachedTicketsRateTrendCardMock = assumeMock(
    BreachedTicketsRateTrendCard
)
jest.mock('pages/stats/sla/components/SLAPolicySelect')
const SLAPolicySelectMock = assumeMock(SLAPolicySelect)
jest.mock('pages/stats/sla/components/DownloadSLAsData')
const DownloadSLAsDataMock = assumeMock(DownloadSLAsData)
jest.mock(
    'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    }
)

const createInitialState = (hasAutomate: boolean) =>
    ({
        billing: fromJS({
            products: [
                {
                    id: 1,
                    type: 'automation',
                    prices: hasAutomate
                        ? [
                              {
                                  price_id: 'price_1',
                              },
                          ]
                        : [],
                },
            ],
        }),
        currentAccount: fromJS({
            current_subscription: {
                trial_start_datetime: '2017-08-23T01:38:53+00:00',
                trial_end_datetime: '2017-09-06T01:38:53+00:00',
                status: 'trialing',
                start_datetime: '2017-08-23T01:38:53+00:00',
                products: {
                    1: 'price_1',
                },
                scheduled_to_cancel_at: null,
            },
        }),
    }) as RootState

describe('ServiceLevelAgreements', () => {
    beforeEach(() => {
        AchievedAndBreachedTicketsChartMock.mockImplementation(() => <div />)
        AchievementRateTrendCardMock.mockImplementation(() => <div />)
        BreachedTicketsRateTrendCardMock.mockImplementation(() => <div />)
        DownloadSLAsDataMock.mockImplementation(() => <div />)
    })

    beforeEach(() => {
        SLAPolicySelectMock.mockImplementation(() => <div />)
    })
    it('should render service level agreements', () => {
        render(
            <Provider store={mockStore(createInitialState(false))}>
                <ServiceLevelAgreements />
            </Provider>
        )

        expect(
            screen.getByText(SERVICE_LEVEL_AGREEMENT_PAGE_TITLE)
        ).toBeInTheDocument()
        expect(AchievedAndBreachedTicketsChartMock).toHaveBeenCalled()
        expect(AchievementRateTrendCardMock).toHaveBeenCalled()
        expect(BreachedTicketsRateTrendCardMock).toHaveBeenCalled()
    })

    it('should render SLAPolicySelect', () => {
        render(
            <Provider store={mockStore(createInitialState(false))}>
                <ServiceLevelAgreements />
            </Provider>
        )

        expect(SLAPolicySelectMock).toHaveBeenCalled()
    })
})

describe('ServiceLevelAgreements with AnalyticsNewFilters', () => {
    beforeEach(() => {
        AchievedAndBreachedTicketsChartMock.mockImplementation(() => <div />)
        AchievementRateTrendCardMock.mockImplementation(() => <div />)
        BreachedTicketsRateTrendCardMock.mockImplementation(() => <div />)
        DownloadSLAsDataMock.mockImplementation(() => <div />)
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
        })
    })

    beforeEach(() => {
        SLAPolicySelectMock.mockImplementation(() => <div />)
    })
    it('should render service level agreements', () => {
        render(
            <Provider store={mockStore(createInitialState(false))}>
                <ServiceLevelAgreements />
            </Provider>
        )

        expect(
            screen.getByText(SERVICE_LEVEL_AGREEMENT_PAGE_TITLE)
        ).toBeInTheDocument()
        expect(AchievedAndBreachedTicketsChartMock).toHaveBeenCalled()
        expect(AchievementRateTrendCardMock).toHaveBeenCalled()
        expect(BreachedTicketsRateTrendCardMock).toHaveBeenCalled()
    })

    it('should render SLAPolicySelect', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: false,
        })

        render(
            <Provider store={mockStore(createInitialState(false))}>
                <ServiceLevelAgreements />
            </Provider>
        )

        expect(SLAPolicySelectMock).toHaveBeenCalled()
    })

    describe('FilterPanel', () => {
        beforeEach(() => {
            mockFlags({
                [FeatureFlagKey.AnalyticsNewFilters]: true,
            })
        })

        it('should show New Filters Panel and render expected filters', () => {
            const {getByText} = render(
                <Provider store={mockStore(createInitialState(false))}>
                    <ServiceLevelAgreements />
                </Provider>
            )

            SERVICE_LEVEL_OPTIONAL_FILTERS.forEach((filter) => {
                expect(getByText(filter)).toBeInTheDocument()
            })
        })

        it('should show New Filters Panel and render expected filters with auto QA filter', () => {
            mockFlags({
                [FeatureFlagKey.AnalyticsNewFilters]: true,
            })
            const {getByText} = render(
                <Provider store={mockStore(createInitialState(true))}>
                    <ServiceLevelAgreements />
                </Provider>
            )
            const filtersWithAutoQA = [
                ...SERVICE_LEVEL_OPTIONAL_FILTERS,
                ...AUTO_QA_FILTER_KEYS,
            ]
            filtersWithAutoQA.forEach((filter) => {
                expect(getByText(filter)).toBeInTheDocument()
            })
        })
    })
})
