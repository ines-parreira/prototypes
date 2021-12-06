import React from 'react'
import {render} from '@testing-library/react'

import ProductCell from '../ProductCell'

describe('ProductCell', () => {
    it('should render a product cell with image url', () => {
        const {container} = render(
            <ProductCell
                name="Sunglasses"
                imageUrl="https://domain.com/my-image.png"
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a product cell tickets with image placeholder', () => {
        const {container} = render(
            <ProductCell name="Sunglasses" imageUrl={null} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
