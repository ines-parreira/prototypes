import React from 'react'
import {render} from '@testing-library/react'

import {TicketChannel} from 'business/types/ticket'

import TicketIcon from '../TicketIcon'

jest.mock('hooks/useId', () => () => 'test')

describe('<TicketIcon />', () => {
    const props = {
        channel: TicketChannel.Email,
    }

    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should render the icon as closed', () => {
        const {getByText} = render(<TicketIcon {...props} />)
        expect(
            getByText('email').closest('div')?.classList.contains('isOpen')
        ).toBeFalsy()
    })

    it('should render the icon as open', () => {
        const {getByText} = render(<TicketIcon {...props} isOpen />)
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
