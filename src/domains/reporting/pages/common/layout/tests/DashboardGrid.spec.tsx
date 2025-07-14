import React from 'react'

import { render } from '@testing-library/react'

import DashboardGrid from 'domains/reporting/pages/common/layout/DashboardGrid'

describe('<DashboardGrid />', () => {
    it('should render a grid', () => {
        const { container } = render(<DashboardGrid>content</DashboardGrid>)

        expect(container).toMatchSnapshot()
    })
})
