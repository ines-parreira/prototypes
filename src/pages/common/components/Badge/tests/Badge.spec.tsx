import React from 'react'
import {render} from '@testing-library/react'

import Badge, {ColorType} from '../Badge'

describe('<Badge />', () => {
    it('should render a badge', () => {
        const {container} = render(<Badge>Shopify</Badge>)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a badge with specified color type', () => {
        const {container} = render(
            <Badge type={ColorType.Warning}>Shopify</Badge>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a badge with custom style', () => {
        const {container} = render(
            <Badge style={{color: '#a541ab'}}>Shopify</Badge>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
