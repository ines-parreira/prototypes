import React from 'react'

import { render } from '@testing-library/react'

import RevenueStatsRestrictedFeature from 'domains/reporting/pages/support-performance/components/RevenueStatsRestrictedFeature'

describe('<RevenueStatsRestrictedFeature />', () => {
    it('should render the restricted feature screen', () => {
        const { container } = render(<RevenueStatsRestrictedFeature />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
