import React from 'react'

import {render} from '@testing-library/react'
import GaugeCellAddon from './GaugeCellAddon'

const REGULAR_COLOR = '#EAF1FF'

describe('<GaugeCellAddon />', () => {
    it('should render a gauge with the width matching the given value', () => {
        const value = 40
        const {baseElement} = render(<GaugeCellAddon progress={value} />)

        const gaugeElement = baseElement.firstElementChild
            ?.firstElementChild as HTMLDivElement

        expect(gaugeElement).toHaveStyle(`width: ${value}%`)
    })

    it('should have the matching background color', () => {
        const value = 40
        const {baseElement} = render(
            <GaugeCellAddon progress={value} color={REGULAR_COLOR} />
        )

        const gaugeElement = baseElement.firstElementChild
            ?.firstElementChild as HTMLDivElement

        expect(gaugeElement).toHaveStyle(`background-color: ${REGULAR_COLOR}`)
    })

    it('should handle properly negative values', () => {
        const value = -55
        const {baseElement} = render(<GaugeCellAddon progress={value} />)

        const gaugeElement = baseElement.firstElementChild
            ?.firstElementChild as HTMLDivElement

        expect(gaugeElement).toHaveStyle(`width: 0%`)
    })

    it('should handle properly too big values', () => {
        const value = 150
        const {baseElement} = render(<GaugeCellAddon progress={value} />)

        const gaugeElement = baseElement.firstElementChild
            ?.firstElementChild as HTMLDivElement

        expect(gaugeElement).toHaveStyle(`width: 100%`)
    })
})
