import React from 'react'

import { render } from '@repo/testing'

import { BigNumberMetric } from 'domains/reporting/pages/common/components/BigNumberMetric'

describe('<BigNumberMetric />', () => {
    it('should render the number metric', () => {
        const { container } = render(<BigNumberMetric>content</BigNumberMetric>)

        expect(container).toMatchSnapshot()
    })

    it('should render the number metric content from a value', () => {
        const { container } = render(<BigNumberMetric>content</BigNumberMetric>)

        expect(container).toMatchSnapshot()
    })

    it('should render the loading skeleton', () => {
        const { getAllByLabelText } = render(
            <BigNumberMetric isLoading>content</BigNumberMetric>,
        )

        expect(getAllByLabelText('Loading')).toHaveLength(1)
    })
})
