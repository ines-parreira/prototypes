import React from 'react'
import {render, waitFor} from '@testing-library/react'
import axios from 'axios'

import ProductCell from '../ProductCell'

describe('ProductCell', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

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

    it('should display a placeholder if the check returns a 404 error', async () => {
        jest.spyOn(axios, 'head').mockRejectedValue({
            response: {
                status: 404,
            },
        })

        const {getByTestId} = render(
            <ProductCell
                name="Sunglasses"
                imageUrl="https://domain.com/my-image.png"
            />
        )

        await waitFor(() => {
            const placeholder = getByTestId('placeholder')
            expect(placeholder).toBeDefined()
        })
    })
})
