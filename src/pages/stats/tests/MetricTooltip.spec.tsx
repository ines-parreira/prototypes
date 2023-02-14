import React from 'react'
import {render} from '@testing-library/react'

import MetricTooltip from '../MetricTooltip'

describe('<MetricTooltip />', () => {
    it('should render the metric tooltip', () => {
        const {container} = render(
            <MetricTooltip title="Title">content</MetricTooltip>
        )

        expect(container).toMatchSnapshot()
    })
})
