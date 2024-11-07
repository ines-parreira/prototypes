import {render} from '@testing-library/react'
import React from 'react'

import {notification} from 'common/notifications/fixtures/fixtures'
import {DefaultPayload, Notification} from 'common/notifications/types'

import TicketNotification from '../TicketNotification'

describe('<TicketNotification />', () => {
    it('should not return anything if there is no data in notification payload', () => {
        const {container} = render(
            <TicketNotification
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
            <TicketNotification
                notification={notification}
                headerExtra="extra"
            />
        )

        expect(getByText('New message')).toBeInTheDocument()
        expect(getByText('extra')).toBeInTheDocument()
        expect(getByText('Excerpt')).toBeInTheDocument()
    })

    it('should render regular notification icon', () => {
        const {getByText} = render(
            <TicketNotification
                notification={{
                    ...notification,
                    payload: {
                        ticket: (notification.payload as DefaultPayload).ticket,
                        sender: null,
                    },
                    type: 'ticket.assigned',
                }}
            />
        )

        expect(getByText('person')).toBeInTheDocument()
        expect(getByText('person')).toHaveClass('material-icons')
    })
})
