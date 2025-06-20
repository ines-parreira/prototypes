import { screen } from '@testing-library/react'

import { DrillDownModal } from 'pages/stats/common/drill-down/DrillDownModal'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import { PRODUCT_INSIGHTS_PAGE_TITLE } from 'pages/stats/voice-of-customer/product-insights/ProductInsightsPage'
import { VoiceOfCustomerNavbarView } from 'pages/stats/voice-of-customer/VoiceOfCustomerNavbarView'
import { assumeMock, renderWithRouterAndDnD } from 'utils/testing'

jest.mock('pages/stats/common/drill-down/DrillDownModal')
const DrillDownModalMock = assumeMock(DrillDownModal)
jest.mock('pages/stats/report-chart-restrictions/useReportChartRestrictions')
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

describe('VoiceOfCustomerNavbarView', () => {
    beforeEach(() => {
        DrillDownModalMock.mockImplementation(() => <div />)
        useReportChartRestrictionsMock.mockReturnValue({
            isChartRestrictedToCurrentUser: () => false,
            isReportRestrictedToCurrentUser: () => false,
            isRouteRestrictedToCurrentUser: () => false,
            isModuleRestrictedToCurrentUser: () => false,
        })
    })

    it('should render without crashing', () => {
        renderWithRouterAndDnD(<VoiceOfCustomerNavbarView />)

        expect(
            screen.getByText(PRODUCT_INSIGHTS_PAGE_TITLE),
        ).toBeInTheDocument()
    })
})
