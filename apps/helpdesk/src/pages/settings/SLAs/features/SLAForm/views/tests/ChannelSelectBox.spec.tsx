import { assumeMock } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TicketChannel } from 'business/types/ticket'
import type { Channel } from 'models/channel/types'
import { getChannels } from 'services/channels'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import ChannelSelectBox from '../ChannelSelectBox'

/* the channels query doesn't seem to be available in the sdk */
jest.mock('services/channels')

const mockGetChannels = assumeMock(getChannels)
mockGetChannels.mockReturnValue([
    {
        id: '1',
        name: 'Channel 1',
        slug: 'channel-1',
    } as Channel,
    {
        id: '2',
        name: 'Phone',
        slug: TicketChannel.Phone,
    } as Channel,
    {
        id: '3',
        name: 'Email',
        slug: TicketChannel.Email,
    } as Channel,
])

describe('ChannelSelectBox', () => {
    it('should render the component', async () => {
        const user = userEvent.setup()
        renderWithStoreAndQueryClientProvider(
            <ChannelSelectBox value={[]} onChange={jest.fn()} />,
        )

        expect(screen.getByText('Channel(s)')).toBeInTheDocument()

        await waitFor(async () => {
            await user.click(
                screen.getByText('Select channels the SLA should apply to'),
            )
        })

        expect(screen.getByText('Channel 1')).toBeInTheDocument()
        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.queryByText('Phone')).not.toBeInTheDocument()
    })
})
