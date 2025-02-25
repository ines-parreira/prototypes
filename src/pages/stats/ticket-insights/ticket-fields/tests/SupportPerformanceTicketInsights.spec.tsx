import React, { ComponentProps } from 'react'

import { UseQueryResult } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { CustomField } from 'custom-fields/types'
import useAppSelector from 'hooks/useAppSelector'
import { ApiListResponseCursorPagination } from 'models/api/types'
import { AUTO_QA_FILTER_KEYS } from 'pages/stats/common/filters/constants'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { DrillDownModal } from 'pages/stats/DrillDownModal'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import { SupportPerformanceFilters } from 'pages/stats/support-performance/SupportPerformanceFilters'
import { CustomFieldSelect } from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'
import { CustomFieldsTicketCountBreakdownTableChart } from 'pages/stats/ticket-insights/ticket-fields/CustomFieldsTicketCountBreakdownTableChart'
import { DownloadTicketFieldsDataButton } from 'pages/stats/ticket-insights/ticket-fields/DownloadTicketFieldsDataButton'
import { SupportPerformanceTicketInsights } from 'pages/stats/ticket-insights/ticket-fields/SupportPerformanceTicketInsights'
import { TicketDistributionChart } from 'pages/stats/ticket-insights/ticket-fields/TicketDistributionTable'
import { TicketFieldsBlankState } from 'pages/stats/ticket-insights/ticket-fields/TicketFieldsBlankState'
import {
    TICKET_INSIGHTS_OPTIONAL_FILTERS,
    TICKET_INSIGHTS_PAGE_TITLE,
} from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldsReportConfig'
import { TicketInsightsFieldTrend } from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldTrend'
import { initialState } from 'state/stats/statsSlice'
import { RootState, StoreDispatch } from 'state/types'
import {
    ticketInsightsSlice,
    initialState as ticketInsightsState,
} from 'state/ui/stats/ticketInsightsSlice'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/report-chart-restrictions/useReportChartRestrictions')
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

