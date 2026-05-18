import React from 'react'

import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'

import { TicketChannel } from 'business/types/ticket'
import { IntegrationType } from 'models/integration/types'
import type { GorgiasChatIntegration } from 'models/integration/types/gorgiasChat'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'

import SelfServicePreviewChannelSelect from '../SelfServicePreviewChannelSelect'

const makeChannel = (id: number, name: string): SelfServiceChatChannel => ({
    type: TicketChannel.Chat,
    value: {
        id,
        name,
        type: IntegrationType.GorgiasChat,
        meta: { app_id: `app-${id}` },
    } as GorgiasChatIntegration,
})

const channelA = makeChannel(1, 'Chat A')
const channelB = makeChannel(2, 'Chat B')

describe('<SelfServicePreviewChannelSelect />', () => {
    it('should render component', () => {
        render(
            <SelfServicePreviewChannelSelect
                onChange={jest.fn()}
                channels={[]}
            />,
        )
        expect(screen.getByText('Channel')).toBeInTheDocument()
    })

    describe('channel selection logic', () => {
        it('should not call onChange when the current channel id is present in channels', async () => {
            const onChange = jest.fn()
            const channelANewRef = makeChannel(1, 'Chat A')

            render(
                <SelfServicePreviewChannelSelect
                    onChange={onChange}
                    channels={[channelA, channelB]}
                    channel={channelANewRef}
                />,
            )

            await waitFor(() => {
                expect(onChange).not.toHaveBeenCalled()
            })
        })

        it('should call onChange with channels[0] when channel is undefined', async () => {
            const onChange = jest.fn()

            render(
                <SelfServicePreviewChannelSelect
                    onChange={onChange}
                    channels={[channelA, channelB]}
                    channel={undefined}
                />,
            )

            await waitFor(() => {
                expect(onChange).toHaveBeenCalledWith(channelA)
            })
        })

        it('should call onChange with channels[0] when channel id is not in channels', async () => {
            const unknownChannel = makeChannel(99, 'Unknown')
            const onChange = jest.fn()

            render(
                <SelfServicePreviewChannelSelect
                    onChange={onChange}
                    channels={[channelA, channelB]}
                    channel={unknownChannel}
                />,
            )

            await waitFor(() => {
                expect(onChange).toHaveBeenCalledWith(channelA)
            })
        })
    })
})
