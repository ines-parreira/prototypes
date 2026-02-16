import { render, screen } from '@testing-library/react'

import { AnalyticsSidebar } from '../sidebars/AnalyticsSidebar'

jest.mock(
    'domains/reporting/pages/common/components/StatsNavbarView/StatsNavbarView',
    () => ({
        StatsNavbarView: () => <div>StatsNavbarView</div>,
    }),
)

describe('AnalyticsSidebar', () => {
    it('should render StatsNavbarView component', () => {
        render(<AnalyticsSidebar />)
        const navbar = screen.getByText('StatsNavbarView')
        expect(navbar).toBeInTheDocument()
    })
})
