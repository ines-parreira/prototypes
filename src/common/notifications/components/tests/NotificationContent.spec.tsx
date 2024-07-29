import React from 'react'
import {render} from '@testing-library/react'

import {notification} from 'common/notifications/fixtures/fixtures'
import {Notification} from 'common/notifications/types'

import NotificationContent from '../NotificationContent'

describe('<NotificationContent />', () => {
    it('should not return anything if there is no ticket in notification payload', () => {
        const {container} = render(
            <NotificationContent
                notification={
                    {
                        ...notification,
                        payload: {},
                    } as Notification
                }
            />
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should render notification content', () => {
        const {getByText} = render(
            <NotificationContent
                notification={notification}
                headerExtra="extra"
            />
        )

        expect(getByText('New message')).toBeInTheDocument()
        expect(getByText('extra')).toBeInTheDocument()
        expect(getByText('Excerpt')).toBeInTheDocument()
    })

    it('should render notification type as header if no corresponding header is found', () => {
        const {getByText} = render(
            <NotificationContent
                notification={
                    {
                        ...notification,
                        type: 'unknown.type',
                    } as unknown as Notification
                }
            />
        )

        expect(getByText('unknown.type')).toBeInTheDocument()
    })

    it('should render regular notification icon', () => {
        const {getByText} = render(
            <NotificationContent
                notification={{
                    ...notification,
                    payload: {
                        ticket: notification.payload.ticket,
                        sender: null,
                    },
                    type: 'ticket.assigned',
                }}
            />
        )

        expect(getByText('person')).toBeInTheDocument()
        expect(getByText('person')).toHaveClass('material-icons')
    })

    it('should render outlined notification icon', () => {
        const {getByText} = render(
            <NotificationContent
                notification={
                    {
                        ...notification,
                        type: 'user.mentioned',
                    } as unknown as Notification
                }
            />
        )

        expect(getByText('alternate_email')).toBeInTheDocument()
        expect(getByText('alternate_email')).toHaveClass(
            'material-icons-outlined'
        )
    })
})
