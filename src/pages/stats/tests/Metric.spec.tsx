import React from 'react'
import {render} from '@testing-library/react'

import Metric from '../Metric'

describe('<Metric />', () => {
    it('should render the metric', () => {
        const {container} = render(
            <Metric hint="metric hint" title="Metric title">
                Metric
            </Metric>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
