import React from 'react'
import {render} from '@testing-library/react'

import LegacyPlanBadge from '../LegacyPlanBadge'

describe('<LegacyPlanBadge />', () => {
    it('should render a badge', () => {
        const {container} = render(<LegacyPlanBadge />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
