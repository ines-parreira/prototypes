import {render, screen, fireEvent} from '@testing-library/react'
import React from 'react'

import BackLink from '../BackLink'

const mockHistoryPush = jest.fn()

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useHistory: () => ({
                push: mockHistoryPush,
            }),
        }) as Record<string, unknown>
)

describe('BackLink Component', () => {
    it('renders the BackLink component with label', () => {
        render(<BackLink path="/some-path" label="Go Back" />)

        const backLink = screen.getByText('Go Back')
        expect(backLink).toBeInTheDocument()
    })

    it('calls history.push when clicked', () => {
        render(<BackLink path="/some-path" label="Go Back" />)

        const backLink = screen.getByText('Go Back')
        fireEvent.click(backLink)

        expect(mockHistoryPush).toHaveBeenCalledWith('/some-path')
    })
})
