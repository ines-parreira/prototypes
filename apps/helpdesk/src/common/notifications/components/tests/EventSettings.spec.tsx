import React from 'react'

import { useAreFlagsLoading } from '@repo/feature-flags'
import { fireEvent, render } from '@testing-library/react'

import { categories, notifications } from '../../data'
import type { Settings } from '../../types'
import EventSettings from '../EventSettings'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useAreFlagsLoading: jest.fn(),
}))

jest.mock(
    '../SoundSelect',
    () =>
        ({ onChange }: { onChange: (sound: string) => void }) => (
            <select
                onChange={(e) => {
                    onChange(e.target.value)
                }}
            >
                <option value="sound 1">sound 1</option>
                <option value="sound 2">sound 2</option>
            </select>
        ),
)

jest.mock('../../data', () => ({
    ...jest.requireActual<typeof import('../../data')>('../../data'),
    categories: [
        {
            type: 'ticket-updates',
            label: 'Ticket updates',
            description: 'Get notified when one of these events happen:',
            typeLabel: 'Event',
            notifications: ['user.mentioned'],
        },
    ],
    notifications: {
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
    beforeEach(() => {
        ;(useAreFlagsLoading as jest.Mock).mockReturnValue(false)
    })

    it.each(notificationsWithSettings.map((n) => [n.type, n.settings?.label]))(
        'should render event %s',
        (_, label) => {
            const { getByText } = render(
                <EventSettings
                    settings={settings}
                    onChangeChannel={jest.fn()}
                    onChangeSound={jest.fn()}
                />,
            )

            expect(getByText(label as string)).toBeInTheDocument()
        },
    )

    it('should render nothing while flags are loading', () => {
        ;(useAreFlagsLoading as jest.Mock).mockReturnValue(true)

        const { container } = render(
            <EventSettings
                settings={settings}
                onChangeChannel={jest.fn()}
                onChangeSound={jest.fn()}
            />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should call a function to handle a channel change', () => {
        const onChangeChannel = jest.fn()

        const { getAllByRole } = render(
            <EventSettings
                settings={settings}
                onChangeChannel={onChangeChannel}
                onChangeSound={jest.fn()}
            />,
        )

        const checkbox = getAllByRole('checkbox')[0]
        fireEvent.click(checkbox)

        expect(onChangeChannel).toHaveBeenCalledWith(
            'user.mentioned',
            'in_app_feed',
            false,
        )
    })

    it('should call a function to handle a sound change', () => {
        const onChangeSound = jest.fn()

        const { getAllByRole } = render(
            <EventSettings
                settings={settings}
                onChangeChannel={jest.fn()}
                onChangeSound={onChangeSound}
            />,
        )

        const combobox = getAllByRole('combobox')[0]
        fireEvent.change(combobox, { target: { value: 'sound 1' } })

        expect(onChangeSound).toHaveBeenCalledWith('user.mentioned', 'sound 1')
    })
})