jest.mock('pages/stats/support-performance/SupportPerformanceFilters.tsx')
const SupportPerformanceFiltersMock = assumeMock(SupportPerformanceFilters)
jest.mock(
    'pages/stats/common/filters/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    },
)
jest.mock('pages/stats/ticket-insights/ticket-fields/CustomFieldSelect.tsx')
const CustomFieldSelectMock = assumeMock(CustomFieldSelect)
jest.mock(
    'pages/stats/ticket-insights/ticket-fields/TicketDistributionTable.tsx',
)
const TicketDistributionTableMock = assumeMock(TicketDistributionChart)
jest.mock(
    'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldTrend.tsx',
)
const TicketInsightsFieldTrendMock = assumeMock(TicketInsightsFieldTrend)
jest.mock(
    'pages/stats/ticket-insights/ticket-fields/DownloadTicketFieldsDataButton.tsx',
)
const DownloadTicketFieldsDataButtonMock = assumeMock(
    DownloadTicketFieldsDataButton,
)
jest.mock(
    'pages/stats/ticket-insights/ticket-fields/TicketFieldsBlankState.tsx',
)
const TicketFieldsBlankStateMock = assumeMock(TicketFieldsBlankState)
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)
jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = assumeMock(useAppSelector)
jest.mock(
    'pages/stats/ticket-insights/ticket-fields/CustomFieldsTicketCountBreakdownTableChart.tsx',
)
const CustomFieldsTicketCountBreakdownTableChartMock = assumeMock(
    CustomFieldsTicketCountBreakdownTableChart,
)
jest.mock('pages/stats/DrillDownModal')
const DrillDownModalMock = assumeMock(DrillDownModal)
const componentMock = () => <div />

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<SupportPerformanceTicketInsights />', () => {
    const defaultState = {
        stats: initialState,
        ui: {
            [ticketInsightsSlice.name]: ticketInsightsState,
        },
    } as unknown as RootState

    const useCustomFieldDefinitionsMockReturnValue = {
        data: { data: [] },
        isLoading: false,
    } as unknown as UseQueryResult<
        ApiListResponseCursorPagination<CustomField[]>
    >

    useCustomFieldDefinitionsMock.mockReturnValue(
        useCustomFieldDefinitionsMockReturnValue,
    )
    useAppSelectorMock.mockReturnValue({ id: 1 })

    beforeEach(() => {
        useReportChartRestrictionsMock.mockReturnValue({
            isChartRestrictedToCurrentUser: () => false,
        } as any)

        SupportPerformanceFiltersMock.mockImplementation(componentMock)
        CustomFieldSelectMock.mockImplementation(componentMock)
        TicketDistributionTableMock.mockImplementation(componentMock)
        TicketInsightsFieldTrendMock.mockImplementation(componentMock)
        CustomFieldsTicketCountBreakdownTableChartMock.mockImplementation(
            componentMock,
        )
        TicketFieldsBlankStateMock.mockImplementation(componentMock)
        DownloadTicketFieldsDataButtonMock.mockImplementation(componentMock)
        DrillDownModalMock.mockImplementation(componentMock)

        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: false,
        })
    })

    it('should render the page title', () => {
        const { getByText } = render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTicketInsights />
            </Provider>,
        )
        const title = getByText(TICKET_INSIGHTS_PAGE_TITLE)

        expect(title).toBeInTheDocument()
    })

    it('should render the Filters', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTicketInsights />
            </Provider>,
        )

        expect(SupportPerformanceFiltersMock).toHaveBeenCalled()
    })

    it('should render the Filters Panel when behind the flag', () => {
        mockFlags({ [FeatureFlagKey.AnalyticsNewFilters]: true })

        const { getByText } = render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTicketInsights />
            </Provider>,
        )

        TICKET_INSIGHTS_OPTIONAL_FILTERS.forEach((filter) => {
            expect(getByText(filter)).toBeInTheDocument()
        })
    })

    it('should render the Filters Panel with default optional filters and a Score filter', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
        })
        const extendedTicketInsightsOptionalFilters = [
            ...TICKET_INSIGHTS_OPTIONAL_FILTERS,
        ]

        const { getByText } = render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTicketInsights />
            </Provider>,
        )

        extendedTicketInsightsOptionalFilters.forEach((filter) => {
            expect(getByText(filter)).toBeInTheDocument()
        })
    })

    it('should render the Filters Panel with default optional filters and a Resolution Completeness and Communication Skills filters', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
        })
        const extendedTicketInsightsOptionalFilters = [
            ...TICKET_INSIGHTS_OPTIONAL_FILTERS,
            ...AUTO_QA_FILTER_KEYS,
        ]

        const { getByText } = render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTicketInsights />
            </Provider>,
        )

        extendedTicketInsightsOptionalFilters.forEach((filter) => {
            expect(getByText(filter)).toBeInTheDocument()
        })
    })

    it('should render the CustomFieldSelect', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTicketInsights />
            </Provider>,
        )

        expect(CustomFieldSelectMock).toHaveBeenCalled()
    })

    it('should render the TicketDistributionTable', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTicketInsights />
            </Provider>,
        )

        expect(TicketDistributionTableMock).toHaveBeenCalled()
    })

    it('should render the TicketInsightsFieldTrend', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTicketInsights />
            </Provider>,
        )

        expect(TicketInsightsFieldTrendMock).toHaveBeenCalled()
    })

    it('should render the TicketFieldsBlankStateMock', () => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            ...useCustomFieldDefinitionsMockReturnValue,
            isLoading: false,
        } as unknown as UseQueryResult<
            ApiListResponseCursorPagination<CustomField[]>
        >)
        useAppSelectorMock.mockReturnValue({ id: null, isLoading: false })

        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTicketInsights />
            </Provider>,
        )

        expect(TicketFieldsBlankStateMock).toHaveBeenCalled()
    })

    it('should render only the CustomFieldSelect', () => {
        useAppSelectorMock.mockReturnValue({ id: null, isLoading: false })

        useCustomFieldDefinitionsMock.mockReturnValue({
            ...useCustomFieldDefinitionsMockReturnValue,
            isLoading: true,
        } as unknown as UseQueryResult<
            ApiListResponseCursorPagination<CustomField[]>
        >)

        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTicketInsights />
            </Provider>,
        )

        expect(TicketDistributionTableMock).not.toHaveBeenCalled()
        expect(TicketInsightsFieldTrendMock).not.toHaveBeenCalled()
    })

    it('should render the CustomFieldsTicketCountBreakdownTableChart', () => {
        render(<CustomFieldsTicketCountBreakdownTableChart />)

        expect(
            CustomFieldsTicketCountBreakdownTableChartMock,
        ).toHaveBeenCalled()
    })
})
