import React, { ComponentProps } from 'react'

import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AnalyticsFooter } from 'domains/reporting/pages/common/AnalyticsFooter'
import { AUTO_QA_FILTER_KEYS } from 'domains/reporting/pages/common/filters/constants'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import { BusiestTimesOfDays } from 'domains/reporting/pages/support-performance/busiest-times-of-days/BusiestTimesOfDays'
import { BusiestTimesOfDaysDownloadDataButton } from 'domains/reporting/pages/support-performance/busiest-times-of-days/BusiestTimesOfDaysDownloadDataButton'
import { BusiestTimesOfDaysTable } from 'domains/reporting/pages/support-performance/busiest-times-of-days/BusiestTimesOfDaysTable'
import {
    BUSIEST_TIME_OF_DAY_OPTIONAL_FILTERS,
    BUSIEST_TIME_OF_DAY_PAGE_TITLE,
} from 'domains/reporting/pages/support-performance/busiest-times-of-days/BusiestTimesReportConfig'
import { BusiestTimeOfDaysMetrics } from 'domains/reporting/pages/support-performance/busiest-times-of-days/types'
import { getMetricQuery } from 'domains/reporting/pages/support-performance/busiest-times-of-days/utils'
import {
    busiestTimesSlice,
    initialState,
} from 'domains/reporting/state/ui/stats/busiestTimesSlice'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyAutomationPlan,
    basicYearlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    },
)
jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModal.tsx',
    () => ({
        DrillDownModal: () => null,
    }),
)
jest.mock('domains/reporting/pages/common/AnalyticsFooter.tsx')
const AnalyticsFooterMock = assumeMock(AnalyticsFooter)
jest.mock(
    'domains/reporting/pages/support-performance/busiest-times-of-days/BusiestTimesOfDaysTable',
)
const BusiestTimesOfDaysTableMock = assumeMock(BusiestTimesOfDaysTable)
jest.mock(
    'domains/reporting/pages/support-performance/busiest-times-of-days/BusiestTimesOfDaysDownloadDataButton',
)
const BusiestTimesOfDaysDownloadDataButtonMock = assumeMock(
    BusiestTimesOfDaysDownloadDataButton,
)
jest.mock('domains/reporting/hooks/useCleanStatsFilters')
const useCleanStatsFiltersMock = assumeMock(useCleanStatsFilters)
jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)
const ChartsActionMenuMock = assumeMock(ChartsActionMenu)
jest.mock('hooks/aiAgent/useAiAgentAccess')
const useAiAgentAccessMock = assumeMock(useAiAgentAccess)

const componentMock = () => <div />

describe('BusiestTimesOfDays page', () => {
    const defaultState = {
        ui: {
            stats: { [busiestTimesSlice.name]: initialState },
        },
        billing: fromJS(billingState),
    } as RootState

    beforeEach(() => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
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
