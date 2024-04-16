import React from 'react'
import {render, screen} from '@testing-library/react'
import ImageContainer from 'pages/common/components/EmptyState/ImageContainer'

describe('ImageContainer', () => {
    it('should render svg', () => {
        const children = <p>Children</p>
        render(<ImageContainer>{children}</ImageContainer>)

        const svg = document.querySelector('svg')
        expect(svg).toBeInTheDocument()
    })

    it('should render children', () => {
        const children = <p data-testid="image-container-children">Children</p>
        render(<ImageContainer>{children}</ImageContainer>)

        const childrenElement = screen.getByTestId('image-container-children')
        expect(childrenElement).toBeInTheDocument()
    })
})
