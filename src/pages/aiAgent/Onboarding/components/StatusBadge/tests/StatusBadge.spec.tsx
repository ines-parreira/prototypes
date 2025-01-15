import {render, screen} from '@testing-library/react'
import React from 'react'

import StatusBadge, {StatusEnum} from '../StatusBadge'

describe('StatusBadge', () => {
    it('renders connected status', () => {
        render(<StatusBadge status={StatusEnum.Connected} />)
        expect(screen.getByText(StatusEnum.Connected)).toBeInTheDocument()
    })

    it('renders disconnected status', () => {
        render(<StatusBadge status={StatusEnum.Disconnected} />)
        expect(screen.getByText(StatusEnum.Disconnected)).toBeInTheDocument()
    })
})
