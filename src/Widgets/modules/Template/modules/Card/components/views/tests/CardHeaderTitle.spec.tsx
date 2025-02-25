import React from 'react'

import { render, screen } from '@testing-library/react'

import { CardHeaderTitle } from '../CardHeaderTitle'

describe('<CardHeaderTitle/>', () => {
    it('should set container class to wrapping element', () => {
        const child = 'foo'
        render(<CardHeaderTitle>{child}</CardHeaderTitle>)

        expect(screen.getByText(child)).toHaveClass('container')
    })
})
