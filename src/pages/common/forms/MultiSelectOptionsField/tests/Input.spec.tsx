import React from 'react'

import { createEvent, fireEvent, render, screen } from '@testing-library/react'
import _noop from 'lodash/noop'

import Input from 'pages/common/forms/MultiSelectOptionsField/Input'

describe('MultiSelectField Input', () => {
    const defaultProps = {
        placeholder: 'some placeholder',
        value: 'foo',
        isFocused: true,
        onUp: _noop,
        onDown: _noop,
        onChange: _noop,
        onFocus: _noop,
        onBlur: _noop,
        onSubmit: _noop,
        onDelete: _noop,
    }

    it('should blur and clean the value on Escape', () => {
        const onChangeSpy = jest.fn()
        const onBlurSpy = jest.fn()
        render(
            <Input
                {...defaultProps}
                onChange={onChangeSpy}
                onBlur={onBlurSpy}
            />,
        )

        fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' })

        expect(onBlurSpy.mock.calls.length).toBe(1)
        expect(onChangeSpy.mock.calls.length).toBe(1)
        expect(onChangeSpy.mock.calls[0]).toEqual([''])
    })

    it('should call onDown when ArrowDown pressed', () => {
        const onDownSpy = jest.fn()
        render(<Input {...defaultProps} onDown={onDownSpy} />)

        fireEvent.keyDown(screen.getByRole('textbox'), { key: 'ArrowDown' })

        expect(onDownSpy).toBeCalled()
    })

    it('should call onUp when ArrowUp pressed', () => {
        const onUpSpy = jest.fn()
        render(<Input {...defaultProps} onUp={onUpSpy} />)

        fireEvent.keyDown(screen.getByRole('textbox'), { key: 'ArrowUp' })

        expect(onUpSpy).toBeCalled()
    })

    it('should call onSubmit when Tab/Enter pressed', () => {
        const onSubmitSpy = jest.fn()
        render(<Input {...defaultProps} onSubmit={onSubmitSpy} />)

        fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Tab' })
        fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })

        expect(onSubmitSpy.mock.calls).toHaveLength(2)
    })

    it('should call onDelete when Backspace pressed and there is no input', () => {
        const onDeleteSpy = jest.fn()
        const { rerender } = render(
            <Input {...defaultProps} value="foo" onDelete={onDeleteSpy} />,
        )

        fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Backspace' })
        rerender(<Input {...defaultProps} value="" onDelete={onDeleteSpy} />)
        fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Backspace' })

        expect(onDeleteSpy.mock.calls).toHaveLength(1)
    })

    it.each(['ArrowUp', 'ArrowDown', 'Enter'])(
        'should stop propagation of events',
        (key) => {
            const stopPropagationSpy = jest.fn()
            const preventDefaultSpy = jest.fn()

            render(<Input {...defaultProps} value={undefined} />)

            const input = screen.getByRole('textbox')
            const keyDownEvent = createEvent.keyDown(input, {
                key,
                preventDefault: preventDefaultSpy,
            })
            keyDownEvent.preventDefault = preventDefaultSpy
            keyDownEvent.stopPropagation = stopPropagationSpy
            fireEvent(input, keyDownEvent)

            expect(preventDefaultSpy).toHaveBeenCalled()
            expect(stopPropagationSpy).toHaveBeenCalled()
        },
    )

    it('should stop propagation of "Tab" event because input is not empty', () => {
        const stopPropagationSpy = jest.fn()
        const preventDefaultSpy = jest.fn()

        render(<Input {...defaultProps} value="foo" />)

        const input = screen.getByRole('textbox')
        const keyDownEvent = createEvent.keyDown(input, {
            key: 'Tab',
            preventDefault: preventDefaultSpy,
        })
        keyDownEvent.preventDefault = preventDefaultSpy
        keyDownEvent.stopPropagation = stopPropagationSpy
        fireEvent(input, keyDownEvent)

        expect(preventDefaultSpy).toHaveBeenCalled()
        expect(stopPropagationSpy).toHaveBeenCalled()
    })

    it('should not stop propagation of "Tab" event because input is empty', () => {
        const stopPropagationSpy = jest.fn()
        const preventDefaultSpy = jest.fn()

        render(<Input {...defaultProps} value="" />)

        const input = screen.getByRole('textbox')
        const keyDownEvent = createEvent.keyDown(input, {
            key: 'Tab',
            preventDefault: preventDefaultSpy,
        })
        keyDownEvent.preventDefault = preventDefaultSpy
        keyDownEvent.stopPropagation = stopPropagationSpy
        fireEvent(input, keyDownEvent)

        expect(preventDefaultSpy).not.toHaveBeenCalled()
        expect(stopPropagationSpy).not.toHaveBeenCalled()
    })
})
