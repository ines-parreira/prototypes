import {fireEvent, render} from '@testing-library/react'
import React from 'react'

import {categories, notifications} from '../../data'
import {Settings} from '../../types'

import EventSettings from '../EventSettings'

jest.mock(
    '../SoundSelect',
    () =>
        ({onChange}: {onChange: (sound: string) => void}) => (
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

jest.mock('../../data', () => ({
    ...jest.requireActual<typeof import('../../data')>('../../data'),
    categories: [
        {
            type: 'ticket-updates',
            label: 'Ticket updates',
            description: 'Get notified when one of these events happen:',
            typeLabel: 'Event',
            notifications: ['legacy-chat-and-messaging', 'user.mentioned'],
        },
    ],
    notifications: {
        'legacy-chat-and-messaging': {
            type: 'legacy-chat-and-messaging',
            component: () => null,
            workflow: '',
            settings: {
                type: 'ticket-updates',
                label: 'Chat & messaging tickets',
            },
        },
        'user.mentioned': {
            type: 'user.mentioned',
            component: () => null,
            workflow: 'user-mentioned',
            settings: {
                type: 'ticket-updates',
                label: 'Mentioned in an internal note',
            },
        },
    },
}))

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

const notificationsWithSettings = categories
    .reduce((acc, c) => [...acc, ...(c.notifications || [])], [] as string[])
    .map((n) => notifications[n])

describe('EventSettings', () => {
    it.each(notificationsWithSettings.map((n) => [n.type, n.settings?.label]))(
        'should render event %s',
        (_, label) => {
            const {getByText} = render(
                <EventSettings
                    settings={settings}
                    onChangeChannel={jest.fn()}
                    onChangeSound={jest.fn()}
                />
            )

            expect(getByText(label as string)).toBeInTheDocument()
        }
    )

    it('should call a function to handle a channel change', () => {
        const onChangeChannel = jest.fn()

        const {getAllByRole} = render(
            <EventSettings
                settings={settings}
                onChangeChannel={onChangeChannel}
                onChangeSound={jest.fn()}
            />
        )

        const checkbox = getAllByRole('checkbox')[1]
        fireEvent.click(checkbox)

        expect(onChangeChannel).toHaveBeenCalledWith(
            'user.mentioned',
            'in_app_feed',
            false
        )
    })

    it('should call a function to handle a sound change', () => {
        const onChangeSound = jest.fn()

        const {getAllByRole} = render(
            <EventSettings
                settings={settings}
                onChangeChannel={jest.fn()}
                onChangeSound={onChangeSound}
            />
        )

        const combobox = getAllByRole('combobox')[0]
        fireEvent.change(combobox, {target: {value: 'sound 1'}})

        expect(onChangeSound).toHaveBeenCalledWith(
            'legacy-chat-and-messaging',
            'sound 1'
        )
    })
})
