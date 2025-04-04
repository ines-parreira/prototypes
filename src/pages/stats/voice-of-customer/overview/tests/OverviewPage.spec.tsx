import { render, screen } from '@testing-library/react'

import { DrillDownModal } from 'pages/stats/common/drill-down/DrillDownModal'
import {
    OVERVIEW_PAGE_TITLE,
    OverviewPage,
} from 'pages/stats/voice-of-customer/overview/OverviewPage'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/common/drill-down/DrillDownModal')
const DrillDownModalMock = assumeMock(DrillDownModal)

describe('ProductInsightsPage', () => {
    beforeEach(() => {
        DrillDownModalMock.mockImplementation(() => <div />)
    })

    it('should render with a title', () => {
        render(<OverviewPage />)

        expect(
            screen.queryByText(OVERVIEW_PAGE_TITLE, { exact: false }),
        ).toBeInTheDocument()
    })
})
