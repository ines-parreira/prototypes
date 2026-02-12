import type { ComponentProps } from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import type { CustomField } from 'custom-fields/types'
import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import { AUTO_QA_FILTER_KEYS } from 'domains/reporting/pages/common/filters/constants'
import type FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import { CustomFieldsTicketCountBreakdownTableChart } from 'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldsTicketCountBreakdownTableChart'
import { SupportPerformanceTicketInsights } from 'domains/reporting/pages/ticket-insights/ticket-fields/SupportPerformanceTicketInsights'
import { TicketDistributionChart } from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketDistributionTable'
import { TicketFieldsActionMenu } from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketFieldsActionMenu'
import { TicketFieldsBlankState } from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketFieldsBlankState'
import {
    TICKET_INSIGHTS_OPTIONAL_FILTERS,
    TICKET_INSIGHTS_PAGE_TITLE,
} from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketInsightsFieldsReportConfig'
import { TicketInsightsFieldTrend } from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketInsightsFieldTrend'
import { useCustomFieldsReportData } from 'domains/reporting/services/ticketFieldsReportingService'
import { initialState } from 'domains/reporting/state/stats/statsSlice'
import {
    ticketInsightsSlice,
    initialState as ticketInsightsState,
} from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import useAppSelector from 'hooks/useAppSelector'
import type { RootState, StoreDispatch } from 'state/types'

jest.mock(
    'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions',
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    },
)
jest.mock(
    'domains/reporting/pages/ticket-insights/ticket-fields/TicketDistributionTable.tsx',
)
const TicketDistributionTableMock = assumeMock(TicketDistributionChart)
jest.mock(
    'domains/reporting/pages/ticket-insights/ticket-fields/TicketInsightsFieldTrend.tsx',
)
const TicketInsightsFieldTrendMock = assumeMock(TicketInsightsFieldTrend)
jest.mock(
    'domains/reporting/pages/ticket-insights/ticket-fields/TicketFieldsBlankState.tsx',
)
const TicketFieldsBlankStateMock = assumeMock(TicketFieldsBlankState)
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)
jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = assumeMock(useAppSelector)
jest.mock(
    'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldsTicketCountBreakdownTableChart.tsx',
)
const CustomFieldsTicketCountBreakdownTableChartMock = assumeMock(
    CustomFieldsTicketCountBreakdownTableChart,
)
jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal')
const DrillDownModalMock = assumeMock(DrillDownModal)
const componentMock = jest.fn(() => <div />)
jest.mock('domains/reporting/services/ticketFieldsReportingService')
const useCustomFieldsReportDataMock = assumeMock(useCustomFieldsReportData)
jest.mock(
    'domains/reporting/pages/ticket-insights/ticket-fields/TicketFieldsActionMenu',
)
const TicketFieldsActionMenuMock = assumeMock(TicketFieldsActionMenu)
const downloadActionMock = jest.fn()

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<SupportPerformanceTicketInsights />', () => {
    const defaultState = {
        stats: initialState,
        ui: {
            [ticketInsightsSlice.name]: ticketInsightsState,
        },
    } as unknown as RootState

    const useCustomFieldDefinitionsMockReturnValue = {
        data: { data: [] as CustomField[] },
        isLoading: false,
    } as ReturnType<typeof useCustomFieldDefinitions>

    useCustomFieldDefinitionsMock.mockReturnValue(
        useCustomFieldDefinitionsMockReturnValue,
    )
    useAppSelectorMock.mockReturnValue({ id: 1 })

    beforeEach(() => {
        useReportChartRestrictionsMock.mockReturnValue({
            isChartRestrictedToCurrentUser: () => false,
        } as any)
        TicketDistributionTableMock.mockImplementation(componentMock)
        TicketInsightsFieldTrendMock.mockImplementation(componentMock)
        CustomFieldsTicketCountBreakdownTableChartMock.mockImplementation(
            componentMock,
        )
        TicketFieldsBlankStateMock.mockImplementation(componentMock)
        DrillDownModalMock.mockImplementation(componentMock)
        TicketFieldsActionMenuMock.mockImplementation(componentMock)
        useCustomFieldsReportDataMock.mockReturnValue({
            download: downloadActionMock,
            isLoading: false,
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

    it('should render the Filters Panel when behind the flag', () => {
        const { getByText } = render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTicketInsights />
            </Provider>,
        )

        TICKET_INSIGHTS_OPTIONAL_FILTERS.forEach((filter) => {
            expect(getByText(filter)).toBeInTheDocument()
        })
    })

    it('should render TicketFieldsActionMenu', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTicketInsights />
            </Provider>,
        )

        expect(TicketFieldsActionMenuMock).toHaveBeenCalled()
    })

    it('should render the Filters Panel with default optional filters and a Score filter', () => {
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
        } as ReturnType<typeof useCustomFieldDefinitions>)
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
        } as ReturnType<typeof useCustomFieldDefinitions>)

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
