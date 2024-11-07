import {fireEvent, render} from '@testing-library/react'
import React from 'react'
import type {ReactNode} from 'react'

import type {Notification} from '../../types'
import FeedItem from '../FeedItem'

jest.mock('../../data', () => ({
    notifications: {
        'ticket-message.created': {
            component: ({
                headerExtra,
                onClick,
            }: {
                headerExtra?: ReactNode
                onClick: () => void
            }) => (
                <div>
                    {headerExtra}
                    <p
                        onClick={() => {
                            onClick()
                        }}
                    >
                        Notification component
                    </p>
                </div>
            ),
        },
    },
}))

describe('FeedItem', () => {
    it('should return null if no config is found for the notification type', () => {
        const {container} = render(
            <FeedItem
                notification={{type: 'unknown.type'} as unknown as Notification}
            />
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should render the notification component', () => {
        const {getByText} = render(
            <FeedItem
                notification={{type: 'ticket-message.created'} as Notification}
            />
        )

        expect(getByText('Notification component')).toBeInTheDocument()
    })

    it('should call onClick when the notification is clicked', () => {
        const onClick = jest.fn()

        const {getByText} = render(
            <FeedItem
                notification={{type: 'ticket-message.created'} as Notification}
                onClick={onClick}
            />
        )

        fireEvent.click(getByText('Notification component'))
        expect(onClick).toHaveBeenCalledWith()
    })

    it('should call onToggleRead when the notification is marked as read', () => {
        const onToggleRead = jest.fn()

        const {getByText} = render(
            <FeedItem
                notification={{type: 'ticket-message.created'} as Notification}
                onToggleRead={onToggleRead}
            />
        )

        fireEvent.click(getByText('check_box'))
        expect(onToggleRead).toHaveBeenCalled()
    })
})
