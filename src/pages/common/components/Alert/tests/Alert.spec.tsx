import React from 'react'
import {render, fireEvent} from '@testing-library/react'

import Alert, {AlertType} from '../Alert'

const onClose = jest.fn()

describe('<Alert />', () => {
    it('should render an alert with a message with a default info type without icon', () => {
        const {container} = render(<Alert>This is an alert!</Alert>)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render an alert with an icon when icon prop is passed', () => {
        const {container} = render(<Alert icon>This is an alert!</Alert>)
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each(Object.values(AlertType))(
        'should render icon for %s alert type',
        (type) => {
            const {container} = render(
                <Alert type={type} icon>
                    This is an alert!
                </Alert>
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it('should render an alert with custom actions', () => {
        const {container} = render(
            <Alert customActions={<button>Click this !</button>}>
                This is an alert!
            </Alert>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render an alert with a close icon when onClose prop is passed ', () => {
        const {container} = render(
            <Alert onClose={onClose}>This is an alert!</Alert>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call onClose() prop when the close trigger is clicked ', () => {
        const {getByLabelText} = render(
            <Alert onClose={onClose}>This is an alert!</Alert>
        )
        fireEvent.click(getByLabelText('Close Icon'))
        expect(onClose).toHaveBeenCalled()
    })

    it('should render a custom icon when the icon is a react node', () => {
        const {container} = render(
            <Alert icon={<img alt="custom-icon" />}>This is an alert!</Alert>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
