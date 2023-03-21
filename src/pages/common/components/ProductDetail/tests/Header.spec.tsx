import React from 'react'
import {render, screen} from '@testing-library/react'

import Header from 'pages/common/components/ProductDetail/Header'
import {dummyProduct} from './fixtures'

describe(`Header`, () => {
    it('should render an image instead of an icon', () => {
        render(<Header {...dummyProduct} image="https://screen.com/my1.png" />)

        expect(screen.getByAltText(`${dummyProduct.title}'s logo`))
    })
})
