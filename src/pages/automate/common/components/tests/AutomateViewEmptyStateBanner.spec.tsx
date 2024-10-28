import React from 'react'
import {screen, render} from '@testing-library/react'

import AutomateViewEmptyStateBanner from '../AutomateViewEmptyStateBanner'

describe('<AutomateViewEmptyStateBanner />', () => {
    it('should render with title, description, and image', () => {
        render(
            <AutomateViewEmptyStateBanner
                id="test-id"
                title="Test Title"
                description="Test Description"
                image="/path/to/image.jpg"
            />
        )

        expect(screen.getByText('Test Title')).toBeInTheDocument()
        expect(screen.getByText('Test Description')).toBeInTheDocument()
        expect(screen.getByAltText('Test Title')).toHaveAttribute(
            'src',
            '/path/to/image.jpg'
        )
    })

    it('should render badge if provided', () => {
        render(
            <AutomateViewEmptyStateBanner
                id="test-id"
                title="Test Title"
                description="Test Description"
                image="/path/to/image.jpg"
                badge={<span>Badge</span>}
            />
        )

        expect(screen.getByText('Badge')).toBeInTheDocument()
    })

    it('should render action if provided', () => {
        render(
            <AutomateViewEmptyStateBanner
                id="test-id"
                title="Test Title"
                description="Test Description"
                image="/path/to/image.jpg"
                action={<button>Click Me</button>}
            />
        )

        expect(screen.getByText('Click Me')).toBeInTheDocument()
    })
})
