import React, { ComponentProps, PropsWithChildren } from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import { AUTO_QA_FILTER_KEYS } from 'domains/reporting/pages/common/filters/constants'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import { AchievedAndBreachedTicketsChart } from 'domains/reporting/pages/sla/components/AchievedAndBreachedTicketsChart'
import { AchievementRateTrendCard } from 'domains/reporting/pages/sla/components/AchievementRateTrendCard'
import { BreachedTicketsRateTrendCard } from 'domains/reporting/pages/sla/components/BreachedTicketsRateTrendCard'
import { DownloadSLAsData } from 'domains/reporting/pages/sla/components/DownloadSLAsData'
import { ServiceLevelAgreements } from 'domains/reporting/pages/sla/ServiceLevelAgreements'
import {
    SERVICE_LEVEL_AGREEMENT_PAGE_TITLE,
    SERVICE_LEVEL_OPTIONAL_FILTERS,
} from 'domains/reporting/pages/sla/ServiceLevelAgreementsReportConfig'
import { RootState, StoreDispatch } from 'state/types'
import { assumeMock } from 'utils/testing'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('domains/reporting/pages/sla/components/WithSlaEmptyState', () => ({
    WithSlaEmptyState: ({ children }: PropsWithChildren<unknown>) => (
        <>{children}</>
    ),
}))
jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModal.tsx',
    () => ({
        DrillDownModal: () => null,
    }),
)
jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModalTrigger.tsx',
    () => ({
        DrillDownModalTrigger: ({
            children,
        }: ComponentProps<typeof DrillDownModalTrigger>) => children,
    }),
)
jest.mock(
    'domains/reporting/pages/sla/components/AchievedAndBreachedTicketsChart',
)
const AchievedAndBreachedTicketsChartMock = assumeMock(
    AchievedAndBreachedTicketsChart,
)
jest.mock('domains/reporting/pages/sla/components/AchievementRateTrendCard')
const AchievementRateTrendCardMock = assumeMock(AchievementRateTrendCard)
jest.mock('domains/reporting/pages/sla/components/BreachedTicketsRateTrendCard')
const BreachedTicketsRateTrendCardMock = assumeMock(
    BreachedTicketsRateTrendCard,
)
jest.mock('domains/reporting/pages/sla/components/DownloadSLAsData')
const DownloadSLAsDataMock = assumeMock(DownloadSLAsData)
jest.mock('domains/reporting/hooks/useCleanStatsFilters')
const useCleanStatsFiltersMock = assumeMock(useCleanStatsFilters)
jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    },
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

    it('should render service level agreements', () => {
        render(
            <Provider store={mockStore(createInitialState(false))}>
                <ServiceLevelAgreements />
            </Provider>,
        )

        expect(
            screen.getByText(SERVICE_LEVEL_AGREEMENT_PAGE_TITLE),
        ).toBeInTheDocument()
        expect(AchievedAndBreachedTicketsChartMock).toHaveBeenCalled()
        expect(AchievementRateTrendCardMock).toHaveBeenCalled()
        expect(BreachedTicketsRateTrendCardMock).toHaveBeenCalled()
    })

    describe('FilterPanel', () => {
        it('should show Filters Panel and render expected filters', () => {
            const { getByText } = render(
                <Provider store={mockStore(createInitialState(false))}>
                    <ServiceLevelAgreements />
                </Provider>,
            )

            SERVICE_LEVEL_OPTIONAL_FILTERS.forEach((filter) => {
                expect(getByText(filter)).toBeInTheDocument()
            })
            expect(useCleanStatsFiltersMock).toHaveBeenCalled()
        })

        it('should show Filters Panel and render expected filters with auto QA filter', () => {
            const { getByText } = render(
                <Provider store={mockStore(createInitialState(true))}>
                    <ServiceLevelAgreements />
                </Provider>,
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
