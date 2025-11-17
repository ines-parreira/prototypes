import type React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { ThemeContext } from '@gorgias/axiom'

import PhoneBarContainer from './PhoneBarContainer'

const mockTheme = {
    resolvedName: 'light',
}

const renderWithTheme = (ui: React.ReactElement) => {
    return render(
        <ThemeContext.Provider value={mockTheme as any}>
            {ui}
        </ThemeContext.Provider>,
    )
}

describe('<PhoneBarContainer />', () => {
    it('renders children correctly', () => {
        renderWithTheme(
            <PhoneBarContainer>
                <div data-testid="test-child">Test Child</div>
            </PhoneBarContainer>,
        )

        expect(screen.getByTestId('test-child')).toBeInTheDocument()
        expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('applies correct class names', () => {
        const { container } = renderWithTheme(
            <PhoneBarContainer>
                <div>Test Child</div>
            </PhoneBarContainer>,
        )

        const rootElement = container.firstChild as HTMLElement
        expect(rootElement).toHaveClass('container')
        expect(rootElement).toHaveClass('light')
    })

    it('applies highlighted class when isHighlighted is true', () => {
        const { container } = renderWithTheme(
            <PhoneBarContainer isHighlighted={true}>
                <div>Test Child</div>
            </PhoneBarContainer>,
        )

        const rootElement = container.firstChild as HTMLElement
        expect(rootElement).toHaveClass('highlighted')
    })

    it('does not apply highlighted class when isHighlighted is false', () => {
        const { container } = renderWithTheme(
            <PhoneBarContainer isHighlighted={false}>
                <div>Test Child</div>
            </PhoneBarContainer>,
        )

        const rootElement = container.firstChild as HTMLElement
        expect(rootElement).not.toHaveClass('highlighted')
    })

    it('calls onClick when clicked', () => {
        const handleClick = jest.fn()
        renderWithTheme(
            <PhoneBarContainer onClick={handleClick}>
                <div>Test Child</div>
            </PhoneBarContainer>,
        )

        fireEvent.click(screen.getByText('Test Child'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })
})
