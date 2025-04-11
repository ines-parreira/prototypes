import { render, screen } from '@testing-library/react'

import PhoneBarInnerContent from './PhoneBarInnerContent'

describe('<PhoneBarInnerContent />', () => {
    it('renders children correctly', () => {
        render(
            <PhoneBarInnerContent>
                <div data-testid="test-child">Test Child</div>
            </PhoneBarInnerContent>,
        )

        expect(screen.getByTestId('test-child')).toBeInTheDocument()
        expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('applies the container class to the root element', () => {
        const { container } = render(
            <PhoneBarInnerContent>
                <div>Test Child</div>
            </PhoneBarInnerContent>,
        )

        const rootElement = container.firstChild as HTMLElement
        expect(rootElement).toHaveClass('container')
    })

    it('renders multiple children correctly', () => {
        render(
            <PhoneBarInnerContent>
                <div data-testid="first-child">First Child</div>
                <div data-testid="second-child">Second Child</div>
            </PhoneBarInnerContent>,
        )

        expect(screen.getByTestId('first-child')).toBeInTheDocument()
        expect(screen.getByTestId('second-child')).toBeInTheDocument()
        expect(screen.getByText('First Child')).toBeInTheDocument()
        expect(screen.getByText('Second Child')).toBeInTheDocument()
    })
})
