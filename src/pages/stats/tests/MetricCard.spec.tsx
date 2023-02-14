import React from 'react'
import {render} from '@testing-library/react'

import MetricCard from '../MetricCard'

describe('<MetricCard />', () => {
    it('should render the card', () => {
        const {container} = render(<MetricCard>MetricCard</MetricCard>)

        expect(container.firstChild).toMatchSnapshot()
    })
})
