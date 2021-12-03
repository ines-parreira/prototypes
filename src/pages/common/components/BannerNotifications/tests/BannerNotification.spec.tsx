import {fireEvent, render} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import BannerNotification from '../BannerNotification'
import {NotificationStatus} from '../../../../../state/notifications/types'

describe('<BannerNotification/>', () => {
    const minProps = {
        id: 1,
        status: NotificationStatus.Success,
        message: 'foobar',
        hide: jest.fn(),
        allowHTML: false,
    } as unknown as ComponentProps<typeof BannerNotification>

    describe('rendering', () => {
        it('should render with default props', () => {
            const {container} = render(<BannerNotification {...minProps} />)

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with icon', () => {
            const {container} = render(
                <BannerNotification {...minProps} showIcon />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render html message', () => {
            const text = 'patatas bravas'
            const message = `<div class="potatoes">${text}</div>`
            const {container} = render(
                <BannerNotification {...minProps} allowHTML message={message} />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render custom HTML actions', () => {
            const {container} = render(
                <BannerNotification
                    {...minProps}
                    actionHTML={`<button>Click me !</button>`}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render close icon when the notification is closable', () => {
            const {container} = render(
                <BannerNotification {...minProps} closable />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('interactions', () => {
        it('should close the notification', () => {
            const onClose = jest.fn()

            const {getByAltText} = render(
                <BannerNotification {...minProps} onClose={onClose} closable />
            )

            fireEvent.click(getByAltText('close-icon'))
            expect(onClose).toHaveBeenCalledWith()
        })

        it('should dismiss the notification and trigger callback', () => {
            const onClick = jest.fn()

            const {getByText} = render(
                <BannerNotification
                    {...minProps}
                    onClick={onClick}
                    dismissible
                />
            )

            fireEvent.click(getByText('foobar'))
            expect(onClick).toHaveBeenCalledWith()
        })
    })
})
