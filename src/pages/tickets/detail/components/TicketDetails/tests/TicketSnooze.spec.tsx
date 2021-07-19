import React from 'react'
import {render, fireEvent, waitFor} from '@testing-library/react'

import TicketSnooze from '../TicketSnooze'

describe('<TicketSnooze/>', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('rendering', () => {
        it('should render an icon with a tooltip', async () => {
            const {container, getByText, baseElement} = render(
                <TicketSnooze datetime="2017-12-22 17:00" timezone="utc" />
            )
            expect(container.firstChild).toMatchSnapshot()
            fireEvent.mouseOver(getByText('snooze'))
            await waitFor(() => getByText(/Snooze/))
            expect(baseElement).toMatchSnapshot()
        })

        it('should render null', () => {
            const {container} = render(<TicketSnooze timezone="utc" />)
            expect(container.firstChild).toBe(null)
        })
    })
})
