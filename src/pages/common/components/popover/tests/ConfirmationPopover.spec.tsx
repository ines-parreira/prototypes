import React from 'react'
import {render, fireEvent} from '@testing-library/react'

import Button from 'pages/common/components/button/Button'

import ConfirmationPopover from '../ConfirmationPopover'
import Group from '../../layout/Group'

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

describe('<ConfirmationPopover />', () => {
    const defaultProps = {
        id: 'foo',
        content: 'Are you sure?',
        title: "I'm a title",
        onConfirm: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render', () => {
        const {container} = render(
            <ConfirmationPopover {...defaultProps}>
                {({uid, onDisplayConfirmation, elementRef}) => (
                    <Button
                        id={uid}
                        onClick={onDisplayConfirmation}
                        ref={elementRef}
                    >
                        Click Me!
                    </Button>
                )}
            </ConfirmationPopover>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display the confirmation popup when clicking the button', () => {
        const {getByText} = render(
            <ConfirmationPopover {...defaultProps}>
                {({uid, onDisplayConfirmation, elementRef}) => (
                    <Button
                        id={uid}
                        onClick={onDisplayConfirmation}
                        ref={elementRef}
                    >
                        Click Me!
                    </Button>
                )}
            </ConfirmationPopover>
        )

        fireEvent.click(getByText(/Click me!/i))
        expect(getByText(/I'm a title/i)).toBeTruthy()
    })

    it('should call the click handler after confirming the action', () => {
        const {getByText} = render(
            <ConfirmationPopover {...defaultProps}>
                {({uid, onDisplayConfirmation, elementRef}) => (
                    <Button
                        id={uid}
                        onClick={onDisplayConfirmation}
                        ref={elementRef}
                    >
                        Click Me!
                    </Button>
                )}
            </ConfirmationPopover>
        )

        fireEvent.click(getByText(/Click me!/i))
        fireEvent.click(getByText(/Confirm/i))
        expect(defaultProps.onConfirm).toHaveBeenCalled()
    })

    it('should trigger a form submit after confirming a form', () => {
        const handleSubmit = jest.fn()
        const {getByText} = render(
            <form onSubmit={handleSubmit}>
                <ConfirmationPopover
                    {...defaultProps}
                    buttonProps={{type: 'submit'}}
                >
                    {({uid, onDisplayConfirmation, elementRef}) => (
                        <Button
                            id={uid}
                            onClick={onDisplayConfirmation}
                            ref={elementRef}
                        >
                            Click Me!
                        </Button>
                    )}
                </ConfirmationPopover>
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
                <ConfirmationPopover
                    {...defaultProps}
                    buttonProps={{type: 'submit'}}
                >
                    {({uid, onDisplayConfirmation, elementRef}) => (
                        <Button
                            id={uid}
                            onClick={onDisplayConfirmation}
                            ref={elementRef}
                        >
                            Click Me!
                        </Button>
                    )}
                </ConfirmationPopover>
            </form>
        )

        fireEvent.click(getByText(/Click me!/i))
        expect(queryByText(/I'm a title/i)).toBeFalsy()
    })

    it('should clear the hide popover timeout on unmount', () => {
        const {getByText, unmount} = render(
            <ConfirmationPopover {...defaultProps}>
                {({uid, onDisplayConfirmation, elementRef}) => (
                    <Button
                        id={uid}
                        onClick={onDisplayConfirmation}
                        ref={elementRef}
                    >
                        Click Me!
                    </Button>
                )}
            </ConfirmationPopover>
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
                <ConfirmationPopover {...defaultProps}>
                    {({uid, onDisplayConfirmation, elementRef}) => (
                        <Button
                            id={uid}
                            onClick={onDisplayConfirmation}
                            ref={elementRef}
                        >
                            Click Me!
                        </Button>
                    )}
                </ConfirmationPopover>
            </div>
        )

        fireEvent.click(getByText(/Click me!/i))
        fireEvent.click(getByText(/Confirm/i))
        expect(mockHandleClick).not.toHaveBeenCalled()
    })

    it('should not apply positioning context to the confirmation button', () => {
        const {getByText} = render(
            <Group>
                <Button>Foo</Button>
                <ConfirmationPopover {...defaultProps}>
                    {({uid, onDisplayConfirmation, elementRef}) => (
                        <Button
                            id={uid}
                            onClick={onDisplayConfirmation}
                            ref={elementRef}
                        >
                            Click Me!
                        </Button>
                    )}
                </ConfirmationPopover>
            </Group>
        )

        fireEvent.click(getByText(/Click me!/i))
        expect(getByText(/Confirm/i).classList.contains('right')).toBeFalsy()
    })
})
