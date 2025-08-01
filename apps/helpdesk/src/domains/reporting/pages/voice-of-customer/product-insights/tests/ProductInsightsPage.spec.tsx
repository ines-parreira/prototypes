import React from 'react'

import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { UserRole } from 'config/types/user'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import { TicketVolumeTable } from 'domains/reporting/pages/voice-of-customer/charts/ChangeInTicketVolumeChart/TicketVolumeTable'
import { ProductInsightsTableChart } from 'domains/reporting/pages/voice-of-customer/charts/ProductInsightsTableChart/ProductInsightsTableChart'
import { TopAIIntentsOverTimeChart } from 'domains/reporting/pages/voice-of-customer/charts/TopAIIntentsOverTimeChart/TopAIIntentsOverTimeChart'
import { TopProductsPerAIIntentChart } from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntentChart'
import { TotalTicketSentimentOverTimeChart } from 'domains/reporting/pages/voice-of-customer/charts/TotalTicketSentimentOverTimeChart/TotalTicketSentimentOverTimeChart'
import { VoCSidePanel } from 'domains/reporting/pages/voice-of-customer/components/VoCSidePanel/VoCSidePanel'
import {
    PRODUCT_INSIGHTS_PAGE_TITLE,
    ProductInsightsPage,
} from 'domains/reporting/pages/voice-of-customer/product-insights/ProductInsightsPage'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { renderWithStore } from 'utils/testing'

jest.mock('domains/reporting/hooks/useCleanStatsFilters')
jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal')
const DrillDownModalMock = assumeMock(DrillDownModal)
jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
)
const FiltersPanelWrapperMock = assumeMock(FiltersPanelWrapper)
jest.mock(
    'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions',
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)
jest.mock(
    'domains/reporting/pages/voice-of-customer/charts/TopAIIntentsOverTimeChart/TopAIIntentsOverTimeChart',
)
const TopAIIntentsOverTimeChartMock = assumeMock(TopAIIntentsOverTimeChart)
jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)
const ChartsActionMenuMock = assumeMock(ChartsActionMenu)
jest.mock(
    'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntentChart',
)
const TopProductsPerAIIntentChartMock = assumeMock(TopProductsPerAIIntentChart)
jest.mock(
    'domains/reporting/pages/voice-of-customer/charts/TotalTicketSentimentOverTimeChart/TotalTicketSentimentOverTimeChart',
)
const TotalTicketSentimentOverTimeChartMock = assumeMock(
    TotalTicketSentimentOverTimeChart,
)
jest.mock(
    'domains/reporting/pages/voice-of-customer/charts/ChangeInTicketVolumeChart/TicketVolumeTable',
)
const TicketVolumeTableMock = assumeMock(TicketVolumeTable)
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
const useGetCustomTicketsFieldsDefinitionDataMock = assumeMock(
    useGetCustomTicketsFieldsDefinitionData,
)
jest.mock(
    'domains/reporting/pages/voice-of-customer/charts/ProductInsightsTableChart/ProductInsightsTableChart',
)
const ProductInsightsTableChartMock = assumeMock(ProductInsightsTableChart)
jest.mock(
    'domains/reporting/pages/voice-of-customer/components/VoCSidePanel/VoCSidePanel',
)
const VoCSidePanelMock = assumeMock(VoCSidePanel)

describe('ProductInsightsPage', () => {
    const statsFilters = {
        period: {
            start_datetime: '2024-09-14T00:00:00+00:00',
            end_datetime: '2024-09-20T23:59:59+00:00',
        },
    }
    const state = {
        currentUser: fromJS({ role: { name: UserRole.Admin } }),
    }

    beforeEach(() => {
        TotalTicketSentimentOverTimeChartMock.mockImplementation(() => <div />)
        TopProductsPerAIIntentChartMock.mockImplementation(() => <div />)
        DrillDownModalMock.mockImplementation(() => <div />)
        ChartsActionMenuMock.mockImplementation(() => <div />)
        FiltersPanelWrapperMock.mockImplementation(() => <div />)
        TopAIIntentsOverTimeChartMock.mockImplementation(() => <div />)
        TicketVolumeTableMock.mockImplementation(() => <div />)
        ProductInsightsTableChartMock.mockImplementation(() => <div />)
        VoCSidePanelMock.mockImplementation(() => <div />)
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
        useReportChartRestrictionsMock.mockImplementation(() => ({
            isRouteRestrictedToCurrentUser: () => false,
            isReportRestrictedToCurrentUser: () => false,
            isChartRestrictedToCurrentUser: () => false,
            isModuleRestrictedToCurrentUser: () => false,
        }))
        useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
            sentimentCustomFieldId: 123,
        } as any)
    })

    it('should render with a title', () => {
        renderWithStore(<ProductInsightsPage />, state)

        expect(
            screen.queryByText(PRODUCT_INSIGHTS_PAGE_TITLE, { exact: false }),
        ).toBeTruthy()
    })

    it('should render children charts', () => {
        renderWithStore(<ProductInsightsPage />, state)

        expect(DrillDownModalMock).toHaveBeenCalled()
        expect(FiltersPanelWrapperMock).toHaveBeenCalled()
        expect(TopAIIntentsOverTimeChartMock).toHaveBeenCalled()
        expect(ProductInsightsTableChartMock).toHaveBeenCalled()
    })
})
