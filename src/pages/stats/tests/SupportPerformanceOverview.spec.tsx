import React from 'react'
import {render} from '@testing-library/react'

import SupportPerformanceOverview from '../SupportPerformanceOverview'

describe('<SupportPerformanceOverview />', () => {
    it('should render the page', () => {
        const {container} = render(<SupportPerformanceOverview />)

        expect(container.firstChild).toMatchSnapshot()
    })
})
