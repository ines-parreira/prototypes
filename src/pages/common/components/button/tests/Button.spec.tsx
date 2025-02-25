import React, { createRef } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import Button from '../Button'

describe('<Button />', () => {
    it('should render button label', () => {
        const buttonLabel = 'button label'
        render(<Button>{buttonLabel}</Button>)

        expect(screen.getByText(buttonLabel)).toBeVisible()
    })

    it('should render a spinner when loading', () => {
        render(<Button isLoading>Click me</Button>)

        expect(screen.getByRole('status')).toBeVisible()
    })

    it('should render a leading icon', () => {
        render(<Button leadingIcon="add">Click me</Button>)

        expect(
            screen.getByRole('button', { name: 'Click me' }).querySelector('i')
                ?.innerHTML,
        ).toEqual('add')
    })

    it('should render a trailing icon', () => {
        render(<Button trailingIcon="expand_more">Click me</Button>)

        expect(
            screen.getByRole('button', { name: 'Click me' }).querySelector('i')
                ?.innerHTML,
        ).toEqual('expand_more')
    })

    it('should render both leading and trailing icons together', () => {
        render(
            <Button leadingIcon="add" trailingIcon="expand_more">
                Click me
            </Button>,
        )

        const [leadingIcon, trailingIcon] = screen
            .getByRole('button', { name: 'Click me' })
            .querySelectorAll('i')

        expect(leadingIcon.innerHTML).toEqual('add')
        expect(trailingIcon.innerHTML).toEqual('expand_more')
    })

    it('should allow rendering the small variation of the icons', () => {
        render(
            <Button leadingIcon="add" trailingIcon="expand_more" size="small">
                Click me
            </Button>,
        )

        const [leadingIcon, trailingIcon] = screen
            .getByRole('button', { name: 'Click me' })
            .querySelectorAll('i')

        expect(leadingIcon).toHaveClass('small')
        expect(trailingIcon).toHaveClass('small')
    })

    it('should not render the leading icon when loading', () => {
        render(
            <Button isLoading leadingIcon="add" trailingIcon="expand_more">
                Click me
            </Button>,
        )

        const icons = screen
            .getByRole('button', { name: 'Loading... Click me' })
            .querySelectorAll('i')

        expect(icons.length).toEqual(1)

        expect(icons[0].innerHTML).toEqual('expand_more')
    })

    it('should render a disabled button', () => {
        render(<Button isDisabled>Click me</Button>)

        expect(
            screen.getByRole('button', { name: 'Click me' }),
        ).toBeAriaDisabled()
    })

    it('should render a disabled button with a spinner', () => {
        render(
            <Button isDisabled isLoading>
                Click me
            </Button>,
        )

        expect(
            screen.getByRole('button', { name: 'Loading... Click me' }),
        ).toBeAriaDisabled()
    })

    it('should call click actions when button is enabled', () => {
        const onClick = jest.fn()
        const onClickCapture = jest.fn()
        const onMouseDown = jest.fn()
        const onMouseUp = jest.fn()
        const onSubmit = jest.fn()

        render(
            <form onSubmit={onSubmit}>
                <Button
                    onClick={onClick}
                    onClickCapture={onClickCapture}
                    onMouseDown={onMouseDown}
                    onMouseUp={onMouseUp}
                    type="submit"
                >
                    Click me
                </Button>
            </form>,
        )

        fireEvent.click(screen.getByRole('button', { name: 'Click me' }))
        expect(onClick).toHaveBeenCalled()
        expect(onClickCapture).toHaveBeenCalled()
        expect(onSubmit).toHaveBeenCalled()

        fireEvent.mouseDown(screen.getByRole('button', { name: 'Click me' }))
        expect(onMouseDown).toHaveBeenCalled()

        fireEvent.mouseUp(screen.getByRole('button', { name: 'Click me' }))
        expect(onMouseUp).toHaveBeenCalled()
    })

    it('should prevent click actions when button is disabled', () => {
        const onClick = jest.fn()
        const onClickCapture = jest.fn()
        const onMouseDown = jest.fn()
        const onMouseUp = jest.fn()
        const onSubmit = jest.fn()

        render(
            <form onSubmit={onSubmit}>
                <Button
                    isDisabled
                    onClick={onClick}
                    onClickCapture={onClickCapture}
                    onMouseDown={onMouseDown}
                    onMouseUp={onMouseUp}
                    type="submit"
                >
                    Click me
                </Button>
            </form>,
        )

        fireEvent.click(screen.getByRole('button', { name: 'Click me' }))
        expect(onClick).not.toHaveBeenCalled()
        expect(onClickCapture).not.toHaveBeenCalled()
        expect(onSubmit).not.toHaveBeenCalled()

        fireEvent.mouseDown(screen.getByRole('button', { name: 'Click me' }))
        expect(onMouseDown).not.toHaveBeenCalled()

        fireEvent.mouseUp(screen.getByRole('button', { name: 'Click me' }))
        expect(onMouseUp).not.toHaveBeenCalled()
    })

    it('should prevent default action when button is loading', () => {
        const onClick = jest.fn()

        render(
            <Button isLoading onClick={onClick}>
                Click me
            </Button>,
        )

        fireEvent.click(
            screen.getByRole('button', { name: 'Loading... Click me' }),
        )

        expect(onClick).not.toHaveBeenCalled()
    })

    it('should call onClick handler', () => {
        const onClick = jest.fn()

        render(<Button onClick={onClick}>Click me</Button>)

        fireEvent.click(screen.getByRole('button', { name: 'Click me' }))

        expect(onClick).toHaveBeenCalled()
    })

    it('should render a Button with anchor element', () => {
        render(
            <Button as="a" href="https://example.gorgias.com">
                Click me
            </Button>,
        )

        expect(screen.getByRole('link', { name: 'Click me' })).toBeVisible()
        expect(
            screen.queryByRole('button', { name: 'Click me' }),
        ).not.toBeInTheDocument()
    })

    it('should render a Button with button element', () => {
        render(<Button>Click me</Button>)

        expect(
            screen.queryByRole('link', { name: 'Click me' }),
        ).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Click me' })).toBeVisible()
    })

    it('should expect type error when trying to use a Button with href prop', () => {
        render(
            // @ts-expect-error
            <Button href="https://example.com">Click me</Button>,
        )

        // Although we're passing href prop, the Button component should render as a button
        // because we didn't pass the `as="a"` prop
        expect(screen.queryByRole('button', { name: 'Click me' })).toBeVisible()
    })

    it('should expect type error when trying to pass a button ref to a link Button', () => {
        render(
            // @ts-expect-error
            <Button
                as="a"
                href="example.gorgias.com"
                ref={createRef<HTMLButtonElement>()}
            >
                Click me
            </Button>,
        )

        // Although we're passing a button ref, the Button component should render as an anchor
        expect(screen.queryByRole('link', { name: 'Click me' })).toBeVisible()
    })
})
