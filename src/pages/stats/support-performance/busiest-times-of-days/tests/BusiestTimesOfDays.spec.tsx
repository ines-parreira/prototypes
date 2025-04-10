import React, { ComponentProps } from 'react'

import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyAutomationPlan,
    basicYearlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { FilterKey } from 'models/stat/types'
import { AnalyticsFooter } from 'pages/stats/common/AnalyticsFooter'
import { AUTO_QA_FILTER_KEYS } from 'pages/stats/common/filters/constants'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { ChartsActionMenu } from 'pages/stats/dashboards/ChartsActionMenu/ChartsActionMenu'
import { BusiestTimesOfDays } from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDays'
import { BusiestTimesOfDaysDownloadDataButton } from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysDownloadDataButton'
import { BusiestTimesOfDaysTable } from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysTable'
import {
    BUSIEST_TIME_OF_DAY_OPTIONAL_FILTERS,
    BUSIEST_TIME_OF_DAY_PAGE_TITLE,
} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesReportConfig'
import { BusiestTimeOfDaysMetrics } from 'pages/stats/support-performance/busiest-times-of-days/types'
import { getMetricQuery } from 'pages/stats/support-performance/busiest-times-of-days/utils'
import { RootState } from 'state/types'
import {
    busiestTimesSlice,
    initialState,
} from 'state/ui/stats/busiestTimesSlice'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock(
    'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    },
)
jest.mock('pages/stats/common/drill-down/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock('pages/stats/common/AnalyticsFooter.tsx')
const AnalyticsFooterMock = assumeMock(AnalyticsFooter)
jest.mock(
    'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysTable',
)
const BusiestTimesOfDaysTableMock = assumeMock(BusiestTimesOfDaysTable)
jest.mock(
    'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysDownloadDataButton',
)
const BusiestTimesOfDaysDownloadDataButtonMock = assumeMock(
    BusiestTimesOfDaysDownloadDataButton,
)
jest.mock('hooks/reporting/useCleanStatsFilters')
const useCleanStatsFiltersMock = assumeMock(useCleanStatsFilters)
jest.mock('pages/stats/dashboards/ChartsActionMenu/ChartsActionMenu')
const ChartsActionMenuMock = assumeMock(ChartsActionMenu)

const componentMock = () => <div />

describe('BusiestTimesOfDays page', () => {
    const defaultState = {
        ui: {
            stats: { [busiestTimesSlice.name]: initialState },
        },
        billing: fromJS(billingState),
    } as RootState

    beforeEach(() => {
        AnalyticsFooterMock.mockImplementation(componentMock)
        BusiestTimesOfDaysTableMock.mockImplementation(componentMock)
        BusiestTimesOfDaysDownloadDataButtonMock.mockImplementation(
            componentMock,
        )
        ChartsActionMenuMock.mockReturnValue(componentMock as any)
    })

    it('should render the page title', () => {
        const defaultMetric = BusiestTimeOfDaysMetrics.TicketsCreated

        renderWithStore(<BusiestTimesOfDays />, defaultState)

        expect(
            screen.getByText(BUSIEST_TIME_OF_DAY_PAGE_TITLE),
        ).toBeInTheDocument()
        expect(BusiestTimesOfDaysTableMock).toHaveBeenCalledWith(
            {
                metricName: defaultMetric,
                useMetricQuery: getMetricQuery(defaultMetric),
                isHeatmapMode: true,
            },
            {},
        )
    })

    it('should render FiltersPanel', () => {
        const { getByText } = renderWithStore(
            <BusiestTimesOfDays />,
            defaultState,
        )

        BUSIEST_TIME_OF_DAY_OPTIONAL_FILTERS.forEach((optionalFilter) => {
            expect(getByText(optionalFilter)).toBeInTheDocument()
        })
        expect(useCleanStatsFiltersMock).toHaveBeenCalled()
    })

    it('should render FiltersPanel with New Filters and Score filter', () => {
        const extendedBusiestTimeOfDaysOptionalFilters = [
            ...BUSIEST_TIME_OF_DAY_OPTIONAL_FILTERS,
            FilterKey.Score,
        ]

        const { getByText } = renderWithStore(
            <BusiestTimesOfDays />,
            defaultState,
        )

        extendedBusiestTimeOfDaysOptionalFilters.forEach((optionalFilter) => {
            expect(getByText(optionalFilter)).toBeInTheDocument()
        })
    })

    it('should render FiltersPanel with Resolution Completeness and Communication Skills filters', () => {
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
        }
        const extendedBusiestTimeOfDaysOptionalFilters = [
            ...BUSIEST_TIME_OF_DAY_OPTIONAL_FILTERS,
            ...AUTO_QA_FILTER_KEYS,
        ]

        const { getByText } = renderWithStore(<BusiestTimesOfDays />, state)

        extendedBusiestTimeOfDaysOptionalFilters.forEach((optionalFilter) => {
            expect(getByText(optionalFilter)).toBeInTheDocument()
        })
    })
})
