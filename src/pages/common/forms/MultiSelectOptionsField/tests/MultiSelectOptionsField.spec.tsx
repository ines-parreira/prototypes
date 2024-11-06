import {render, fireEvent} from '@testing-library/react'
import _noop from 'lodash/noop'
import React, {ComponentProps} from 'react'

import {TAGS_LIMIT} from 'models/integration/constants'

import MultiSelectField from '../MultiSelectOptionsField'

type OptionProps = ComponentProps<typeof MultiSelectField>['options']

describe('MultiSelectField', () => {
    const minProps: Pick<
        ComponentProps<typeof MultiSelectField>,
        'onChange'
    > = {
        onChange: _noop,
    }

    const options: OptionProps = [
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

    const props: Omit<
        ComponentProps<typeof MultiSelectField>,
        'allowCustomOptions' | 'matchInput' | 'tagColor'
    > = {
        onChange: _noop,
        selectedOptions: [],
        options: options,
        plural: 'tags',
        singular: 'tag',
    }

    it('should render a select input with default props', () => {
        const {container} = render(<MultiSelectField {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should use custom props', () => {
        const {getByPlaceholderText} = render(
            <MultiSelectField {...minProps} {...props} />
        )
        expect(getByPlaceholderText('Add tags...')).toBeInTheDocument()
    })

    it('should update state when search changes (custom values allowed)', () => {
        const options: OptionProps = [
            {
                value: 'hello',
                label: 'Hello',
            },
            {
                value: 'world',
                label: 'World',
            },
        ]

        const {getByPlaceholderText, getByDisplayValue} = render(
            <MultiSelectField
                {...minProps}
                options={options}
                allowCustomOptions
            />
        )
        fireEvent.change(getByPlaceholderText('Add items...'), {
            target: {value: 'hello'},
        })

        expect(getByDisplayValue('hello')).toBeInTheDocument()
    })

    it('should update state when search changes (custom values NOT allowed)', () => {
        const options: OptionProps = [
            {
                value: 'hello',
                label: 'Hello',
            },
            {
                value: 'world',
                label: 'World',
            },
        ]

        const {getByPlaceholderText, getByDisplayValue} = render(
            <MultiSelectField {...minProps} options={options} />
        )

        fireEvent.change(getByPlaceholderText('Add items...'), {
            target: {value: 'hello'},
        })

        expect(getByDisplayValue('hello')).toBeInTheDocument()
    })

    it('should reset state on blur', () => {
        const {container, getByPlaceholderText} = render(
            <MultiSelectField {...minProps} {...props} />
        )

        fireEvent.focus(getByPlaceholderText('Add tags...'))

        expect(container.firstChild?.firstChild).toHaveClass('focused')

        fireEvent.blur(getByPlaceholderText('Add tags...'))

        expect(container.firstChild?.firstChild).not.toHaveClass('focused')
    })

    describe('custom options', () => {
        it('should not display the custom option if input is empty', () => {
            const {queryByText} = render(
                <MultiSelectField {...minProps} {...props} options={[]} />
            )

            expect(queryByText('Add tags...')).toBeNull()
        })

        it('should not display the custom option if not enabled', () => {
            const {getByPlaceholderText, container} = render(
                <MultiSelectField
                    {...minProps}
                    {...props}
                    options={[]}
                    allowCustomOptions={false}
                />
            )

            fireEvent.change(getByPlaceholderText('Add tags...'), {
                target: {value: 'foo'},
            })

            expect(container.querySelector('b')).toBeNull()
        })

        it('should display the custom option', () => {
            const {container, getByPlaceholderText} = render(
                <MultiSelectField
                    {...minProps}
                    {...props}
                    options={[]}
                    allowCustomOptions
                />
            )

            fireEvent.focus(getByPlaceholderText('Add tags...'))
            fireEvent.change(getByPlaceholderText('Add tags...'), {
                target: {value: 'foo'},
            })

            expect(container.querySelector('b')).toHaveTextContent('foo')
        })
    })

    describe('options filtering', () => {
        it('should filter out selected options', () => {
            const {container} = render(
                <MultiSelectField
                    {...props}
                    selectedOptions={[options[0], options[2]]}
                />
            )

            expect(
                container.querySelector('.dropdown-menu')?.children.length
            ).toBe(1)
        })

        it('should filter out options not matching input (case-insensitive) if matchInput', () => {
            const {getByPlaceholderText, getByText} = render(
                <MultiSelectField
                    {...props}
                    selectedOptions={[options[0], options[2]]}
                    matchInput
                />
            )

            fireEvent.change(getByPlaceholderText('Add tags...'), {
                target: {value: 'foo'},
            })

            expect(getByText('No result')).toBeInTheDocument()
        })

        it('should not filter out options not matching input if not matchInput', () => {
            const {container, getByPlaceholderText} = render(
                <MultiSelectField
                    {...props}
                    selectedOptions={[]}
                    matchInput={false}
                />
            )

            fireEvent.change(getByPlaceholderText('Add tags...'), {
                target: {value: 'foo'},
            })

            expect(
                container.querySelector('.dropdown-menu')?.children.length
            ).toBe(3)
        })

        it('should not filter out options if there is no input', () => {
            const {container} = render(
                <MultiSelectField
                    {...props}
                    selectedOptions={[options[0], options[2]]}
                    matchInput
                />
            )

            expect(
                container.querySelector('.dropdown-menu')?.children.length
            ).toBe(1)
        })
    })

    describe('component update', () => {
        it('should update filtered options on options change but not the input', () => {
            const {
                rerender,
                getByPlaceholderText,
                getByDisplayValue,
                getByText,
            } = render(<MultiSelectField {...props} />)

            fireEvent.change(getByPlaceholderText('Add tags...'), {
                target: {value: 'sec'},
            })
            rerender(<MultiSelectField {...props} options={[options[0]]} />)

            expect(getByDisplayValue('sec')).toBeInTheDocument()
            expect(getByText('First')).toBeInTheDocument()
        })

        it('should reset the input and update the options on selected options change', () => {
            const {rerender, getByText, getByPlaceholderText} = render(
                <MultiSelectField
                    {...props}
                    selectedOptions={[options[0], options[2]]}
                />
            )

            fireEvent.change(getByPlaceholderText('Add tags...'), {
                target: {value: 'sec'},
            })
            rerender(<MultiSelectField {...props} selectedOptions={options} />)

            expect(getByPlaceholderText('Add tags...')).toHaveValue('')
            expect(getByText('No result')).toBeInTheDocument()
        })
    })

    describe('selected options', () => {
        it('should remove selected option and focus the dropdown on tag remove', () => {
            const onChangeSpy = jest.fn()
            const {getByText, getByPlaceholderText} = render(
                <MultiSelectField
                    {...props}
                    selectedOptions={[options[0], options[2]]}
                    onChange={onChangeSpy}
                />
            )

            fireEvent.click(getByText('First').nextSibling!)

            expect(onChangeSpy).toHaveBeenCalledWith([options[2]])
            expect(getByPlaceholderText('Add tags...')).toHaveFocus()
        })

        it('should remove the last selected option on dropdown delete', () => {
            const onChangeSpy = jest.fn()
            const {getByPlaceholderText} = render(
                <MultiSelectField
                    {...props}
                    selectedOptions={[options[0], options[2]]}
                    onChange={onChangeSpy}
                />
            )

            fireEvent.keyDown(getByPlaceholderText('Add tags...'), {
                key: 'Backspace',
            })

            expect(onChangeSpy).toHaveBeenCalledWith([options[0]])
        })

        it('should do nothing on dropdown delete if there is no selected options', () => {
            const onChangeSpy = jest.fn()
            const {getByPlaceholderText} = render(
                <MultiSelectField
                    {...props}
                    selectedOptions={[]}
                    onChange={onChangeSpy}
                />
            )

            fireEvent.keyDown(getByPlaceholderText('Add tags...'), {
                key: 'Backspace',
            })

            expect(onChangeSpy).not.toHaveBeenCalled()
        })
    })

    describe('select option', () => {
        it('should handle click on option', () => {
            const onChangeSpy = jest.fn()
            const {getByText} = render(
                <MultiSelectField
                    {...minProps}
                    {...props}
                    onChange={onChangeSpy}
                />
            )

            fireEvent.mouseDown(getByText('First'))

            expect(onChangeSpy).toHaveBeenCalledWith([options[0]])
        })

        it('should support custom options', () => {
            const onChangeSpy = jest.fn()
            const {container, getByPlaceholderText} = render(
                <MultiSelectField
                    {...minProps}
                    {...props}
                    onChange={onChangeSpy}
                    allowCustomOptions
                />
            )

            fireEvent.change(getByPlaceholderText('Add tags...'), {
                target: {value: 'foo'},
            })
            fireEvent.mouseDown(container.querySelector('b')!)

            expect(onChangeSpy).toHaveBeenCalledWith([
                {value: 'foo', label: 'foo'},
            ])
        })

        it('should support custom DropdownMenu', () => {
            const CustomDropdownMenu = () => <div>CustomDropdownMenu</div>

            const {getByText} = render(
                <MultiSelectField
                    {...minProps}
                    {...props}
                    dropdownMenu={CustomDropdownMenu}
                />
            )

            expect(getByText('CustomDropdownMenu')).toBeInTheDocument()
        })

        it('should display max TAGS_LIMIT options', () => {
            const tags: string[] = []
            for (let i = 0; i < TAGS_LIMIT * 3; i++) {
                tags.push(`tag${i}`)
            }
            props.options = tags.map((tag) => ({label: tag, value: tag}))

            const {container} = render(
                <MultiSelectField {...minProps} {...props} />
            )
            const displayedOptions =
                container.querySelectorAll('.dropdown-item')

            expect(displayedOptions.length).toBe(TAGS_LIMIT)
        })
    })
})
