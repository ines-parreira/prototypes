import React from 'react'

import { render } from '@repo/testing'

import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'

describe('<DashboardGridCell />', () => {
    it('should render a cell', () => {
        const { container } = render(
            <DashboardGridCell>content</DashboardGridCell>,
        )

        expect(container).toMatchSnapshot()
    })
})
