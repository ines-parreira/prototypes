import React from 'react'

import { render, screen } from '@testing-library/react'

import { Pill } from '../Pill'

describe('Pills', () => {
    it('should render children', () => {
        render(<Pill>Moukalviouk!</Pill>)
        expect(screen.getByText('Moukalviouk!')).toBeInTheDocument()
    })

    it('should have secondary class or light class', () => {
        const { rerender } = render(<Pill>Moukalviouk!</Pill>)

        expect(screen.getByText('Moukalviouk!')).toHaveClass('secondary')

        rerender(<Pill color="light">Moukalviouk!</Pill>)

        expect(screen.getByText('Moukalviouk!')).toHaveClass('light')
    })
})
