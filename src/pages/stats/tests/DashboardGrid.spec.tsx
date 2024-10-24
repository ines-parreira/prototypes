import {render} from '@testing-library/react'
import React from 'react'

import DashboardGrid from '../DashboardGrid'

describe('<DashboardGrid />', () => {
    it('should render a grid', () => {
        const {container} = render(<DashboardGrid>content</DashboardGrid>)

        expect(container).toMatchSnapshot()
    })
})
