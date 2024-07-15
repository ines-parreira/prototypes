import {screen} from '@testing-library/react'
import React from 'react'
import AutoQA, {
    AUTO_QA_PAGE_TITLE,
} from 'pages/stats/support-performance/auto-qa/AutoQA'
import {renderWithStore} from 'utils/testing'

jest.mock('pages/stats/SupportPerformanceFilters', () => ({
    SupportPerformanceFilters: () => <div />,
}))
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

describe('AutoQA', () => {
    it('should render page title', () => {
        renderWithStore(<AutoQA />, {})

        expect(screen.getByText(AUTO_QA_PAGE_TITLE)).toBeInTheDocument()
    })
})
