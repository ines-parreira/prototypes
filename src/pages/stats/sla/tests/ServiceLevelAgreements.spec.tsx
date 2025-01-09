import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React, {ComponentProps, PropsWithChildren} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {FeatureFlagKey} from 'config/featureFlags'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyAutomationPlan,
    basicYearlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import {FilterKey} from 'models/stat/types'
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
} from 'pages/stats/sla/ServiceLevelAgreementsConfig'
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

const defaultState = {
    billing: fromJS(billingState),
}

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
            <Provider store={mockStore(defaultState)}>
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
            <Provider store={mockStore(defaultState)}>
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
            <Provider store={mockStore(defaultState)}>
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
            <Provider store={mockStore(defaultState)}>
                <ServiceLevelAgreements />
            </Provider>
        )

        expect(SLAPolicySelectMock).toHaveBeenCalled()
    })

    describe('FilterPanel', () => {
        const state = {
            ...defaultState,
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    products: {
                        [HELPDESK_PRODUCT_ID]: basicYearlyHelpdeskPlan.price_id,
                        [AUTOMATION_PRODUCT_ID]:
                            basicYearlyAutomationPlan.price_id,
                    },
                    status: 'active',
                },
            }),
        } as RootState

        beforeEach(() => {
            mockFlags({
                [FeatureFlagKey.AnalyticsNewFilters]: true,
                [FeatureFlagKey.AnalyticsNewCSATFilter]: false,
                [FeatureFlagKey.AutoQAFilters]: false,
            })
        })

        it('should show New Filters Panel and render expected filters', () => {
            const {getByText} = render(
                <Provider store={mockStore(state)}>
                    <ServiceLevelAgreements />
                </Provider>
            )

            SERVICE_LEVEL_OPTIONAL_FILTERS.forEach((filter) => {
                expect(getByText(filter)).toBeInTheDocument()
            })
        })

        it('should show New Filters Panel and render expected filters with score filter', () => {
            mockFlags({
                [FeatureFlagKey.AnalyticsNewFilters]: true,
                [FeatureFlagKey.AnalyticsNewCSATFilter]: true,
            })
            const {getByText} = render(
                <Provider store={mockStore(state)}>
                    <ServiceLevelAgreements />
                </Provider>
            )
            const filtersWithScore = [
                ...SERVICE_LEVEL_OPTIONAL_FILTERS,
                FilterKey.Score,
            ]
            filtersWithScore.forEach((filter) => {
                expect(getByText(filter)).toBeInTheDocument()
            })
        })

        it('should show New Filters Panel and render expected filters with resolution completeness and communication skills filters', () => {
            mockFlags({
                [FeatureFlagKey.AnalyticsNewFilters]: true,
                [FeatureFlagKey.AutoQAFilters]: true,
            })
            const {getByText} = render(
                <Provider store={mockStore(state)}>
                    <ServiceLevelAgreements />
                </Provider>
            )
            const filtersWithScore = [
                ...SERVICE_LEVEL_OPTIONAL_FILTERS,
                FilterKey.ResolutionCompleteness,
                FilterKey.CommunicationSkills,
            ]
            filtersWithScore.forEach((filter) => {
                expect(getByText(filter)).toBeInTheDocument()
            })
        })
    })
})
