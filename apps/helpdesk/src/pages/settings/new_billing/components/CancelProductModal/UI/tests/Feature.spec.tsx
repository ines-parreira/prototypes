import React from 'react'

import { render } from '@testing-library/react'

import Feature from '../Feature'

describe('Feature', () => {
    it('should render feature with the title, icon and the description', function () {
        const { getByText, container } = render(
            <Feature
                title="Some title"
                description="Some description"
                icon="star_outline"
            />,
        )

        const titleElement = getByText('Some title')
        expect(titleElement).toBeInTheDocument()
        expect(titleElement).toHaveClass('body-semibold')

        const descriptionElement = getByText('Some description')
        expect(descriptionElement).toBeInTheDocument()

        const icon = container.querySelector('i[class=material-icons]')
        expect(icon).toBeInTheDocument()
        expect(icon).toHaveTextContent('star_outline')
    })
})
