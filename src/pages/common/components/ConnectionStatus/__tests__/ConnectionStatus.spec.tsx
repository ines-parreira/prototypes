import React from 'react'
import {render, screen} from '@testing-library/react'

import {ConnectionStatus} from '../ConnectionStatus'

describe('<ConnectionStatus />', () => {
    it('renders with status: active', () => {
        const statusActive = 'active'
        const label = 'Connected'
        render(<ConnectionStatus status={statusActive} label={label} />)
        const icon = screen.getByLabelText(
            `Icon for connection ${statusActive}`
        )

        expect(icon).toBeInTheDocument()
        expect(icon).toHaveClass('connected')
        expect(screen.getByText(label)).toBeInTheDocument()
    })

    it('renders with status: pending', () => {
        const statusPending = 'pending'
        const label = 'Connecting'
        render(<ConnectionStatus status={statusPending} label={label} />)
        const icon = screen.queryByLabelText(
            `Icon for connection ${statusPending}`
        )

        expect(icon).not.toBeInTheDocument()
        expect(screen.getByText(label)).toBeInTheDocument()
    })

    it('renders with status: unknown', () => {
        const statusUnknown = 'unknown'
        const label = 'Error connecting'
        render(<ConnectionStatus status={statusUnknown} label={label} />)
        const icon = screen.getByLabelText(
            `Icon for connection ${statusUnknown}`
        )

        expect(icon).toBeInTheDocument()
        expect(icon).toHaveClass('disconnected')
        expect(screen.getByText(label)).toBeInTheDocument()
    })
})
