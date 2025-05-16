import { render, screen } from '@testing-library/react'

import { DrillDownModal } from 'pages/stats/common/drill-down/DrillDownModal'
import { OverviewPage } from 'pages/stats/voice-of-customer/overview/OverviewPage'
import { ProductInsightsPlaceholderReport } from 'pages/stats/voice-of-customer/product-insights/placeholder/ProducInsightsPlaceholderReport'
import { VoCSidePanel } from 'pages/stats/voice-of-customer/side-panel/VoCSidePanel'
import { VOICE_OF_CUSTOMER_SECTION_NAME } from 'pages/stats/voice-of-customer/utils'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/common/drill-down/DrillDownModal')
const DrillDownModalMock = assumeMock(DrillDownModal)
jest.mock(
    'pages/stats/voice-of-customer/product-insights/placeholder/ProducInsightsPlaceholderReport',
)
const ProductInsightsPlaceholderReportMock = assumeMock(
    ProductInsightsPlaceholderReport,
)
jest.mock('pages/stats/voice-of-customer/side-panel/VoCSidePanel')
const VoCSidePanelMock = assumeMock(VoCSidePanel)

describe('ProductInsightsPage', () => {
    beforeEach(() => {
        DrillDownModalMock.mockImplementation(() => <div />)
        ProductInsightsPlaceholderReportMock.mockImplementation(() => <div />)
        VoCSidePanelMock.mockImplementation(() => <div />)
    })

    it('should render with a title', () => {
        render(<OverviewPage />)

        expect(
            screen.queryByText(VOICE_OF_CUSTOMER_SECTION_NAME, {
                exact: false,
            }),
        ).toBeInTheDocument()

        expect(ProductInsightsPlaceholderReportMock).toHaveBeenCalled()
        expect(VoCSidePanelMock).toHaveBeenCalled()
    })
})
