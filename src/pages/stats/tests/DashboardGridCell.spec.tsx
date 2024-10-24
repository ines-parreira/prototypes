import {render} from '@testing-library/react'
import React from 'react'

import DashboardGridCell from '../DashboardGridCell'

describe('<DashboardGridCell />', () => {
    it('should render a cell', () => {
        const {container} = render(
            <DashboardGridCell>content</DashboardGridCell>
        )

        expect(container).toMatchSnapshot()
    })
})
