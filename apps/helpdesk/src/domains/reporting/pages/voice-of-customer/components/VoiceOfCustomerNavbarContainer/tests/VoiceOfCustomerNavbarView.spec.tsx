import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'

import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import { VoiceOfCustomerNavbarView } from 'domains/reporting/pages/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerNavbarView'
import { PRODUCT_INSIGHTS_PAGE_TITLE } from 'domains/reporting/pages/voice-of-customer/product-insights/ProductInsightsPage'
import { renderWithRouterAndDnD } from 'utils/testing'

jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal')
const DrillDownModalMock = assumeMock(DrillDownModal)
jest.mock(
    'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions',
)
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
