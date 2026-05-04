import { render, screen } from '@testing-library/react'

import { Excerpt } from './Excerpt'

describe('Excerpt', () => {
    it('renders children text', () => {
        render(<Excerpt>Some excerpt content</Excerpt>)
        expect(screen.getByText('Some excerpt content')).toBeInTheDocument()
    })

    it('renders arbitrary children', () => {
        render(
            <Excerpt>
                <span>Nested content</span>
            </Excerpt>,
        )
        expect(screen.getByText('Nested content')).toBeInTheDocument()
    })
})
