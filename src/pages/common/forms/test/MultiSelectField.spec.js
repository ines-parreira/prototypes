import React from 'react'
import {shallow, mount} from 'enzyme'
import _noop from 'lodash/noop'

import MultiSelectField from '../MultiSelectField'

describe('MultiSelectField', () => {
    const minProps = {
        onChange: _noop
    }

    const props = {
        values: [1, 3],
        options: [{
            value: 1,
            text: 'first',
            label: 'First',
        }, {
            value: 2,
            text: 'second',
            label: 'Second',
        }, {
            value: 3,
            text: 'third',
            label: 'Third',
        }],
        onChange: _noop,
        plural: 'tags',
        singular: 'tag',
        allowCustomValues: true,

    }

    it('should use default props', () => {
        const component = mount(
            <MultiSelectField {...minProps}/>)
        expect(component.props()).toMatchSnapshot()
    })

    it('should init state with default props', () => {
        const component = mount(<MultiSelectField {...minProps}/>)
        expect(component.state()).toMatchSnapshot()
    })

    it('should render a select input with default props', () => {
        const component = shallow(<MultiSelectField {...minProps}/>)
        expect(component).toMatchSnapshot()
    })

    it('should use custom props', () => {
        const component = mount(
            <MultiSelectField
                {...minProps}
                {...props}
            />
        )
        expect(component.props()).toMatchSnapshot()
    })

    it('should init state with custom props', () => {
        const component = mount(
            <MultiSelectField
                {...minProps}
                {...props}
            />
        )
        expect(component.state()).toMatchSnapshot()
    })

    it('should render a multi select input with custom props', () => {
        const component = shallow(
            <MultiSelectField
                {...minProps}
                {...props}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should update state when search changes (custom values allowed)', () => {
        const options = [{
            value: 'hello',
            label: 'Hello'
        }, {
            value: 'world',
            label: 'World'
        }]

        const wrapper = shallow(
            <MultiSelectField
                {...minProps}
                options={options}
                allowCustomValue
            />
        )
        const component = wrapper.instance()

        component._onInputChange({
            target: {value: 'hello'}
        })
        expect(wrapper.state()).toMatchSnapshot()

        component._onInputChange({
            target: {value: ''}
        })
        expect(wrapper.state()).toMatchSnapshot()
    })

    it('should update state when search changes (custom NOT values allowed)', () => {
        const options = [{
            value: 'hello',
            label: 'Hello'
        }, {
            value: 'world',
            label: 'World'
        }]

        const wrapper = mount(
            <MultiSelectField
                {...minProps}
                options={options}
            />
        )
        const component = wrapper.instance()
        component._onInputChange({
            target: {value: 'hello'}
        })
        expect(wrapper.state()).toMatchSnapshot()

        component._onInputChange({
            target: {value: ''}
        })
        expect(wrapper.state()).toMatchSnapshot()
    })

    it('should reset state on blur', () => {
        const wrapper = mount(
            <MultiSelectField
                {...minProps}
                {...props}
            />
        )
        const component = wrapper.instance()

        component._focusInput()
        component._onInputChange({
            target: {value: ''}
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
        const wrapper = mount(
            <MultiSelectField
                {...minProps}
                {...props}
            />
        )
        const component = wrapper.instance()

        component._stopPropagation(event)
        expect(stopPropagationSpy.mock.calls.length).toBe(1)
        expect(preventDefaultSpy.mock.calls.length).toBe(1)
    })

    it('should handle click on option (custom value NOT allowed)', () => {
        const stopPropagationSpy = jest.fn()
        const onChangeSpy = jest.fn()
        const wrapper = mount(
            <MultiSelectField
                {...minProps}
                {...props}
                values={[]}
                onChange={onChangeSpy}
            />
        )
        const component = wrapper.instance()

        component._stopPropagation = stopPropagationSpy
        wrapper.find('button').first().simulate('mouseDown')

        expect(stopPropagationSpy.mock.calls.length).toBe(1)
        expect(onChangeSpy.mock.calls[0]).toEqual([[1]])
    })

    it('should handle click on option (custom value allowed)', () => {
        const stopPropagationSpy = jest.fn()
        const onChangeSpy = jest.fn()
        const wrapper = mount(
            <MultiSelectField
                {...minProps}
                {...props}
                values={[]}
                onChange={onChangeSpy}
                allowCustomValue
            />
        )
        const component = wrapper.instance()
        component._onInputChange({
            target: {value: 'hello'}
        })
        component._stopPropagation = stopPropagationSpy
        wrapper.update()
        wrapper.find('button').first().simulate('mouseDown')

        expect(stopPropagationSpy.mock.calls.length).toBe(1)
        expect(onChangeSpy.mock.calls[0]).toEqual([['hello']])
    })

    describe('should handle key down event', () => {
        const addKeys = ['Enter', 'Tab']

        it('Escape', () => {
            const wrapper = mount(
                <MultiSelectField
                    {...minProps}
                    {...props}
                />
            )
            const component = wrapper.instance()

            component._onInputChange({
                target: {value: 'hello'}
            })

            wrapper.find('input').simulate('keyDown', {key: 'Escape'})
            expect(wrapper.state()).toMatchSnapshot()
        })

        it('ArrowUp/ArrowDown', () => {
            const wrapper = mount(
                <MultiSelectField
                    {...minProps}
                    {...props}
                    values={[]}
                    allowCustomValues={false}
                />
            )
            const component = wrapper.instance()

            component._onInputChange({
                target: {value: props.options[0].text}
            })
            wrapper.find('input').simulate('keyDown', {key: 'ArrowDown'})
            expect(wrapper.state().selectedOptionIndex).toEqual(0)

            wrapper.find('input').simulate('keyDown', {key: 'ArrowDown'})
            // cannot select an item that does not exist
            expect(wrapper.state().selectedOptionIndex).toEqual(0)

            wrapper.find('input').simulate('keyDown', {key: 'ArrowUp'})
            expect(wrapper.state().selectedOptionIndex).toEqual(0)

            wrapper.find('input').simulate('keyDown', {key: 'ArrowUp'})
            // cannot select an item that does not exist
            expect(wrapper.state().selectedOptionIndex).toEqual(0)
        })

        it('ArrowUp/ArrowDown (custom value allowed)', () => {
            const wrapper = mount(
                <MultiSelectField
                    {...minProps}
                    {...props}
                    values={[]}
                    allowCustomValues
                />
            )
            const component = wrapper.instance()

            component._onInputChange({
                target: {value: props.options[0].label.substring(0, 2)}
            })
            wrapper.find('input').simulate('keyDown', {key: 'ArrowDown'})
            expect(wrapper.state().selectedOptionIndex).toEqual(0)

            wrapper.find('input').simulate('keyDown', {key: 'ArrowUp'})
            expect(wrapper.state().selectedOptionIndex).toEqual(-1)

            wrapper.find('input').simulate('keyDown', {key: 'ArrowUp'})
            // cannot select an item that does not exist
            expect(wrapper.state().selectedOptionIndex).toEqual(-1)
        })

        it('Enter/tab (custom value)', () => {
            addKeys.forEach(key => {
                const onChangeSpy = jest.fn()
                const wrapper = mount(
                    <MultiSelectField
                        {...minProps}
                        {...props}
                        values={undefined}
                        onChange={onChangeSpy}
                        allowCustomValues
                    />
                )
                const component = wrapper.instance()

                component._onInputChange({
                    target: {value: 'new value'}
                })
                wrapper.find('input').simulate('keyDown', {key})

                expect(wrapper.state()).toMatchSnapshot()
                expect(onChangeSpy.mock.calls[0][0]).toEqual(['new value'])
            })
        })

        it('Enter/Tab (existing value)', () => {
            addKeys.forEach(key => {
                const onChangeSpy = jest.fn()
                const wrapper = mount(
                    <MultiSelectField
                        {...minProps}
                        {...props}
                        values={undefined}
                        onChange={onChangeSpy}
                        allowCustomValues={false}
                    />
                )
                wrapper.find('input').simulate('keyDown', {key})

                expect(wrapper.state()).toMatchSnapshot()
                expect(onChangeSpy.mock.calls[0][0]).toEqual([props.options[0].value])
            })
        })

        it('should stop propagation of events', () => {
            const keys = ['ArrowUp', 'ArrowDown', 'Enter', 'Tab']
            keys.forEach(key => {
                const stopPropagationSpy = jest.fn()
                const wrapper = mount(
                    <MultiSelectField
                        {...minProps}
                        {...props}
                        value={undefined}
                    />
                )
                const component = wrapper.instance()

                component._stopPropagation = stopPropagationSpy
                wrapper.find('input').simulate('keyDown', {key})

                expect(stopPropagationSpy.mock.calls.length).toEqual(1)
            })
        })
    })
})
