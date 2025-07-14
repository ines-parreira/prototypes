import React from 'react'

import { render } from '@testing-library/react'

import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'

describe('<DashboardGridCell />', () => {
    it('should render a cell', () => {
        const { container } = render(
            <DashboardGridCell>content</DashboardGridCell>,
        )

        expect(container).toMatchSnapshot()
    })
})
