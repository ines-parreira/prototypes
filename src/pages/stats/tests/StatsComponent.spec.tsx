import React from 'react'
import {render} from '@testing-library/react'

import StatsComponent from '../StatsComponent'

jest.mock('../StatsFilters.js', () => () => 'StatsFilters')
jest.mock('../Stats.js', () => () => 'Stats')

describe('<StatsComponent />', () => {
    it('should render', () => {
        const {container} = render(<StatsComponent />)

        expect(container.firstChild).toMatchSnapshot()
    })
})
