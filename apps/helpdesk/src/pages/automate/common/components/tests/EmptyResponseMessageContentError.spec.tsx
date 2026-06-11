import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { EmptyResponseMessageContentError } from '../EmptyResponseMessageContentError'

describe('EmptyResponseMessageContentError', () => {
    test('renders correctly', () => {
        render(<EmptyResponseMessageContentError />)
        expect(screen.getByText('No response configured')).toBeInTheDocument()
    })
})
