import React from 'react'
import {shallow, mount} from 'enzyme'
import _noop from 'lodash/noop'

// refs are not passed by enzyme to popper.js
// https://github.com/facebook/react/issues/9244
// https://github.com/facebook/react/issues/7371
jest.mock('popper.js', () => {
    return () => {
        return {
            scheduleUpdate: jest.fn(),
            destroy: jest.fn(),
        }
    }
})

import SelectField from '../SelectField.tsx'

describe('SelectField', () => {
    const minProps = {
        onChange: _noop,
    }

    const props = {
        value: 1,
        options: [
            {
                value: 1,
                text: 'first',
                label: 'First',
            },
            {
                value: 2,
                text: 'second',
                label: 'Second',
            },
        ],
        onChange: _noop,
        placeholder: 'placeholder',
        style: {
            background: 'red',
        },
    }

    it('should use default props', () => {
        const component = mount(<SelectField {...minProps} />)
        expect(component.props()).toMatchSnapshot()
    })

    it('should init state with default props', () => {
        const component = mount(<SelectField {...minProps} />)
        expect(component.state()).toMatchSnapshot()
    })

    it('should render a select input with default props', () => {
        const component = shallow(<SelectField {...minProps} />)
        expect(component).toMatchSnapshot()
    })

    it('should use custom props', () => {
        const component = mount(<SelectField {...minProps} {...props} />)
        expect(component.props()).toMatchSnapshot()
    })

    it('should init state with custom props', () => {
        const component = mount(<SelectField {...minProps} {...props} />)
        expect(component.state()).toMatchSnapshot()
    })

    it('should render a select input with custom props', () => {
        const component = shallow(<SelectField {...minProps} {...props} />)
        expect(component).toMatchSnapshot()
    })

    it('should set the minWidth of the input according to the length of the longest label', () => {
        const component = shallow(
            <SelectField {...minProps} {...props} fixedWidth />
        )
        expect(component).toMatchSnapshot()
    })

    it('should update state when search changes (custom values allowed)', () => {
        const options = [
            {
                value: 'hello',
                label: 'Hello',
            },
            {
                value: 'world',
                label: 'World',
            },
        ]

        const wrapper = shallow(
            <SelectField {...minProps} options={options} allowCustomValue />
        )
        const component = wrapper.instance()

        component._onSearchChange({
            currentTarget: {value: 'hello'},
        })
        expect(wrapper.state()).toMatchSnapshot()

        component._onSearchChange({
            currentTarget: {value: ''},
        })
        expect(wrapper.state()).toMatchSnapshot()
    })

    it('should update state when search changes (custom NOT values allowed)', () => {
        const options = [
            {
                value: 'hello',
                label: 'Hello',
            },
            {
                value: 'world',
                label: 'World',
            },
        ]

        const wrapper = mount(<SelectField {...minProps} options={options} />)
        const component = wrapper.instance()
        component._onSearchChange({
            currentTarget: {value: 'hello'},
        })
        expect(wrapper.state()).toMatchSnapshot()

        component._onSearchChange({
            currentTarget: {value: ''},
        })
        expect(wrapper.state()).toMatchSnapshot()
    })

    it('should handle search on mixed label type options', () => {
        const options = [
            {
                value: 'hello1',
                label: <i>Hello1</i>,
            },
            {
                value: 'hello2',
                text: 'Hello2',
                label: <b>Hello2</b>,
            },
        ]

        const wrapper = mount(<SelectField {...minProps} options={options} />)

        wrapper.instance()._onSearchChange({
            currentTarget: {value: 'hello'},
        })
        wrapper.update()

        const items = wrapper.find('DropdownItem')
        expect(items).toHaveLength(1)
        expect(items.at(0)).toHaveText('Hello2')
    })

    it('should reset state on blur', () => {
        const wrapper = mount(<SelectField {...minProps} {...props} />)
        const component = wrapper.instance()

        component._focusInput()
        component._onSearchChange({
            currentTarget: {value: ''},
        })
        component._blurInput()
        expect(wrapper.state()).toMatchSnapshot()
    })

    it('stopPropagation()', () => {
        const stopPropagationSpy = jest.fn()
        const preventDefaultSpy = jest.fn()
        const event = {
            stopPropagation: stopPropagationSpy,
            preventDefault: preventDefaultSpy,
        }
        const wrapper = mount(<SelectField {...minProps} {...props} />)
        const component = wrapper.instance()

        component._stopPropagation(event)
        expect(stopPropagationSpy.mock.calls.length).toBe(1)
        expect(preventDefaultSpy.mock.calls.length).toBe(1)
    })

    it('should handle click on option (custom value NOT allowed)', () => {
        const stopPropagationSpy = jest.fn()
        const onChangeSpy = jest.fn()
        const wrapper = mount(
            <SelectField
                {...minProps}
                {...props}
                value={undefined}
                onChange={onChangeSpy}
            />
        )
        const component = wrapper.instance()

        component._stopPropagation = stopPropagationSpy
        wrapper.find('button').first().simulate('click')

        expect(stopPropagationSpy.mock.calls.length).toBe(1)
        expect(onChangeSpy.mock.calls[0][0]).toEqual(1)
    })

    it('should handle click on option (custom value allowed)', () => {
        const stopPropagationSpy = jest.fn()
        const onChangeSpy = jest.fn()
        const wrapper = mount(
            <SelectField
                {...minProps}
                {...props}
                value={undefined}
                onChange={onChangeSpy}
                allowCustomValue
            />
        )
        const component = wrapper.instance()
        component._onSearchChange({
            currentTarget: {value: 'hello'},
        })
        component._stopPropagation = stopPropagationSpy
        wrapper.update()
        wrapper.find('button').first().simulate('click')

        expect(stopPropagationSpy.mock.calls.length).toBe(1)
        expect(onChangeSpy.mock.calls[0][0]).toEqual('hello')
    })

    describe('should handle key down event', () => {
        const addKeys = ['Enter', 'Tab']

        it('Escape', () => {
            const wrapper = mount(<SelectField {...minProps} {...props} />)
            const component = wrapper.instance()

            component._onSearchChange({
                currentTarget: {value: 'hello'},
            })

            component._toggleDropdown()
            wrapper.find('input').simulate('keyDown', {key: 'Escape'})
            expect(wrapper.state()).toMatchSnapshot()
        })

        it('ArrowUp/ArrowDown', () => {
            const wrapper = mount(
                <SelectField {...minProps} {...props} value={undefined} />
            )
            const component = wrapper.instance()

            component._toggleDropdown()

            wrapper.find('input').simulate('keyDown', {key: 'ArrowDown'})
            expect(wrapper.state().selectedOptionIndex).toEqual(1)

            wrapper.find('input').simulate('keyDown', {key: 'ArrowDown'})
            // cannot select an item that does not exist
            expect(wrapper.state().selectedOptionIndex).toEqual(1)

            wrapper.find('input').simulate('keyDown', {key: 'ArrowUp'})
            expect(wrapper.state().selectedOptionIndex).toEqual(0)

            wrapper.find('input').simulate('keyDown', {key: 'ArrowUp'})
            expect(wrapper.state().selectedOptionIndex).toEqual(0)

            wrapper.find('input').simulate('keyDown', {key: 'ArrowUp'})
            // cannot select an item that does not exist
            expect(wrapper.state().selectedOptionIndex).toEqual(0)
        })

        it('ArrowUp/ArrowDown (custom value allowed)', () => {
            const wrapper = mount(
                <SelectField
                    {...minProps}
                    {...props}
                    value={undefined}
                    allowCustomValue
                />
            )
            const component = wrapper.instance()
            component._toggleDropdown()

            wrapper.find('input').simulate('keyDown', {key: 'ArrowDown'})
            expect(wrapper.state().selectedOptionIndex).toEqual(0)

            wrapper.find('input').simulate('keyDown', {key: 'ArrowUp'})
            expect(wrapper.state().selectedOptionIndex).toEqual(-1)

            wrapper.find('input').simulate('keyDown', {key: 'ArrowUp'})
            // cannot select an item that does not exist
            expect(wrapper.state().selectedOptionIndex).toEqual(-1)
        })

        it('Enter/tab (custom value)', () => {
            addKeys.forEach((key) => {
                const onChangeSpy = jest.fn()
                const wrapper = mount(
                    <SelectField
                        {...minProps}
                        {...props}
                        onChange={onChangeSpy}
                        allowCustomValue
                    />
                )
                const component = wrapper.instance()

                component._onSearchChange({
                    currentTarget: {value: 'custom value'},
                })
                wrapper.find('input').simulate('keyDown', {key})

                expect(wrapper.state()).toMatchSnapshot()
                expect(onChangeSpy.mock.calls[0][0]).toEqual('custom value')
            })
        })

        it('Enter/Tab (existing value)', () => {
            addKeys.forEach((key) => {
                const onChangeSpy = jest.fn()
                const wrapper = mount(
                    <SelectField
                        {...minProps}
                        {...props}
                        value={undefined}
                        onChange={onChangeSpy}
                    />
                )
                const component = wrapper.instance()

                component._toggleDropdown()
                wrapper.find('input').simulate('keyDown', {key})

                expect(wrapper.state()).toMatchSnapshot()
                expect(onChangeSpy.mock.calls[0][0]).toEqual(
                    props.options[0].value
                )
            })
        })

        it('Enter/Tab (disabled value)', () => {
            const optionsWithDisabledValue = [
                {
                    value: 'disabled',
                    label: 'disabled',
                    isDisabled: true,
                },

                ...props.options,
            ]
            const onChangeSpy = jest.fn()
            const wrapper = mount(
                <SelectField
                    {...minProps}
                    {...props}
                    options={optionsWithDisabledValue}
                    value={undefined}
                    onChange={onChangeSpy}
                    allowCustomValue
                />
            )

            wrapper.find('input').simulate('keyDown', {key: 'ArrowDown'})
            wrapper.find('input').simulate('keyDown', {key: 'Enter'})
            expect(onChangeSpy.mock.calls.length).toEqual(0)

            wrapper.find('input').simulate('keyDown', {key: 'ArrowDown'})
            wrapper.find('input').simulate('keyDown', {key: 'Enter'})
            expect(onChangeSpy.mock.calls.length).toEqual(1)
        })

        it('should stop propagation of events', () => {
            const keys = ['ArrowUp', 'ArrowDown', 'Enter', 'Tab']
            keys.forEach((key) => {
                const stopPropagationSpy = jest.fn()
                const wrapper = mount(
                    <SelectField {...minProps} {...props} value={undefined} />
                )
                const component = wrapper.instance()

                component._stopPropagation = stopPropagationSpy
                wrapper.find('input').simulate('keyDown', {key})

                expect(stopPropagationSpy.mock.calls.length).toEqual(1)
            })
        })
    })

    describe('select with headers and dividers', () => {
        const options = [
            {label: 'Group 1', isHeader: true},
            {label: 'Foo', value: 'foo'},
            {label: 'Bar', value: 'bar'},
            {isDivider: true},
            {label: 'Group 2', isHeader: true},
            {label: 'Baz', value: 'baz'},
            {isDivider: true},
            {label: 'Group 3', isHeader: true},
            {label: 'Lorem ipsum', value: 'loremipsum'},
            {isDivider: true},
        ]

        it('should filter corresponding headers and dividers when search applied', () => {
            const wrapper = mount(
                <SelectField {...minProps} options={options} />
            )
            expect(wrapper.state()).toMatchSnapshot()

            wrapper.instance()._onSearchChange({
                currentTarget: {value: 'ba'},
            })
            wrapper.update()

            expect(wrapper.state()).toMatchSnapshot()
        })

        it('ArrowUp/ArrowDown should skip dividers and headers', () => {
            const wrapper = mount(
                <SelectField {...minProps} options={options} />
            )

            const component = wrapper.instance()

            component._toggleDropdown()

            wrapper.find('input').simulate('keyDown', {key: 'ArrowDown'})
            expect(wrapper.state().selectedOptionIndex).toEqual(1)

            wrapper.find('input').simulate('keyDown', {key: 'ArrowDown'})
            expect(wrapper.state().selectedOptionIndex).toEqual(2)

            wrapper.find('input').simulate('keyDown', {key: 'ArrowDown'})
            expect(wrapper.state().selectedOptionIndex).toEqual(5)

            wrapper.find('input').simulate('keyDown', {key: 'ArrowUp'})
            expect(wrapper.state().selectedOptionIndex).toEqual(2)

            wrapper.find('input').simulate('keyDown', {key: 'ArrowUp'})
            expect(wrapper.state().selectedOptionIndex).toEqual(1)

            wrapper.find('input').simulate('keyDown', {key: 'ArrowUp'})
            expect(wrapper.state().selectedOptionIndex).toEqual(1)
        })

        it('Enter/Tab should not be applied for headers and dividers', () => {
            const onChangeSpy = jest.fn()
            const wrapper = mount(
                <SelectField
                    {...minProps}
                    options={options}
                    onChange={onChangeSpy}
                />
            )

            const component = wrapper.instance()

            component._toggleDropdown()

            wrapper.find('input').simulate('keyDown', {key: 'Enter'})
            expect(onChangeSpy.mock.calls.length).toEqual(0)

            wrapper.find('input').simulate('keyDown', {key: 'ArrowDown'})
            wrapper.find('input').simulate('keyDown', {key: 'Enter'})
            expect(onChangeSpy.mock.calls.length).toEqual(1)
        })
    })
})
