import {render} from '@testing-library/react'
import React from 'react'

import {TicketChannel} from 'business/types/ticket'
import {UISLAPolicy} from 'pages/settings/SLAs/features/SLAList/types'

import ChannelListCell from '../ChannelListCell'

const mockUISLAPolicy = {
    id: '123',
    channels: [TicketChannel.Email, TicketChannel.Sms],
} as unknown as UISLAPolicy

describe('<ChannelList />', () => {
    it('should render a list of channels', () => {
        const {getByText} = render(<ChannelListCell policy={mockUISLAPolicy} />)

        expect(getByText(TicketChannel.Email)).toBeInTheDocument()
        expect(getByText(TicketChannel.Sms)).toBeInTheDocument()
    })

    it('should render a surplus count if there are more than 5 channels', () => {
        const channels = [
            TicketChannel.Email,
            TicketChannel.Sms,
            TicketChannel.Phone,
            TicketChannel.Chat,
            TicketChannel.Facebook,
            TicketChannel.Twitter,
        ]
        const {getByText} = render(
            <ChannelListCell policy={{...mockUISLAPolicy, channels}} />
        )

        expect(getByText('+1')).toBeInTheDocument()
    })
})
