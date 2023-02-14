import React from 'react'
import {render} from '@testing-library/react'

import TrendBadge from '../TrendBadge'

describe('<TrendBadge />', () => {
    it('should render the badge', () => {
        const {container} = render(<TrendBadge>value</TrendBadge>)

        expect(container).toMatchSnapshot()
    })
})
