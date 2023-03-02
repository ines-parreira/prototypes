import React from 'react'
import {render} from '@testing-library/react'

import BigNumberMetric from '../BigNumberMetric'

describe('<BigNumberMetric />', () => {
    it('should render the number metric', () => {
        const {container} = render(<BigNumberMetric>content</BigNumberMetric>)

        expect(container).toMatchSnapshot()
    })

    it('should render the number metric content from a value', () => {
        const {container} = render(
            <BigNumberMetric from="previous content">content</BigNumberMetric>
        )

        expect(container).toMatchSnapshot()
    })
})
