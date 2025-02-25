import React from 'react'

import { render, screen } from '@testing-library/react'

import MainTitle from '../MainTitle'

describe('MainTitle', () => {
    it('renders both black and magenta text parts', () => {
        render(<MainTitle titleBlack="Welcome to " titleMagenta="AI Agent" />)

        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toBeInTheDocument()

        expect(screen.getByText('Welcome to')).toBeInTheDocument()
        expect(screen.getByText('AI Agent')).toBeInTheDocument()
    })

    it('applies correct styling to magenta text', () => {
        render(<MainTitle titleBlack="Hello " titleMagenta="World" />)

        const magentaText = screen.getByText('World')
        expect(magentaText).toHaveClass('titleMagenta')
    })
})
