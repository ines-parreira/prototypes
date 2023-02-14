import React from 'react'
import {render} from '@testing-library/react'

import MetricContent from '../MetricContent'

describe('<MetricContent />', () => {
    it('should render the metric content', () => {
        const {container} = render(<MetricContent>content</MetricContent>)

        expect(container).toMatchSnapshot()
    })

    it('should render the metric content from a value', () => {
        const {container} = render(
            <MetricContent from="previous content">content</MetricContent>
        )

        expect(container).toMatchSnapshot()
    })
})
