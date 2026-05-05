import React from 'react'

import { render } from '@repo/testing'

import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Skeleton: () => <div data-testid="skeleton" />,
}))

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
        const { getAllByTestId } = render(
            <BigNumberMetric isLoading>content</BigNumberMetric>,
        )

        expect(getAllByTestId('skeleton')).toHaveLength(1)
    })
})
