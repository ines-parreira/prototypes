import {render, screen} from '@testing-library/react'
import React from 'react'

import EmptyResponseMessageContentError from '../EmptyResponseMessageContentError'

describe('EmptyResponseMessageContentError', () => {
    test('renders correctly', () => {
        render(<EmptyResponseMessageContentError />)
        expect(screen.getByText('No response configured')).toBeInTheDocument()
    })
})
