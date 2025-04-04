import { render, screen } from '@testing-library/react'

import { DrillDownModal } from 'pages/stats/common/drill-down/DrillDownModal'
import {
    PRODUCT_INSIGHTS_PAGE_TITLE,
    ProductInsightsPage,
} from 'pages/stats/voice-of-customer/product-insights/ProductInsightsPage'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/common/drill-down/DrillDownModal')
const DrillDownModalMock = assumeMock(DrillDownModal)

describe('ProductInsightsPage', () => {
    beforeEach(() => {
        DrillDownModalMock.mockImplementation(() => <div />)
    })

    it('should render with a title', () => {
        render(<ProductInsightsPage />)

        expect(
            screen.queryByText(PRODUCT_INSIGHTS_PAGE_TITLE, { exact: false }),
        ).toBeInTheDocument()
    })
})
