import React from 'react'

import { render, screen } from '@testing-library/react'

import { PlaygroundPreviewAttachedImage } from './PlaygroundPreviewAttachedImage'

describe('<PlaygroundPreviewAttachedImage />', () => {
    it('should render the image with the given src and alt', () => {
        render(
            <PlaygroundPreviewAttachedImage
                src="https://example.com/product.jpg"
                alt="Product image"
            />,
        )

        const img = screen.getByAltText('Product image')
        expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute('src', 'https://example.com/product.jpg')
    })

    it('should fall back to default alt text when alt is not provided', () => {
        render(
            <PlaygroundPreviewAttachedImage
                src="https://example.com/product.jpg"
                alt={undefined as unknown as string}
            />,
        )

        expect(
            screen.getByAltText('selected-product-image'),
        ).toBeInTheDocument()
    })
})
