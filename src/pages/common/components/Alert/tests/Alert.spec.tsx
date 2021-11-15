import React from 'react'
import {render, fireEvent} from '@testing-library/react'

import Alert, {AlertType} from '../Alert'

const onClose = jest.fn()

describe('<Alert />', () => {
    it('should render an alert with a message with a default info type without icon', () => {
        const {container} = render(<Alert>This is an alert!</Alert>)
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each(Object.values(AlertType))(
        'should render icon for %s alert type',
        (type) => {
            const {container} = render(
                <Alert type={type} showIcon>
                    This is an alert!
                </Alert>
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it('should render an alert with an icon when showIcon prop is passed', () => {
        const {container} = render(<Alert showIcon>This is an alert!</Alert>)
        expect(container.firstChild).toMatchSnapshot()
    })

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
        const {getByTestId} = render(
            <Alert onClose={onClose}>This is an alert!</Alert>
        )
        fireEvent.click(getByTestId('close-trigger'))
        expect(onClose).toHaveBeenCalled()
    })
})
