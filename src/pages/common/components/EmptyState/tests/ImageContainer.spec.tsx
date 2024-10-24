import {render, screen} from '@testing-library/react'
import React from 'react'

import ImageContainer from 'pages/common/components/EmptyState/ImageContainer'

describe('ImageContainer', () => {
    it('should render children', () => {
        const children = <p data-testid="image-container-children">Children</p>
        render(<ImageContainer>{children}</ImageContainer>)

        const childrenElement = screen.getByTestId('image-container-children')
        expect(childrenElement).toBeInTheDocument()
    })
})
