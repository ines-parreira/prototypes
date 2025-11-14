import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import RevenueStatsRestrictedFeature from 'domains/reporting/pages/support-performance/components/RevenueStatsRestrictedFeature'

describe('<RevenueStatsRestrictedFeature />', () => {
    it('should render the restricted feature screen', () => {
        const { container } = render(
            <MemoryRouter>
                <RevenueStatsRestrictedFeature />
            </MemoryRouter>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
