import { screen } from '@testing-library/react'
import { useLocation } from 'react-router-dom'

import { mockTicketCompact } from '@gorgias/helpdesk-mocks'

import { render, testAppQueryClient } from '../../../../tests/render.utils'
import { TicketListItem } from '../TicketListItem'

vi.mock('@gorgias/realtime-ably', () => ({
    useAgentActivity: () => ({
        getTicketActivity: vi.fn().mockReturnValue({ viewing: [] }),
    }),
}))

function LocationDisplay() {
    const { pathname } = useLocation()
    return <div role="status">{pathname}</div>
}

const ticket = mockTicketCompact({ id: 42, subject: 'Test Ticket' })
const viewId = 123
const defaultProps = { ticket, viewId, isActive: false }

beforeEach(() => {
    testAppQueryClient.clear()
})

describe('TicketListItem', () => {
    it('calls onSelect with ticket id, checked state, and false for shiftKey when checkbox is changed', async () => {
        const onSelect = vi.fn()
        const { user } = render(
            <TicketListItem {...defaultProps} onSelect={onSelect} />,
        )

        await user.click(screen.getByLabelText('Select ticket 42'))

        expect(onSelect).toHaveBeenCalledWith(42, true, false)
    })

    it('does not navigate to the ticket when the checkbox area is clicked', async () => {
        const { user } = render(
            <>
                <LocationDisplay />
                <TicketListItem {...defaultProps} />
            </>,
        )

        await user.click(screen.getByLabelText('Select ticket 42'))

        expect(screen.getByRole('status')).toHaveTextContent('/')
    })
})
