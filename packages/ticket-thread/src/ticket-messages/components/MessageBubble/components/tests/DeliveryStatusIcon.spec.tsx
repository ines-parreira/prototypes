import { render, screen } from '@testing-library/react'

import type { DeliveryStatus } from '../DeliveryStatusIcon'
import { DeliveryStatusIcon } from '../DeliveryStatusIcon'

function renderIcon(status: DeliveryStatus) {
    return render(<DeliveryStatusIcon status={status} />)
}

describe('DeliveryStatusIcon', () => {
    it('returns null when no status condition is met', () => {
        const { container } = renderIcon({})

        expect(container).toBeEmptyDOMElement()
    })

    it('renders a spinner when the message is pending', () => {
        renderIcon({ isPending: true })

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('renders a sent icon when sent_datetime is set', () => {
        renderIcon({ sent_datetime: '2024-03-21T11:00:00Z' })

        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('renders a double-check icon when opened_datetime is set', () => {
        renderIcon({
            sent_datetime: '2024-03-21T11:00:00Z',
            opened_datetime: '2024-03-21T12:00:00Z',
        })

        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
    })

    it('renders a failed icon when failed_datetime is set', () => {
        renderIcon({ failed_datetime: '2024-03-21T11:00:00Z' })

        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
})
