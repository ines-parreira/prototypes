import React, {ComponentProps} from 'react'
import {render, fireEvent} from '@testing-library/react'

import ConfirmButton from '../ConfirmButton'

jest.spyOn(window, 'clearTimeout')

jest.mock('reactstrap', () => {
    const reactstrap: Record<string, unknown> = jest.requireActual('reactstrap')

    return {
        ...reactstrap,
        Popover: (props: Record<string, any>) => {
            return props.isOpen ? <div {...props}>{props.children}</div> : null
        },
    }
})

describe('<ConfirmButton />', () => {
    const defaultProps: ComponentProps<typeof ConfirmButton> = {
        id: 'foo',
        confirmationContent: 'Are you sure?',
        confirmationTitle: "I'm a title",
        onConfirm: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render', () => {
        const {container} = render(
            <ConfirmButton {...defaultProps}>Click me!</ConfirmButton>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display the confirmation popup when clicking the button', () => {
        const {getByText} = render(
            <ConfirmButton {...defaultProps}>Click me!</ConfirmButton>
        )

        fireEvent.click(getByText(/Click me!/i))
        expect(getByText(/I'm a title/i)).toBeTruthy()
    })

    it('should call the click handler after confirming the action', () => {
        const {getByText} = render(
            <ConfirmButton {...defaultProps}>Click me!</ConfirmButton>
        )

        fireEvent.click(getByText(/Click me!/i))
        fireEvent.click(getByText(/Confirm/i))
        expect(defaultProps.onConfirm).toHaveBeenCalled()
    })

    it('should trigger a form submit after confirming a form', () => {
        const handleSubmit = jest.fn()
        const {getByText} = render(
            <form onSubmit={handleSubmit}>
                <ConfirmButton {...defaultProps} type="submit">
                    Click me!
                </ConfirmButton>
            </form>
        )

        fireEvent.click(getByText(/Click me!/i))
        fireEvent.click(getByText(/Confirm/i))
        expect(handleSubmit).toHaveBeenCalled()
    })

    it('should not open the confirmation when the form is wrong', () => {
        const handleSubmit = jest.fn()
        const {getByText, queryByText} = render(
            <form onSubmit={handleSubmit}>
                <input type="text" required value="" />
                <ConfirmButton {...defaultProps} type="submit">
                    Click me!
                </ConfirmButton>
            </form>
        )

        fireEvent.click(getByText(/Click me!/i))
        expect(queryByText(/I'm a title/i)).toBeFalsy()
    })

    it('should clear the hide popover timeout on unmount', () => {
        const {getByText, unmount} = render(
            <ConfirmButton {...defaultProps}>Click me!</ConfirmButton>
        )

        fireEvent.click(getByText(/Click me!/i))
        fireEvent.click(getByText(/Confirm/i))
        unmount()
        expect(window.clearTimeout).toHaveBeenCalled()
    })

    it('should prevent the event bubbling from the confirmation popover', () => {
        const mockHandleClick = jest.fn()

        const {getByText} = render(
            <div onClick={mockHandleClick}>
                <ConfirmButton {...defaultProps}>Click me!</ConfirmButton>
            </div>
        )

        fireEvent.click(getByText(/Click me!/i))
        fireEvent.click(getByText(/Confirm/i))
        expect(mockHandleClick).not.toHaveBeenCalled()
    })
})
