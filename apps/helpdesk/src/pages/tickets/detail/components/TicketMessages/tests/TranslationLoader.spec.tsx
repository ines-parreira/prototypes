import React from 'react'

import { render, screen } from '@testing-library/react'

import { TranslationLoader } from '../TranslationLoader'

// Mock the LoadingSpinner from @gorgias/axiom
jest.mock('@gorgias/axiom', () => ({
    LoadingSpinner: ({ size, className }: any) => (
        <div
            data-testid="loading-spinner"
            data-size={size}
            className={className}
        />
    ),
}))

describe('TranslationLoader', () => {
    it('should render the loading spinner with correct props', () => {
        render(<TranslationLoader />)

        const spinner = screen.getByTestId('loading-spinner')
        expect(spinner).toBeInTheDocument()
        expect(spinner).toHaveAttribute('data-size', 'small')
    })

    it('should render the translating text', () => {
        render(<TranslationLoader />)

        expect(screen.getByText('Translating...')).toBeInTheDocument()
    })

    it('should apply the correct CSS classes', () => {
        const { container } = render(<TranslationLoader />)

        const wrapper = container.firstChild as HTMLElement
        expect(wrapper).toHaveClass('translationLoader')

        const spinner = screen.getByTestId('loading-spinner')
        expect(spinner).toHaveClass('loadingSpinner')

        const text = screen.getByText('Translating...')
        expect(text).toHaveClass('loadingText')
    })

    it('should render without crashing', () => {
        expect(() => render(<TranslationLoader />)).not.toThrow()
    })

    it('should have the correct structure', () => {
        const { container } = render(<TranslationLoader />)

        // Check that the wrapper div contains both spinner and text
        const wrapper = container.firstChild as HTMLElement
        expect(wrapper.children).toHaveLength(2)

        // First child should be the spinner
        expect(wrapper.children[0]).toHaveAttribute(
            'data-testid',
            'loading-spinner',
        )

        // Second child should be the text span
        expect(wrapper.children[1].tagName).toBe('SPAN')
        expect(wrapper.children[1]).toHaveTextContent('Translating...')
    })
})
