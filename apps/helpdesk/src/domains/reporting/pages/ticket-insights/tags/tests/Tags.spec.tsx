import { ComponentProps } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { fromJS } from 'immutable'

import { useFlag } from 'core/flags'
import { AUTO_QA_FILTER_KEYS } from 'domains/reporting/pages/common/filters/constants'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { AllUsedTagsTableChart } from 'domains/reporting/pages/ticket-insights/tags/AllUsedTagsTableChart'
import { Tags } from 'domains/reporting/pages/ticket-insights/tags/Tags'
import { TagsActionMenu } from 'domains/reporting/pages/ticket-insights/tags/TagsActionMenu'
import {
    TAGS_OPTIONAL_FILTERS,
    TAGS_TITLE,
} from 'domains/reporting/pages/ticket-insights/tags/TagsReportConfig'
import { TagsReportDownloadDataButton } from 'domains/reporting/pages/ticket-insights/tags/TagsReportDownloadDataButton'
import { TagsTrendChart } from 'domains/reporting/pages/ticket-insights/tags/TagsTrendChart'
import { TopUsedTagsChart } from 'domains/reporting/pages/ticket-insights/tags/TopUsedTagsChart'
import { useDownloadTagsReportData } from 'domains/reporting/services/tagsReportingService'
import { defaultStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import { fromLegacyStatsFilters } from 'domains/reporting/state/stats/utils'
import {
    drillDownSlice,
    initialState,
} from 'domains/reporting/state/ui/stats/drillDownSlice'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyAutomationPlan,
    basicYearlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock('core/flags')
const useFlagsMock = assumeMock(useFlag)

jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    },
)
jest.mock('domains/reporting/pages/ticket-insights/tags/TagsTrendChart')
const TagsTrendChartMock = assumeMock(TagsTrendChart)
jest.mock('domains/reporting/pages/ticket-insights/tags/TopUsedTagsChart')
const TopUsedTagsChartMock = assumeMock(TopUsedTagsChart)
jest.mock('domains/reporting/pages/ticket-insights/tags/AllUsedTagsTableChart')
const allUsedTagsTableChartMock = assumeMock(AllUsedTagsTableChart)
jest.mock(
    'domains/reporting/pages/ticket-insights/tags/TagsReportDownloadDataButton',
)
const TagsReportDownloadDataButtonMock = assumeMock(
    TagsReportDownloadDataButton,
)
jest.mock('domains/reporting/pages/ticket-insights/tags/TagsActionMenu')
const TagsActionMenuMock = assumeMock(TagsActionMenu)
jest.mock('domains/reporting/services/tagsReportingService')
const useDownloadTagsReportDataMock = assumeMock(useDownloadTagsReportData)

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
        TagsActionMenuMock.mockImplementation(componentMock)
        useFlagsMock.mockReturnValue(false)
        useDownloadTagsReportDataMock.mockReturnValue({
            download: jest.fn(),
            isLoading: false,
        })
    })

    it('should render new tags page', () => {
        const { getByText } = renderWithStore(<Tags />, defaultState)

        expect(getByText(TAGS_TITLE)).toBeInTheDocument()
    })

    it('should contain filters panel component', () => {
        const { getByText } = renderWithStore(<Tags />, defaultState)

        TAGS_OPTIONAL_FILTERS.forEach((optionalFilter) => {
            expect(getByText(optionalFilter)).toBeInTheDocument()
        })
    })

    it('should contain filters panel component and Score filter should be one of the optional filters', () => {
        const extendedTagsOptionalFilters = [...TAGS_OPTIONAL_FILTERS]
        const { getByText } = renderWithStore(<Tags />, defaultState)

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
        const { getByText } = renderWithStore(<Tags />, state)

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

    it('should render TagActionsMenu when feature flag is enabled', () => {
        useFlagsMock.mockImplementation((flag) => {
            if (
                flag ===
                FeatureFlagKey.ReportingFilteringAndCalculationsTagsReport
            )
                return true
            return false
        })

        renderWithStore(<Tags />, defaultState)

        expect(TagsActionMenuMock).toHaveBeenCalled()
        expect(TagsReportDownloadDataButtonMock).not.toHaveBeenCalled()
    })

    it('should render TagsReportDownloadDataButton when feature flag is disabled', () => {
        useFlagsMock.mockReturnValue(false)

        renderWithStore(<Tags />, defaultState)

        expect(TagsActionMenuMock).not.toHaveBeenCalled()
        expect(TagsReportDownloadDataButtonMock).toHaveBeenCalled()
    })
})
