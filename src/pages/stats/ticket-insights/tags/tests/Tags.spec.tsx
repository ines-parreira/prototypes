import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'

import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyAutomationPlan,
    basicYearlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import {AUTO_QA_FILTER_KEYS} from 'pages/stats/common/filters/constants'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import {AllUsedTagsTableChart} from 'pages/stats/ticket-insights/tags/AllUsedTagsTableChart'
import {Tags} from 'pages/stats/ticket-insights/tags/Tags'
import {
    TAGS_TITLE,
    TAGS_OPTIONAL_FILTERS,
} from 'pages/stats/ticket-insights/tags/TagsReportConfig'
import {TagsReportDownloadDataButton} from 'pages/stats/ticket-insights/tags/TagsReportDownloadDataButton'
import {TagsTrendChart} from 'pages/stats/ticket-insights/tags/TagsTrendChart'
import {TopUsedTagsChart} from 'pages/stats/ticket-insights/tags/TopUsedTagsChart'
import {defaultStatsFilters} from 'state/stats/statsSlice'
import {fromLegacyStatsFilters} from 'state/stats/utils'
import {RootState} from 'state/types'
import {drillDownSlice, initialState} from 'state/ui/stats/drillDownSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/filtersSlice'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock(
    'pages/stats/common/filters/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    }
)
jest.mock('pages/stats/ticket-insights/tags/TagsTrendChart')
const TagsTrendChartMock = assumeMock(TagsTrendChart)
jest.mock('pages/stats/ticket-insights/tags/TopUsedTagsChart')
const TopUsedTagsChartMock = assumeMock(TopUsedTagsChart)
jest.mock('pages/stats/ticket-insights/tags/AllUsedTagsTableChart')
const allUsedTagsTableChartMock = assumeMock(AllUsedTagsTableChart)
jest.mock('pages/stats/ticket-insights/tags/TagsReportDownloadDataButton')
const TagsReportDownloadDataButtonMock = assumeMock(
    TagsReportDownloadDataButton
)

const componentMock = () => <div />

describe('<Tags>', () => {
    const defaultState = {
        stats: {
            filters: fromLegacyStatsFilters(defaultStatsFilters),
        },
        ui: {
            stats: {
                filters: uiStatsInitialState,
                [drillDownSlice.name]: initialState,
            },
        },
        billing: fromJS(billingState),
    } as RootState

    beforeEach(() => {
        allUsedTagsTableChartMock.mockImplementation(componentMock)
        TagsTrendChartMock.mockImplementation(componentMock)
        TopUsedTagsChartMock.mockImplementation(componentMock)
        TagsReportDownloadDataButtonMock.mockImplementation(componentMock)
    })

    it('should render new tags page', () => {
        const {getByText} = renderWithStore(<Tags />, defaultState)

        expect(getByText(TAGS_TITLE)).toBeInTheDocument()
    })

    it('should contain filters panel component', () => {
        const {getByText} = renderWithStore(<Tags />, defaultState)

        TAGS_OPTIONAL_FILTERS.forEach((optionalFilter) => {
            expect(getByText(optionalFilter)).toBeInTheDocument()
        })
    })

    it('should contain filters panel component and Score filter should be one of the optional filters', () => {
        const extendedTagsOptionalFilters = [...TAGS_OPTIONAL_FILTERS]
        const {getByText} = renderWithStore(<Tags />, defaultState)

        extendedTagsOptionalFilters.forEach((optionalFilter) => {
            expect(getByText(optionalFilter)).toBeInTheDocument()
        })
    })

    it('should contain filters panel component and Resolution Completeness and Communication Skills filters should be one of the optional filters', () => {
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
        const extendedTagsOptionalFilters = [
            ...TAGS_OPTIONAL_FILTERS,
            ...AUTO_QA_FILTER_KEYS,
        ]
        const {getByText} = renderWithStore(<Tags />, state)

        extendedTagsOptionalFilters.forEach((optionalFilter) => {
            expect(getByText(optionalFilter)).toBeInTheDocument()
        })
    })

    it('should render the TopUsedTagsChart', () => {
        renderWithStore(<Tags />, defaultState)

        expect(TopUsedTagsChartMock).toHaveBeenCalled()
    })

    it('should contain AllUsedTagsTableChart component', () => {
        renderWithStore(<Tags />, defaultState)

        expect(allUsedTagsTableChartMock).toHaveBeenCalled()
    })
})
