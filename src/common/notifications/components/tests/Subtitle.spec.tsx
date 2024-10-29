import {render} from '@testing-library/react'
import React from 'react'

import {
    mentionNotification,
    notification,
} from 'common/notifications/fixtures/fixtures'

import {DefaultPayload} from 'common/notifications/types'

import Subtitle from '../Subtitle'

describe('<Subtitle />', () => {
    it('should render ticket subject and sender', () => {
        const {getByText} = render(<Subtitle notification={notification} />)

        expect(getByText('Test ticket')).toBeInTheDocument()
        expect(getByText('John Doe')).toBeInTheDocument()
    })

    it('should not render sender if not present', () => {
        const {queryByText} = render(
            <Subtitle
                notification={{
                    ...notification,
                    type: 'ticket.snooze-expired',
                    payload: {
                        ticket: (notification.payload as DefaultPayload).ticket,
                        sender: null,
                    },
                }}
            />
        )

        expect(queryByText('from')).not.toBeInTheDocument()
    })

    it('should render ticket mention', () => {
        const {getByText} = render(
            <Subtitle notification={mentionNotification} />
        )

        expect(getByText('John Doe')).toBeInTheDocument()
        expect(getByText('mentioned you in')).toBeInTheDocument()
        expect(getByText('Test ticket')).toBeInTheDocument()
    })
})
