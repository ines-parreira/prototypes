import {fireEvent, render} from '@testing-library/react'
import _noop from 'lodash/noop'
import React from 'react'

import Dropdown from '../Dropdown'

describe('MultiSelectField Dropdown', () => {
    const options = [
        {
            value: 'foo',
            label: 'foo',
        },
        {
            value: 'bar',
            label: 'bar',
        },
        {
            value: 'baz',
            label: 'baz',
        },
    ]

    const defaultProps = {
        options,
        placeholder: 'some placeholder',
        value: '',
        onChange: _noop,
        onFocus: _noop,
        onBlur: _noop,
        onSelect: _noop,
        onDelete: _noop,
        isFocused: false,
    }

    describe('input arrow up', () => {
        it('should create selection on hover', () => {
            const {getByText} = render(<Dropdown {...defaultProps} />)

            fireEvent.mouseEnter(getByText(options[2].label))

            expect(
                (getByText(options[2].label) as Element).parentElement
            ).toHaveClass('option--focused')
        })

        it('should move the selection up', () => {
            const {getByText, getByPlaceholderText} = render(
                <Dropdown {...defaultProps} />
            )

            fireEvent.mouseEnter(getByText(options[2].label))
            fireEvent.keyDown(getByPlaceholderText('some placeholder'), {
                key: 'ArrowUp',
            })

            expect(
                (getByText(options[1].label) as Element).parentElement
            ).toHaveClass('option--focused')
        })

        it('should not go below selected index 0', () => {
            const {getByText, getByPlaceholderText} = render(
                <Dropdown {...defaultProps} />
            )

            fireEvent.mouseEnter(getByText(options[0].label))
            fireEvent.keyDown(getByPlaceholderText('some placeholder'), {
                key: 'ArrowUp',
            })

            expect(
                (getByText(options[0].label) as Element).parentElement
            ).toHaveClass('option--focused')
        })
    })

    describe('input arrow down', () => {
        it('should move the selection down', () => {
            const {getByText, getByPlaceholderText} = render(
                <Dropdown {...defaultProps} />
            )

            fireEvent.mouseEnter(getByText(options[1].label))
            fireEvent.keyDown(getByPlaceholderText('some placeholder'), {
                key: 'ArrowDown',
            })

            expect(
                (getByText(options[2].label) as Element).parentElement
            ).toHaveClass('option--focused')
        })

        it('should not go down more than the number of options', () => {
            const {getByText, getByPlaceholderText} = render(
                <Dropdown {...defaultProps} />
            )

            fireEvent.mouseEnter(getByText(options[2].label))
            fireEvent.keyDown(getByPlaceholderText('some placeholder'), {
                key: 'ArrowDown',
            })

            expect(
                (getByText(options[2].label) as Element).parentElement
            ).toHaveClass('option--focused')
        })
    })

    describe('selection reset', () => {
        it('should reset selection if options change', () => {
            const {getByText, rerender} = render(<Dropdown {...defaultProps} />)

            fireEvent.mouseEnter(getByText(options[2].label))
            rerender(<Dropdown {...defaultProps} options={[options[0]]} />)

            expect(
                (getByText(options[0].label) as Element).parentElement
            ).toHaveClass('option--focused')
        })

        it('should not reset selection if options did not change', () => {
            const {getByText, rerender} = render(<Dropdown {...defaultProps} />)

            fireEvent.mouseEnter(getByText(options[2].label))
            rerender(<Dropdown {...defaultProps} options={options} />)

            expect(
                (getByText(options[2].label) as Element).parentElement
            ).toHaveClass('option--focused')
        })
    })

    it('should accept custom DropdownMenu', () => {
        const CustomMenu = () => <div>Custom Menu</div>
        const {getByText} = render(
            <Dropdown {...defaultProps} menu={CustomMenu} />
        )

        expect(getByText('Custom Menu')).toBeInTheDocument()
    })
})
