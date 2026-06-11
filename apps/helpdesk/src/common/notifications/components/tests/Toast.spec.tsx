import React from 'react'
import type { ReactNode } from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'
import { fireEvent } from '@testing-library/react'

import type { Notification } from '../../types'
import { Toast } from '../Toast'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn(),
}))

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

const useHelpdeskV2WayfindingMS1FlagMock = assumeMock(
    useHelpdeskV2WayfindingMS1Flag,
)

describe('Toast', () => {
    beforeEach(() => {
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
    })

    it('should return null if no config is found for the notification type', () => {
        const { container } = render(
            <Toast
                notification={
                    { type: 'unknown.type' } as unknown as Notification
                }
                onClick={jest.fn()}
                onDismiss={jest.fn()}
            />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should render the notification component', () => {
        const { getByText } = render(
            <Toast
                notification={
                    { type: 'ticket-message.created' } as Notification
                }
                onClick={jest.fn()}
                onDismiss={jest.fn()}
            />,
        )

        expect(getByText('Notification component')).toBeInTheDocument()
    })

    it('should call onClick when the notification is clicked', () => {
        const onClick = jest.fn()

        const { getByText } = render(
            <Toast
                notification={
                    { type: 'ticket-message.created' } as Notification
                }
                onClick={onClick}
                onDismiss={jest.fn()}
            />,
        )

        fireEvent.click(getByText('Notification component'))
        expect(onClick).toHaveBeenCalledWith()
    })

    describe('legacy path (wayfinding flag off)', () => {
        it('should call onDismiss when the close button is clicked', () => {
            const onDismiss = jest.fn()

            const { getByText } = render(
                <Toast
                    notification={
                        { type: 'ticket-message.created' } as Notification
                    }
                    onClick={jest.fn()}
                    onDismiss={onDismiss}
                />,
            )

            fireEvent.click(getByText('close'))
            expect(onDismiss).toHaveBeenCalledWith()
        })
    })

    describe('wayfinding path (flag on)', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('should call onDismiss when the dismiss button is clicked', () => {
            const onDismiss = jest.fn()

            const { getByRole } = render(
                <Toast
                    notification={
                        { type: 'ticket-message.created' } as Notification
                    }
                    onClick={jest.fn()}
                    onDismiss={onDismiss}
                />,
            )

            fireEvent.click(getByRole('button', { name: /dismiss/i }))
            expect(onDismiss).toHaveBeenCalledWith()
        })

        it('should not render the legacy close button via headerExtra', () => {
            const { queryByText } = render(
                <Toast
                    notification={
                        { type: 'ticket-message.created' } as Notification
                    }
                    onClick={jest.fn()}
                    onDismiss={jest.fn()}
                />,
            )

            expect(queryByText('Notification component')).toBeInTheDocument()
            // The legacy IconButton with text 'close' is not rendered as headerExtra
            // (the Axiom close icon may render 'close' text, but it is inside the button itself)
            expect(
                queryByText('close', { selector: 'button' }),
            ).not.toBeInTheDocument()
        })
    })
})
