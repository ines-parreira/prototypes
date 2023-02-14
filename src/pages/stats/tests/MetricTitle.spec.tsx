import React from 'react'
import {render} from '@testing-library/react'

import MetricTitle from '../MetricTitle'
import TrendBadge from '../TrendBadge'

describe('<MetricTitle />', () => {
    it('should render the metric title', () => {
        const {container} = render(<MetricTitle>content</MetricTitle>)

        expect(container).toMatchSnapshot()
    })

    it('should render the metric title with a hint', () => {
        const {container} = render(
            <MetricTitle hint="hint">content</MetricTitle>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render the metric title with a badge', () => {
        const {container} = render(
            <MetricTitle trendBadge={<TrendBadge type="up">123</TrendBadge>}>
                content
            </MetricTitle>
        )

        expect(container).toMatchSnapshot()
    })
})
