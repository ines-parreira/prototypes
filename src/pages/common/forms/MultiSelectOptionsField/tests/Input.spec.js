// @flow
import {mount} from 'enzyme'
import _noop from 'lodash/noop'
import React from 'react'

import Input from '../Input'

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
        const wrapper = mount(
            <Input
                {...defaultProps}
                onChange={onChangeSpy}
                onBlur={onBlurSpy}
            />
        )
        wrapper.find('input').simulate('keyDown', {key: 'Escape'})
        expect(onBlurSpy.mock.calls.length).toBe(1)
        expect(onChangeSpy.mock.calls.length).toBe(1)
        expect(onChangeSpy.mock.calls[0]).toEqual([''])
    })

    it('should call onDown when ArrowDown pressed', () => {
        const onDownSpy = jest.fn()
        const wrapper = mount(<Input {...defaultProps} onDown={onDownSpy} />)
        wrapper.find('input').simulate('keyDown', {key: 'ArrowDown'})
        expect(onDownSpy).toBeCalled()
    })

    it('should call onUp when ArrowUp pressed', () => {
        const onUpSpy = jest.fn()
        const wrapper = mount(<Input {...defaultProps} onUp={onUpSpy} />)
        wrapper.find('input').simulate('keyDown', {key: 'ArrowUp'})
        expect(onUpSpy).toBeCalled()
    })

    it('should call onSubmit when Tab/Enter pressed', () => {
        const onSubmitSpy = jest.fn()
        const wrapper = mount(
            <Input {...defaultProps} onSubmit={onSubmitSpy} />
        )
        wrapper.find('input').simulate('keyDown', {key: 'Tab'})
        wrapper.find('input').simulate('keyDown', {key: 'Enter'})
        expect(onSubmitSpy.mock.calls).toHaveLength(2)
    })

    it('should call onDelete when Backspace pressed and there is no input', () => {
        const onDeleteSpy = jest.fn()
        const wrapper = mount(
            <Input {...defaultProps} value="foo" onDelete={onDeleteSpy} />
        )
        wrapper.find('input').simulate('keyDown', {key: 'Backspace'})
        wrapper.setProps({value: ''})
        wrapper.find('input').simulate('keyDown', {key: 'Backspace'})
        expect(onDeleteSpy.mock.calls).toHaveLength(1)
    })

    it('should stop propagation of events', () => {
        const keys = ['ArrowUp', 'ArrowDown', 'Enter']
        keys.forEach((key: string) => {
            const stopPropagationSpy = jest.fn()
            const preventDefaultSpy = jest.fn()

            const wrapper = mount(<Input {...defaultProps} value={undefined} />)

            wrapper.find('input').simulate('keyDown', {
                key,
                preventDefault: preventDefaultSpy,
                stopPropagation: stopPropagationSpy,
            })

            expect(preventDefaultSpy.mock.calls).toHaveLength(1)
            expect(stopPropagationSpy.mock.calls).toHaveLength(1)
        })
    })

    it('should stop propagation of "Tab" event because input is not empty', () => {
        const stopPropagationSpy = jest.fn()
        const preventDefaultSpy = jest.fn()

        const wrapper = mount(<Input {...defaultProps} value="foo" />)

        wrapper.find('input').simulate('keyDown', {
            key: 'Tab',
            preventDefault: preventDefaultSpy,
            stopPropagation: stopPropagationSpy,
        })

        expect(preventDefaultSpy.mock.calls).toHaveLength(1)
        expect(stopPropagationSpy.mock.calls).toHaveLength(1)
    })

    it('should not stop propagation of "Tab" event because input is empty', () => {
        const stopPropagationSpy = jest.fn()
        const preventDefaultSpy = jest.fn()

        const wrapper = mount(<Input {...defaultProps} value="" />)

        wrapper.find('input').simulate('keyDown', {
            key: 'Tab',
            preventDefault: preventDefaultSpy,
            stopPropagation: stopPropagationSpy,
        })

        expect(preventDefaultSpy.mock.calls).toHaveLength(0)
        expect(stopPropagationSpy.mock.calls).toHaveLength(0)
    })
})
