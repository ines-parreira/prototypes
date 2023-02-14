import React from 'react'
import {render} from '@testing-library/react'

import MetricTooltip from '../MetricTooltip'

describe('<MetricTooltip />', () => {
    it('should render the metric tooltip', () => {
        const {container} = render(
            <MetricTooltip title="Tooltip title" type="light-warning">
                MetricTooltip
            </MetricTooltip>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
