import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import {Event, Settings} from 'common/notifications/types'
import {channels, enabledEvents} from 'common/notifications/data'

import EventSettings from '../EventSettings'

jest.mock(
    '../SoundSelect',
    () =>
        ({onChange}: {onChange: (sound: string) => void}) =>
            (
                <select
                    onChange={(e) => {
                        onChange(e.target.value)
                    }}
                >
                    <option value="sound 1">sound 1</option>
                    <option value="sound 2">sound 2</option>
                </select>
            )
)

jest.mock('common/notifications/hooks/useAvailableEvents', () => () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {enabledEvents} = require('common/notifications/data')
    return enabledEvents as Event[]
})

const mockOnChangeChannel = jest.fn()
const mockOnChangeSound = jest.fn()

const settings: Settings = {
    volume: 5,
    events: {
        'ticket-message.created': {
            sound: 'default',
            channels: {
                in_app_feed: true,
            },
        },
        'user.mentioned': {
            sound: 'default',
            channels: {
                in_app_feed: true,
            },
        },
        'ticket.snooze-expired': {
            sound: 'default',
            channels: {
                in_app_feed: true,
            },
        },
        'ticket.assigned': {
            sound: 'default',
            channels: {
                in_app_feed: true,
            },
        },
    },
}

describe('<EventSettings/>', () => {
    it.each(channels.map((channel) => channel.label))(
        `should render channel name in table header - %s`,
        (channel) => {
            const {getByText} = render(
                <EventSettings
                    settings={settings}
                    onChangeChannel={mockOnChangeChannel}
                    onChangeSound={mockOnChangeSound}
                />
            )

            expect(getByText(channel as string)).toBeInTheDocument()
        }
    )

    it.each(enabledEvents.map((event) => [event.type, event.label]))(
        'should render event %s',
        (_, label) => {
            const {getByText} = render(
                <EventSettings
                    settings={settings}
                    onChangeChannel={mockOnChangeChannel}
                    onChangeSound={mockOnChangeSound}
                />
            )

            expect(getByText(label as string)).toBeInTheDocument()
        }
    )

    it('should handle sound select change', () => {
        const {getAllByRole} = render(
            <EventSettings
                settings={settings}
                onChangeChannel={mockOnChangeChannel}
                onChangeSound={mockOnChangeSound}
            />
        )

        const select = getAllByRole('combobox')[0]

        fireEvent.change(select, {target: {value: 'sound 1'}})

        expect(mockOnChangeSound).toHaveBeenCalledWith(
            'ticket-message.created',
            'sound 1'
        )
    })

    it('should handle channel checkbox change', () => {
        const {getAllByRole} = render(
            <EventSettings
                settings={settings}
                onChangeChannel={mockOnChangeChannel}
                onChangeSound={mockOnChangeSound}
            />
        )

        const checkbox = getAllByRole('checkbox')[0]

        fireEvent.click(checkbox)

        expect(mockOnChangeChannel).toHaveBeenCalledWith(
            'ticket-message.created',
            'in_app_feed',
            false
        )
    })
})
