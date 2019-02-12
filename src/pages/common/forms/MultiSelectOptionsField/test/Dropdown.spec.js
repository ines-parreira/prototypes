// @flow
import {mount} from 'enzyme'
import _noop from 'lodash/noop'
import React from 'react'

import Dropdown from '../Dropdown'
import Input from '../Input'
import Menu from '../Menu'

describe('MultiSelectField Dropdown', () => {
    const options = [{
        value: 'foo',
        label: 'foo'
    }, {
        value: 'bar',
        label: 'bar'
    }, {
        value: 'baz',
        label: 'baz'
    }]

    const defaultProps = {
        options,
        placeholder: 'some placeholder',
        value: '',
        onChange: _noop,
        onFocus: _noop,
        onBlur: _noop,
        onSelect: _noop,
        onDelete: _noop,
        isFocused: false
    }

    describe('input arrow up', () => {
        it('should move the selection up', () => {
            const wrapper = mount(
                <Dropdown
                    {...defaultProps}
                />
            )
            wrapper.find(Menu).prop('onActivate')(2)
            wrapper.find(Input).prop('onUp')()
            wrapper.update()
            expect(wrapper.find(Menu).prop('activeIndex')).toBe(1)
        })

        it('should not go below selected index 0', () => {
            const wrapper = mount(
                <Dropdown
                    {...defaultProps}
                    options={options}
                />
            )
            wrapper.find(Menu).prop('onActivate')(0)
            wrapper.find(Input).prop('onUp')()
            wrapper.update()
            expect(wrapper.find(Menu).prop('activeIndex')).toBe(0)
        })
    })

    describe('input arrow down', () => {
        it('should move the selection down', () => {
            const wrapper = mount(
                <Dropdown
                    {...defaultProps}
                />
            )
            wrapper.find(Menu).prop('onActivate')(1)
            wrapper.find(Input).prop('onDown')()
            wrapper.update()
            expect(wrapper.find(Menu).prop('activeIndex')).toBe(2)
        })

        it('should not go up more than the number of options', () => {
            const wrapper = mount(
                <Dropdown
                    {...defaultProps}
                    options={options}
                />
            )
            wrapper.find(Menu).prop('onActivate')(2)
            wrapper.find(Input).prop('onDown')()
            wrapper.update()
            expect(wrapper.find(Menu).prop('activeIndex')).toBe(2)
        })
    })

    describe('selection reset', () => {
        it('should reset selection if options change', () => {
            const wrapper = mount(
                <Dropdown
                    {...defaultProps}
                />
            )
            wrapper.find(Menu).prop('onActivate')(2)
            wrapper.setProps({
                options: [options[0]]
            })
            wrapper.update()
            expect(wrapper.find(Menu).prop('activeIndex')).toBe(0)
        })

        it('should not reset selection if options did not change', () => {
            const wrapper = mount(
                <Dropdown
                    {...defaultProps}
                />
            )
            wrapper.find(Menu).prop('onActivate')(2)
            wrapper.setProps({options})
            wrapper.update()
            expect(wrapper.find(Menu).prop('activeIndex')).toBe(2)
        })
    })
})
