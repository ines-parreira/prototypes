import React, { ComponentProps } from 'react'

import { assumeMock, getLastMockCall } from '@repo/testing'
import { act, render, screen } from '@testing-library/react'
import { UncontrolledDropdown } from 'reactstrap'

import Dropdown from '../Dropdown'
import Input from '../Input'
import Menu from '../Menu'

jest.mock('reactstrap', () => {
    const reactstrap: Record<string, unknown> = jest.requireActual('reactstrap')
    return {
        ...reactstrap,
        UncontrolledDropdown: jest.fn(
            (props: ComponentProps<typeof UncontrolledDropdown>) => {
                return <div>{props.children}</div>
            },
        ),
        DropdownToggle: (props: Record<string, unknown>) => <div {...props} />,
        DropdownMenu: (props: Record<string, unknown>) => <div {...props} />,
    }
})
jest.mock('../Input', () => jest.fn(() => <div>Input</div>))
jest.mock('../Menu', () => jest.fn(() => <div>Menu</div>))

const mockedInput = Input as unknown as jest.Mock
const mockedMenu = assumeMock(Menu)

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
        onChange: jest.fn(),
        onFocus: jest.fn(),
        onBlur: jest.fn(),
        onSelect: jest.fn(),
        onDelete: jest.fn(),
        isFocused: false,
        isCompact: true,
    }

    it('should call UncontrolledDropdown, Input and Menu with correct props', () => {
        const { rerender } = render(<Dropdown {...defaultProps} />)

        expect(UncontrolledDropdown).toHaveBeenLastCalledWith(
            expect.objectContaining({
                isOpen: false,
            }),
            {},
        )
        expect(mockedInput).toHaveBeenLastCalledWith(
            expect.objectContaining({
                value: defaultProps.value,
                placeholder: defaultProps.placeholder,
                isFocused: defaultProps.isFocused,
                onFocus: defaultProps.onFocus,
                onBlur: defaultProps.onBlur,
                onDelete: defaultProps.onDelete,
                onChange: defaultProps.onChange,
                isCompact: defaultProps.isCompact,
            }),
            {},
        )
        expect(mockedMenu).toHaveBeenLastCalledWith(
            expect.objectContaining({
                isLoading: false,
                options,
                activeIndex: 0,
                onSelect: defaultProps.onSelect,
            }),
            {},
        )

        rerender(
            <Dropdown
                {...defaultProps}
                isFocused
                value="Yo"
                isLoading={true}
            />,
        )
        expect(UncontrolledDropdown).toHaveBeenLastCalledWith(
            expect.objectContaining({
                isOpen: true,
            }),
            {},
        )
        expect(mockedMenu).toHaveBeenLastCalledWith(
            expect.objectContaining({
                isLoading: true,
            }),
            {},
        )
    })

    it('should accept custom DropdownMenu', () => {
        const TagDropdownMenu = () => <div>TagDropdownMenu</div>
        render(<Dropdown {...defaultProps} menu={TagDropdownMenu} />)
        expect(screen.getByText('TagDropdownMenu')).toBeInTheDocument()
    })

    it("should call onSelect with the selected option's value", () => {
        render(<Dropdown {...defaultProps} />)
        // eslint-disable-next-line
        getLastMockCall(mockedInput)[0].onSubmit()
        expect(defaultProps.onSelect).toHaveBeenCalledWith(options[0])
    })

    describe('on input up', () => {
        it('should move the selection up', () => {
            render(<Dropdown {...defaultProps} />)
            act(() => {
                getLastMockCall(mockedMenu)[0].onActivate(2)
            })
            act(() => {
                // eslint-disable-next-line
                getLastMockCall(mockedInput)[0].onUp()
            })

            expect(getLastMockCall(mockedMenu)[0].activeIndex).toBe(1)
        })

        it('should not go below selected index 0', () => {
            render(<Dropdown {...defaultProps} />)
            act(() => {
                getLastMockCall(mockedMenu)[0].onActivate(0)
            })
            act(() => {
                // eslint-disable-next-line
                getLastMockCall(mockedInput)[0].onUp()
            })
            expect(getLastMockCall(mockedMenu)[0].activeIndex).toBe(0)
        })
    })

    describe('on input down', () => {
        it('should move the selection down', () => {
            render(<Dropdown {...defaultProps} />)
            act(() => {
                getLastMockCall(mockedMenu)[0].onActivate(1)
            })
            act(() => {
                // eslint-disable-next-line
                getLastMockCall(mockedInput)[0].onDown()
            })

            expect(getLastMockCall(mockedMenu)[0].activeIndex).toBe(2)
        })

        it('should not go up more than the number of options', () => {
            render(<Dropdown {...defaultProps} />)
            act(() => {
                getLastMockCall(mockedMenu)[0].onActivate(2)
            })
            act(() => {
                // eslint-disable-next-line
                getLastMockCall(mockedInput)[0].onDown()
            })
            expect(getLastMockCall(mockedMenu)[0].activeIndex).toBe(2)
        })
    })

    describe('selection reset', () => {
        it('should reset selection if options change', () => {
            const { rerender } = render(<Dropdown {...defaultProps} />)
            act(() => {
                getLastMockCall(mockedMenu)[0].onActivate(2)
            })

            rerender(<Dropdown {...defaultProps} options={[options[0]]} />)

            expect(getLastMockCall(mockedMenu)[0].activeIndex).toBe(0)
        })

        it('should not reset selection if options did not change', () => {
            const { rerender } = render(<Dropdown {...defaultProps} />)
            act(() => {
                getLastMockCall(mockedMenu)[0].onActivate(2)
            })

            rerender(<Dropdown {...defaultProps} />)

            expect(getLastMockCall(mockedMenu)[0].activeIndex).toBe(2)
        })
    })
})
