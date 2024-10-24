import {render} from '@testing-library/react'
import React from 'react'

import Badge, {ColorType} from '../Badge'

describe('<Badge />', () => {
    it('should render a badge with specified color type', () => {
        const type = ColorType.Warning
        const {container} = render(<Badge type={type}>Shopify</Badge>)

        expect(container.firstChild).toHaveStyle({
            backgroundColor: `var(--background-${type})`,
            color: `var(--text-${type}, var(--neutral-grey-0))`,
            borderRadius: '100px',
        })
    })

    it('should render a badge with custom style', () => {
        const style = {color: '#a541ab'}
        const {container} = render(<Badge style={style}>Shopify</Badge>)

        expect(container.firstChild).toHaveStyle(style)
    })

    it('should render a badge with square corners', () => {
        const {container} = render(<Badge corner="square">Shopify</Badge>)

        expect(container.firstChild).toHaveStyle({
            borderRadius: '4px',
        })
    })
})
