import React from 'react'

import { render, screen } from '@testing-library/react'
import { Map } from 'immutable'

import { ChatCell } from './ChatCell'

describe('ChatCell', () => {
    it('should render chat name', () => {
        const chat = Map({ name: 'Customer Support Chat' })

        render(<ChatCell chat={chat} />)

        expect(screen.getByText('Customer Support Chat')).toBeInTheDocument()
    })
})
