import {mount, render} from 'enzyme'
import _noop from 'lodash/noop'
import React, {ReactElement} from 'react'

import TagDropdownMenu from '../../../components/TagDropdownMenu/TagDropdownMenu'

import Dropdown from '../Dropdown'
import MultiSelectField from '../MultiSelectOptionsField'
import OptionTag from '../Tag'
import {Option} from '../types'

describe('MultiSelectField', () => {
    const minProps = {
        onChange: _noop,
    }

    const options: Option[] = [
        {
            value: 'first',
            label: 'First',
        },
        {
            value: 'second',
            label: 'Second',
        },
        {
            value: 'third',
            label: 'Third',
        },
    ]

    const props = {
        onChange: _noop,
        selectedOptions: [],
        options: options,
        plural: 'tags',
        singular: 'tag',
    }

    it('should render a select input with default props', () => {
        const component = mount(<MultiSelectField {...minProps} />)
        expect(component).toMatchSnapshot()
        expect(component.props()).toMatchSnapshot()
        expect(component.state()).toMatchSnapshot()
    })

    it('should use custom props', () => {
        const component = mount(<MultiSelectField {...minProps} {...props} />)
        expect(component.props()).toMatchSnapshot()
    })

    it('should init state with custom props', () => {
        const component = mount(<MultiSelectField {...minProps} {...props} />)
        expect(component.state()).toMatchSnapshot()
    })

    it('should render a multi select input with custom props', () => {
        const component = mount(<MultiSelectField {...minProps} {...props} />)
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

        const wrapper = mount<MultiSelectField>(
            <MultiSelectField
                {...minProps}
                options={options}
                allowCustomOptions
            />
        )
        const component = wrapper.instance()

        component._onDropdownChange('hello')
        expect(wrapper.state()).toMatchSnapshot()

        component._onDropdownChange('')
        expect(wrapper.state()).toMatchSnapshot()
    })

    it('should update state when search changes (custom values NOT allowed)', () => {
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

        const wrapper = mount<MultiSelectField>(
            <MultiSelectField {...minProps} options={options} />
        )
        const component = wrapper.instance()
        component._onDropdownChange('hello')
        expect(wrapper.state()).toMatchSnapshot()

        component._onDropdownChange('')
        expect(wrapper.state()).toMatchSnapshot()
    })

    it('should reset state on blur', () => {
        const wrapper = mount<MultiSelectField>(
            <MultiSelectField {...minProps} {...props} />
        )
        const component = wrapper.instance()

        component._focus()
        component._onDropdownChange('')
        component._blur()
        expect(wrapper.state()).toMatchSnapshot()
    })

    describe('custom options', () => {
        it('should not display the custom option if input is empty', () => {
            const wrapper = mount(
                <MultiSelectField {...minProps} {...props} options={[]} />
            )
            expect(wrapper.find(Dropdown).prop('options')).toHaveLength(0)
        })

        it('should not display the custom option if not enabled', () => {
            const wrapper = mount(
                <MultiSelectField
                    {...minProps}
                    {...props}
                    options={[]}
                    allowCustomOptions={false}
                />
            )
            wrapper.find(Dropdown).prop('onChange')('foo')
            wrapper.update()
            expect(wrapper.find(Dropdown).prop('options')).toHaveLength(0)
        })

        it('should display the custom option', () => {
            const wrapper = mount(
                <MultiSelectField
                    {...minProps}
                    {...props}
                    options={[]}
                    allowCustomOptions
                />
            )
            wrapper.find(Dropdown).prop('onChange')('foo')
            wrapper.update()
            const options = wrapper.find(Dropdown).prop('options')
            expect(options).toHaveLength(1)
            expect(options[0].label).toBe('foo')
            expect(options[0].value).toBe('foo')
            expect(
                render(options[0].displayLabel as ReactElement).text()
            ).toEqual('Add tag "foo"')
        })
    })

    describe('options filtering', () => {
        it('should filter out selected options', () => {
            const wrapper = mount(
                <MultiSelectField
                    {...props}
                    selectedOptions={[options[0], options[2]]}
                />
            )
            expect(wrapper.find(Dropdown).prop('options')).toEqual([options[1]])
        })

        it('should filter out options not matching input (case-insensitive) if matchInput', () => {
            const wrapper = mount(
                <MultiSelectField
                    {...props}
                    selectedOptions={[options[0], options[2]]}
                    matchInput
                />
            )
            wrapper.find(Dropdown).prop('onChange')('sec') // It should match "Second" label
            wrapper.update()
            expect(wrapper.find(Dropdown).prop('options')).toEqual([options[1]])
        })

        it('should not filter out options not matching input if not matchInput', () => {
            const wrapper = mount(
                <MultiSelectField
                    {...props}
                    selectedOptions={[]}
                    matchInput={false}
                />
            )
            wrapper.find(Dropdown).prop('onChange')('sec') // It should match "Second" label
            wrapper.update()
            expect(wrapper.find(Dropdown).prop('options')).toEqual(options)
        })

        it('should not filter out options if there is no input', () => {
            const wrapper = mount(
                <MultiSelectField
                    {...props}
                    selectedOptions={[options[0], options[2]]}
                    matchInput
                />
            )
            expect(wrapper.find(Dropdown).prop('options')).toEqual([options[1]])
        })
    })

    describe('component update', () => {
        it('should update filtered options on options change but not the input', () => {
            const wrapper = mount(<MultiSelectField {...props} />)
            wrapper.find(Dropdown).prop('onChange')('sec')
            wrapper.update()
            wrapper.setProps({
                options: [options[0]],
            })
            wrapper.update()
            expect(wrapper.find(Dropdown).prop('value')).toBe('sec')
            expect(wrapper.find(Dropdown).prop('options')).toEqual([options[0]])
        })

        it('should reset the input and update the options on selected options change', () => {
            const wrapper = mount(
                <MultiSelectField
                    {...props}
                    selectedOptions={[options[0], options[2]]}
                />
            )
            wrapper.find(Dropdown).prop('onChange')('sec')
            wrapper.update()
            wrapper.setProps({
                selectedOptions: options,
            })
            wrapper.update()
            expect(wrapper.find(Dropdown).prop('value')).toBe('')
            expect(wrapper.find(Dropdown).prop('options')).toHaveLength(0)
        })
    })

    describe('selected options', () => {
        it('should remove selected option and focus the dropdown on tag remove', () => {
            const onChangeSpy = jest.fn()
            const wrapper = mount(
                <MultiSelectField
                    {...props}
                    selectedOptions={[options[0], options[2]]}
                    onChange={onChangeSpy}
                />
            )
            wrapper.find(OptionTag).at(0).prop('onRemove')(options[0])
            wrapper.update()
            expect(onChangeSpy.mock.calls).toHaveLength(1)
            expect(onChangeSpy.mock.calls[0]).toEqual([[options[2]]])
            expect(wrapper.find(Dropdown).prop('isFocused')).toBe(true)
        })

        it('should remove the last selected option on dropdown delete', () => {
            const onChangeSpy = jest.fn()
            const wrapper = mount(
                <MultiSelectField
                    {...props}
                    selectedOptions={[options[0], options[2]]}
                    onChange={onChangeSpy}
                />
            )
            wrapper.find(Dropdown).prop('onDelete')()
            expect(onChangeSpy.mock.calls).toHaveLength(1)
            expect(onChangeSpy.mock.calls[0]).toEqual([[options[0]]])
        })

        it('should do nothing on dropdown delete if there is no selected options', () => {
            const onChangeSpy = jest.fn()
            const wrapper = mount(
                <MultiSelectField
                    {...props}
                    selectedOptions={[]}
                    onChange={onChangeSpy}
                />
            )
            wrapper.find(Dropdown).prop('onDelete')()
            expect(onChangeSpy.mock.calls).toHaveLength(0)
        })
    })

    describe('select option', () => {
        it('should handle click on option', () => {
            const onChangeSpy = jest.fn()
            const wrapper = mount(
                <MultiSelectField
                    {...minProps}
                    {...props}
                    onChange={onChangeSpy}
                />
            )

            wrapper.find(Dropdown).prop('onSelect')(options[0])
            expect(onChangeSpy.mock.calls[0]).toEqual([[options[0]]])
        })

        it('should whitelist values to those available', () => {
            const onChangeSpy = jest.fn()
            const wrapper = mount(
                <MultiSelectField
                    {...minProps}
                    {...props}
                    onChange={onChangeSpy}
                />
            )
            wrapper.find(Dropdown).prop('onSelect')({
                value: 'silly value',
                label: options[0].label,
            })
            expect(onChangeSpy.mock.calls).toHaveLength(0)
        })

        it('should support case insensitive', () => {
            const onChangeSpy = jest.fn()
            const wrapper = mount(
                <MultiSelectField
                    {...minProps}
                    {...props}
                    onChange={onChangeSpy}
                    caseInsensitive
                />
            )
            wrapper.find(Dropdown).prop('onSelect')({
                value: (options[0].value as string).toUpperCase(),
                label: options[0].label,
            })
            expect(onChangeSpy.mock.calls[0]).toEqual([[options[0]]])
        })

        it('should support custom options', () => {
            const onChangeSpy = jest.fn()
            const wrapper = mount(
                <MultiSelectField
                    {...minProps}
                    {...props}
                    onChange={onChangeSpy}
                    allowCustomOptions
                />
            )
            const customOption = {
                value: 'foo',
                label: 'bar',
            }
            wrapper.find(Dropdown).prop('onSelect')(customOption)
            expect(onChangeSpy.mock.calls[0]).toEqual([[customOption]])
        })

        it('should deduplicate selected options', () => {
            const onChangeSpy = jest.fn()
            const wrapper = mount(
                <MultiSelectField
                    {...minProps}
                    {...props}
                    selectedOptions={[options[1]]}
                    onChange={onChangeSpy}
                />
            )
            wrapper.find(Dropdown).prop('onSelect')(options[1])
            expect(onChangeSpy.mock.calls).toHaveLength(0)
        })

        it('should support custom DropdownMenu', () => {
            const wrapper = mount(
                <MultiSelectField
                    {...minProps}
                    {...props}
                    dropdownMenu={TagDropdownMenu}
                />
            )
            expect(wrapper.find(TagDropdownMenu)).toHaveLength(1)
        })
    })
})
