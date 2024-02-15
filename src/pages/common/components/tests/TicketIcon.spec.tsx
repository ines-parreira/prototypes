import React from 'react'
import {render} from '@testing-library/react'

import {TicketChannel, TicketStatus} from 'business/types/ticket'

import TicketIcon, {NullTicketIcon} from '../TicketIcon'

jest.mock('hooks/useId', () => () => 'test')

describe('<TicketIcon />', () => {
    const props = {
        channel: TicketChannel.Email,
        status: TicketStatus.Closed,
    }

    it('should render the icon as closed', () => {
        const {getByText} = render(<TicketIcon {...props} />)
        expect(
            getByText('email').closest('div')?.classList.contains('isOpen')
        ).toBeFalsy()
    })

    it('should render the icon as open', () => {
        const {getByText} = render(
            <TicketIcon {...props} status={TicketStatus.Open} />
        )
        expect(
            getByText('email').closest('div')?.classList.contains('isOpen')
        ).toBeTruthy()
    })

    it('should reflect the channel of the ticket in the icon', () => {
        const {getByText} = render(
            <TicketIcon {...props} channel={TicketChannel.Chat} />
        )

        expect(getByText('forum')).toBeInTheDocument()
    })
})

describe('<NullTicketIcon />', () => {
    it('should render delete icon', () => {
        const {getByText} = render(<NullTicketIcon />)

        expect(getByText('delete')).toBeInTheDocument()
    })
})
