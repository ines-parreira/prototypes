import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'

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
            screen.getByRole('button', {name: 'Click me'}).querySelector('i')
                ?.innerHTML
        ).toEqual('add')
    })

    it('should render a trailing icon', () => {
        render(<Button trailingIcon="expand_more">Click me</Button>)

        expect(
            screen.getByRole('button', {name: 'Click me'}).querySelector('i')
                ?.innerHTML
        ).toEqual('expand_more')
    })

    it('should render both leading and trailing icons together', () => {
        render(
            <Button leadingIcon="add" trailingIcon="expand_more">
                Click me
            </Button>
        )

        const [leadingIcon, trailingIcon] = screen
            .getByRole('button', {name: 'Click me'})
            .querySelectorAll('i')

        expect(leadingIcon.innerHTML).toEqual('add')
        expect(trailingIcon.innerHTML).toEqual('expand_more')
    })

    it('should not render the leading icon when loading', () => {
        render(
            <Button isLoading leadingIcon="add" trailingIcon="expand_more">
                Click me
            </Button>
        )

        const icons = screen
            .getByRole('button', {name: 'Loading... Click me'})
            .querySelectorAll('i')

        expect(icons.length).toEqual(1)

        expect(icons[0].innerHTML).toEqual('expand_more')
    })

    it('should render a disabled button', () => {
        render(<Button isDisabled>Click me</Button>)

        expect(
            screen.getByRole('button', {name: 'Click me'})
        ).toBeAriaDisabled()
    })

    it('should render a disabled button with a spinner', () => {
        render(
            <Button isDisabled isLoading>
                Click me
            </Button>
        )

        expect(
            screen.getByRole('button', {name: 'Loading... Click me'})
        ).toBeAriaDisabled()
    })

    it('should prevent default action when button is disabled', () => {
        const onClick = jest.fn()

        render(
            <Button isDisabled onClick={onClick}>
                Click me
            </Button>
        )

        fireEvent.click(screen.getByRole('button', {name: 'Click me'}))

        expect(onClick).not.toHaveBeenCalled()
    })

    it('should prevent default action when button is loading', () => {
        const onClick = jest.fn()

        render(
            <Button isLoading onClick={onClick}>
                Click me
            </Button>
        )

        fireEvent.click(
            screen.getByRole('button', {name: 'Loading... Click me'})
        )

        expect(onClick).not.toHaveBeenCalled()
    })

    it('should call onClick handler', () => {
        const onClick = jest.fn()

        render(<Button onClick={onClick}>Click me</Button>)

        fireEvent.click(screen.getByRole('button', {name: 'Click me'}))

        expect(onClick).toHaveBeenCalled()
    })
})
