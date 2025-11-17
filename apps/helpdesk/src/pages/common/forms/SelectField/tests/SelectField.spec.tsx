import type { ComponentProps, LegacyRef, SyntheticEvent } from 'react'
import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import SelectField from '../SelectField'

// refs are not passed by enzyme to popper.js
// this mock might not be needed anymore
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

describe('SelectField', () => {
    const minProps = {
        onChange: jest.fn(),
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
        onChange: jest.fn(),
        placeholder: 'placeholder',
        style: {
            background: 'red',
        },
    }
    const searchChangeEvent = {
        target: { value: 'hello' },
    }

    it('should render a select input with default props', () => {
        const { container } = render(<SelectField {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a select input with custom props', () => {
        const { container } = render(<SelectField {...minProps} {...props} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should set the minWidth of the input according to the length of the longest label', () => {
        const { getByRole } = render(
            <SelectField {...minProps} {...props} fixedWidth />,
        )
        expect(getByRole('textbox')).toHaveStyle('min-width: 58px')
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
        const { getByRole, getByDisplayValue } = render(
            <SelectField {...minProps} options={options} allowCustomValue />,
        )

        fireEvent.change(getByRole('textbox'), searchChangeEvent)

        expect(getByDisplayValue('hello')).toBeInTheDocument()
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

        const { getByRole, getByDisplayValue } = render(
            <SelectField {...minProps} options={options} />,
        )

        fireEvent.change(getByRole('textbox'), searchChangeEvent)

        expect(getByDisplayValue('hello')).toBeInTheDocument()
    })

    it('should filter when rerendered', () => {
        const props = {
            ...minProps,
            options: [
                { value: 'hello', label: 'Hello' },
                { value: 'world', label: 'World' },
            ],
        }

        const { queryByText } = render(
            <SelectField {...props} allowCustomValue />,
        )

        fireEvent.change(screen.getByRole('textbox'), searchChangeEvent)

        expect(queryByText('World')).toBeNull()
        expect(queryByText('Hello')).toBeInTheDocument()
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
        const { getByText } = render(
            <SelectField {...minProps} options={options} />,
        )

        fireEvent.change(screen.getByRole('textbox'), searchChangeEvent)

        expect(getByText('Hello2')).toBeInTheDocument()
    })

    it('should reset state on blur', () => {
        const { getByRole, getByText } = render(
            <SelectField
                {...minProps}
                {...props}
                focusedPlaceholder="focused placeholder"
                placeholder="unfocused placeholder"
                value={undefined}
            />,
        )

        fireEvent.focus(getByRole('textbox'))

        expect(getByText('focused placeholder')).toBeInTheDocument()

        fireEvent.blur(getByRole('textbox'))

        expect(getByText('unfocused placeholder')).toBeInTheDocument()
    })

    // test should be properly rewritten or included through a different approach
    it('stopPropagation()', () => {
        const instanceRef: LegacyRef<InstanceType<typeof SelectField>> = {
            current: null,
        }
        const stopPropagationSpy = jest.fn()
        const preventDefaultSpy = jest.fn()
        const event = {
            stopPropagation: stopPropagationSpy,
            preventDefault: preventDefaultSpy,
        } as unknown as SyntheticEvent
        render(<SelectField {...minProps} {...props} ref={instanceRef} />)

        instanceRef.current?._stopPropagation(event)

        expect(stopPropagationSpy.mock.calls.length).toBe(1)
        expect(preventDefaultSpy.mock.calls.length).toBe(1)
    })

    it('should handle click on option (custom value NOT allowed)', () => {
        const onChangeSpy = jest.fn()
        render(
            <SelectField
                {...minProps}
                {...props}
                value={undefined}
                onChange={onChangeSpy}
            />,
        )
        fireEvent.click(screen.getByText('First'))

        expect(onChangeSpy).toHaveBeenCalledWith(1)
    })

    it('should handle click on option (custom value allowed)', () => {
        const onChangeSpy = jest.fn()
        const { getByRole } = render(
            <SelectField
                {...minProps}
                {...props}
                value={undefined}
                onChange={onChangeSpy}
                allowCustomValue
            />,
        )

        fireEvent.change(getByRole('textbox'), searchChangeEvent)
        fireEvent.click(document.querySelector('b')!)

        expect(onChangeSpy).toHaveBeenCalledWith('hello')
    })

    describe('should handle key down event', () => {
        const addKeys = ['Enter', 'Tab']

        it('Escape', () => {
            const { getByText } = render(
                <SelectField {...minProps} {...props} />,
            )
            const input = screen.getByRole('textbox')
            fireEvent.click(getByText('First'))
            fireEvent.change(input, searchChangeEvent)
            fireEvent.keyDown(input, { key: 'Escape' })

            expect(document.querySelector('.dropdown-menu')).toHaveAttribute(
                'aria-hidden',
                'true',
            )
        })

        it('ArrowUp/ArrowDown', () => {
            const { container } = render(
                <SelectField {...minProps} {...props} value={undefined} />,
            )
            const input = screen.getByRole('textbox')

            fireEvent.keyDown(input, { key: 'ArrowDown' })
            expect(
                container.querySelector('.option--focused'),
            ).toHaveTextContent('Second')

            fireEvent.keyDown(input, { key: 'ArrowUp' })
            expect(
                container.querySelector('.option--focused'),
            ).toHaveTextContent('First')

            fireEvent.keyDown(input, { key: 'ArrowUp' })
            expect(
                container.querySelector('.option--focused'),
            ).toHaveTextContent('First')
        })

        it('ArrowUp/ArrowDown (custom value allowed)', () => {
            const { container } = render(
                <SelectField
                    {...minProps}
                    {...props}
                    value={undefined}
                    allowCustomValue
                />,
            )

            const input = screen.getByRole('textbox')

            fireEvent.keyDown(input, { key: 'ArrowDown' })
            expect(
                container.querySelector('.option--focused'),
            ).toHaveTextContent('First')

            fireEvent.keyDown(input, { key: 'ArrowDown' })
            expect(
                container.querySelector('.option--focused'),
            ).toHaveTextContent('Second')

            fireEvent.keyDown(input, { key: 'ArrowUp' })
            expect(
                container.querySelector('.option--focused'),
            ).toHaveTextContent('First')

            fireEvent.keyDown(input, { key: 'ArrowUp' })
            expect(container.querySelector('.option--focused')).toBeNull()
        })

        it.each([addKeys])('should propagate custom value on %s key', (key) => {
            const onChangeSpy = jest.fn()
            const { getByRole } = render(
                <SelectField
                    {...minProps}
                    {...props}
                    onChange={onChangeSpy}
                    allowCustomValue
                />,
            )
            const input = getByRole('textbox')

            fireEvent.change(input, {
                target: { value: 'custom value' },
            })
            fireEvent.keyDown(input, { key })

            expect(onChangeSpy).toHaveBeenCalledWith('custom value')
        })

        it.each([addKeys])(
            'should propagate existing value on %s key',
            (key) => {
                const onChangeSpy = jest.fn()
                render(
                    <SelectField
                        {...minProps}
                        {...props}
                        value={undefined}
                        onChange={onChangeSpy}
                    />,
                )
                const input = screen.getByRole('textbox')

                fireEvent.keyDown(input, { key })

                expect(onChangeSpy).toHaveBeenCalledWith(props.options[0].value)
            },
        )

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
            render(
                <SelectField
                    {...minProps}
                    {...props}
                    options={optionsWithDisabledValue}
                    value={undefined}
                    onChange={onChangeSpy}
                    allowCustomValue
                />,
            )
            const input = screen.getByRole('textbox')

            fireEvent.keyDown(input, { key: 'ArrowDown' })
            fireEvent.keyDown(input, { key: 'Enter' })

            expect(onChangeSpy).not.toHaveBeenCalled()

            fireEvent.keyDown(input, { key: 'ArrowDown' })
            fireEvent.keyDown(input, { key: 'Enter' })

            expect(onChangeSpy).toHaveBeenCalledWith(props.options[0].value)
        })

        it.each(['ArrowUp', 'ArrowDown', 'Enter', 'Tab'])(
            `should stop propagation of events on %s key`,
            (key) => {
                const instanceRef: LegacyRef<InstanceType<typeof SelectField>> =
                    {
                        current: null,
                    }

                render(
                    <SelectField
                        {...minProps}
                        {...props}
                        value={undefined}
                        ref={instanceRef}
                    />,
                )

                const stopPropagationSpy = jest.spyOn(
                    instanceRef.current!,
                    '_stopPropagation',
                )
                const input = screen.getByRole('textbox')

                fireEvent.keyDown(input, { key })

                expect(stopPropagationSpy.mock.calls.length).toEqual(1)
            },
        )
    })

    describe('select with headers, dividers and actions', () => {
        const options = [
            { label: 'Group 1', isHeader: true },
            { node: <span>Action 1</span>, isAction: true, onClick: jest.fn() },
            { label: 'Bar', value: 'bar' },
            { isDivider: true },
            { label: 'Group 2', isHeader: true },
            { label: 'Baz', value: 'baz' },
            { isDivider: true },
            { label: 'Group 3', isHeader: true },
            { label: 'Lorem ipsum', value: 'loremipsum' },
            { isDivider: true },
        ] as ComponentProps<typeof SelectField>['options']

        it('should filter corresponding headers and dividers when search applied', () => {
            const { queryByText } = render(
                <SelectField {...minProps} options={options} />,
            )

            const input = screen.getByRole('textbox')
            fireEvent.change(input, { target: { value: 'ba' } })

            expect(queryByText('Group 1')).toBeInTheDocument()
            expect(queryByText('Action 1')).toBeNull()
            expect(queryByText('Bar')).toBeInTheDocument()
            expect(queryByText('Group 2')).toBeInTheDocument()
            expect(queryByText('Baz')).toBeInTheDocument()
            expect(queryByText('Group 3')).toBeNull()
            expect(queryByText('Lorem ipsum')).toBeNull()
        })

        it('ArrowUp/ArrowDown should skip dividers and headers, but not actions', () => {
            const { container } = render(
                <SelectField {...minProps} options={options} />,
            )
            const input = screen.getByRole('textbox')

            fireEvent.keyDown(input, { key: 'ArrowDown' })
            expect(
                container.querySelector('.action--focused'),
            ).toBeInTheDocument()

            fireEvent.keyDown(input, { key: 'ArrowDown' })
            expect(
                container.querySelector('.option--focused'),
            ).toHaveTextContent('Bar')

            fireEvent.keyDown(input, { key: 'ArrowDown' })
            expect(
                container.querySelector('.option--focused'),
            ).toHaveTextContent('Baz')

            fireEvent.keyDown(input, { key: 'ArrowUp' })
            expect(
                container.querySelector('.option--focused'),
            ).toHaveTextContent('Bar')

            fireEvent.keyDown(input, { key: 'ArrowUp' })
            expect(
                container.querySelector('.action--focused'),
            ).toBeInTheDocument()

            fireEvent.keyDown(input, { key: 'ArrowUp' })
            expect(
                container.querySelector('.action--focused'),
            ).toBeInTheDocument()
        })

        it('Enter/Tab should not be applied for headers and dividers, but should be applied for actions', () => {
            const onChangeSpy = jest.fn()
            const onClickSpy = jest.fn()

            const optionsWithSpy = [
                { label: 'Group 1', isHeader: true },
                {
                    node: <span>Action 1</span>,
                    isAction: true,
                    onClick: onClickSpy,
                },
                { label: 'Bar', value: 'bar' },
            ] as ComponentProps<typeof SelectField>['options']

            render(
                <SelectField
                    {...minProps}
                    options={optionsWithSpy}
                    onChange={onChangeSpy}
                />,
            )

            const input = screen.getByRole('textbox')

            fireEvent.keyDown(input, { key: 'Enter' })

            expect(onChangeSpy).not.toHaveBeenCalled()

            fireEvent.keyDown(input, { key: 'ArrowDown' })
            fireEvent.keyDown(input, { key: 'Enter' })

            expect(onChangeSpy).not.toHaveBeenCalled()
            expect(onClickSpy).toHaveBeenCalled()
        })

        it('should show a caption if it was passed through props', () => {
            const caption = 'Caption'
            const { getByText } = render(
                <SelectField
                    {...minProps}
                    options={options}
                    caption={caption}
                />,
            )
            expect(getByText(caption)).toBeInTheDocument()
        })

        it('should show a custom icon if it was passed through props', () => {
            const icon = <span>Custom Icon</span>
            const { getByText } = render(
                <SelectField
                    {...minProps}
                    options={options}
                    customIcon={icon}
                />,
            )

            expect(getByText('Custom Icon')).toBeInTheDocument()
        })
    })
})
