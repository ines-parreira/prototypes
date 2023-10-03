import React from 'react'
import {render, fireEvent, waitFor} from '@testing-library/react'

import TicketSnooze from '../TicketSnooze'

describe('<TicketSnooze/>', () => {
    describe('rendering', () => {
        it('should render null if no datetime is provided', () => {
            const {queryByText} = render(<TicketSnooze timezone="utc" />)
            expect(queryByText('Snoozed')).not.toBeInTheDocument()
        })

        it('should render a badge with a tooltip', async () => {
            const {getByText} = render(
                <TicketSnooze datetime="2017-12-22 17:00" timezone="utc" />
            )
            const el = getByText('Snoozed')
            expect(el).toBeInTheDocument()

            fireEvent.mouseOver(el)
            await waitFor(() => getByText(/2017/))

            expect(getByText(/Snoozed until/)).toBeInTheDocument()
        })
    })
})
