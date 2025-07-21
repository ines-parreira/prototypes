import React from 'react'

import { render } from '@testing-library/react'

import GaugeAddon from 'domains/reporting/pages/common/components/charts/GaugeAddon'

const REGULAR_COLOR = '#EAF1FF'
const CONTENT = 'Test child'

describe('<GaugeAddon />', () => {
    it('should render a gauge with the width matching the given value', () => {
        const { getByTestId } = render(<GaugeAddon progress={40} />)

        expect(getByTestId('GaugeAddon')).toHaveStyle('width: 40%')
    })

    it('should have the matching background color', () => {
        const { getByTestId } = render(
            <GaugeAddon progress={40} color={REGULAR_COLOR} />,
        )

        expect(getByTestId('GaugeAddon')).toHaveStyle(
            `background-color: ${REGULAR_COLOR}`,
        )
    })

    it('should handle properly negative values', () => {
        const { getByTestId } = render(<GaugeAddon progress={-55} />)

        expect(getByTestId('GaugeAddon')).toHaveStyle(`width: 0%`)
    })

    it('should handle properly too big values', () => {
        const { getByTestId } = render(<GaugeAddon progress={150} />)

        expect(getByTestId('GaugeAddon')).toHaveStyle(`width: 100%`)
    })

    it('should render a gauge with a child component', () => {
        const { getByText, getByTestId } = render(
            <GaugeAddon progress={100}>
                <span>{CONTENT}</span>
            </GaugeAddon>,
        )
        expect(getByTestId('GaugeAddon')).toBeInTheDocument()
        expect(getByText(CONTENT)).toBeInTheDocument()
    })

    it('should only show the text', () => {
        const { getByText, queryByTestId } = render(
            <GaugeAddon progress={100} show={false}>
                <span>{CONTENT}</span>
            </GaugeAddon>,
        )
        expect(queryByTestId('GaugeAddon')).not.toBeInTheDocument()
        expect(getByText(CONTENT)).toBeInTheDocument()
    })
})
