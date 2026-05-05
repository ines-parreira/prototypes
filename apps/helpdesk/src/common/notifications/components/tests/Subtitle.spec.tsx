import React from 'react'

import { render } from '@repo/testing'

import Subtitle from '../Subtitle'

describe('Subtitle', () => {
    it('should render given children', () => {
        const { getByText } = render(<Subtitle>Beep-boop</Subtitle>)

        expect(getByText('Beep-boop')).toBeInTheDocument()
    })
})
