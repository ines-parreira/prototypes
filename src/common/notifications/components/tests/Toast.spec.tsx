import {fireEvent, render} from '@testing-library/react'
import React from 'react'
import type {ReactNode} from 'react'

import type {Notification} from '../../types'
import Toast from '../Toast'

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

describe('Toast', () => {
    it('should return null if no config is found for the notification type', () => {
        const {container} = render(
            <Toast
                notification={{type: 'unknown.type'} as unknown as Notification}
                onClick={jest.fn()}
                onDismiss={jest.fn()}
            />
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should render the notification component', () => {
        const {getByText} = render(
            <Toast
                notification={{type: 'ticket-message.created'} as Notification}
                onClick={jest.fn()}
                onDismiss={jest.fn()}
            />
        )

        expect(getByText('Notification component')).toBeInTheDocument()
    })

    it('should call onClick when the notification is clicked', () => {
        const onClick = jest.fn()

        const {getByText} = render(
            <Toast
                notification={{type: 'ticket-message.created'} as Notification}
                onClick={onClick}
                onDismiss={jest.fn()}
            />
        )

        fireEvent.click(getByText('Notification component'))
        expect(onClick).toHaveBeenCalledWith()
    })

    it('should call onDismiss when the notification is dismissed', () => {
        const onDismiss = jest.fn()

        const {getByText} = render(
            <Toast
                notification={{type: 'ticket-message.created'} as Notification}
                onClick={jest.fn()}
                onDismiss={onDismiss}
            />
        )

        fireEvent.click(getByText('close'))
        expect(onDismiss).toHaveBeenCalledWith()
    })
})
