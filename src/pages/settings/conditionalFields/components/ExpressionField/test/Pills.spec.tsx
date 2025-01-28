import {render, screen} from '@testing-library/react'
import React from 'react'

import {Pill} from '../Pill'

describe('Pills', () => {
    it('should render children', () => {
        render(<Pill>Moukalviouk!</Pill>)
        expect(screen.getByText('Moukalviouk!')).toBeInTheDocument()
    })

    it('should have blue class or grey class', () => {
        const {rerender} = render(<Pill>Moukalviouk!</Pill>)

        expect(screen.getByText('Moukalviouk!')).toHaveClass('blue')

        rerender(<Pill color="grey">Moukalviouk!</Pill>)

        expect(screen.getByText('Moukalviouk!')).toHaveClass('grey')
    })
})
