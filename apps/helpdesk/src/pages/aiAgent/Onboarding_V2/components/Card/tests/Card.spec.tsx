import React from 'react'

import { render, screen } from '@testing-library/react'

import Card from '../Card'
import CardContent from '../CardContent'
import CardFooter from '../CardFooter'
import CardHeader from '../CardHeader'

describe('Card Components', () => {
    it.each([Card, CardContent, CardFooter, CardHeader])(
        'renders',
        (Component) => {
            render(<Component>Test</Component>)
            expect(screen.getByText('Test')).toBeInTheDocument()
        },
    )
})
