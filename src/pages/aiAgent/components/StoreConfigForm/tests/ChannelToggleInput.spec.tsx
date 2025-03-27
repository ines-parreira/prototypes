import React, { ComponentProps } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'

import { ChannelToggleInput } from '../FormComponents/ChannelToggleInput'

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('common/segment', () => ({
    ...jest.requireActual('common/segment'),
    logEvent: jest.fn(),
}))

const mockLogEvent = jest.mocked(logEvent)

const renderComponent = (
    props?: Partial<ComponentProps<typeof ChannelToggleInput>>,
) => {
    render(
        <ChannelToggleInput
            isToggled={true}
            onUpdate={jest.fn()}
            channel="email"
            {...props}
        />,
    )
}

describe('ChannelToggleInput', () => {
    beforeEach(() => {
        mockLogEvent.mockClear()
    })

    test.each(['email', 'chat'])('should render for %s', (channel) => {
        renderComponent({
            channel: channel as ComponentProps<
                typeof ChannelToggleInput
            >['channel'],
        })

        screen.getByText('Enable AI Agent')
    })

    it.each<['chat' | 'email', SegmentEvent]>([
        ['chat', SegmentEvent.AiAgentChatConfigurationDisabled],
        ['email', SegmentEvent.AiAgentEmailConfigurationDisabled],
    ])(
        'should fire segment event for %s when toggle is off',
        (channel, segmentEvent) => {
            const onUpdate = jest.fn()

            renderComponent({ onUpdate, channel })
            fireEvent.click(screen.getByRole('switch'))

            expect(onUpdate).toHaveBeenCalledWith(false)
            expect(mockLogEvent).toHaveBeenCalledTimes(1)
            expect(mockLogEvent).toHaveBeenCalledWith(segmentEvent)
        },
    )
})
