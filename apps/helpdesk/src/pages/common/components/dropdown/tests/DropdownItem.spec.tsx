import type { ContextType, ReactNode } from 'react'
import type React from 'react'
import { useRef } from 'react'

import { fireEvent, render } from '@testing-library/react'

import { DropdownContext } from '../Dropdown'
import type { Props as DropdownItemProps } from '../DropdownItem'
import DropdownItem from '../DropdownItem'

jest.mock('react', () => ({
    ...jest.requireActual<typeof React>('react'),
    useRef: jest.fn().mockReturnValue({ current: null }),
}))
;(useRef as jest.Mock).mockImplementation(
    jest.requireActual<typeof React>('react')['useRef'],
)

const minProps = {
    onClick: jest.fn(),
    option: { label: 'Foo', value: 'foo' },
}

const mockContext: ContextType<typeof DropdownContext> = {
    isMultiple: false,
    value: null,
    query: '',
    onToggle: jest.fn(),
    getHighlightedLabel: jest.fn().mockImplementation((value: string) => value),
    onQueryChange: jest.fn(),
}

const MockedComponent = (
    props: DropdownItemProps<string>,
    context: ContextType<typeof DropdownContext>,
) => {
    return (
        <DropdownContext.Provider value={context}>
            <DropdownItem {...props} />
        </DropdownContext.Provider>
    )
}

describe('<DropdownItem />', () => {
    it('should render', () => {
        const { container } = render(MockedComponent(minProps, mockContext))

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render if the item value is not contained in the context query', () => {
        const { container } = render(
            MockedComponent(minProps, { ...mockContext, query: 'bar' }),
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render if the item value is not contained in the context query but is always visible', () => {
        const { getByText } = render(
            MockedComponent(
                { ...minProps, alwaysVisible: true },
                { ...mockContext, query: 'bar' },
            ),
        )

        expect(getByText(/Foo/)).toBeInTheDocument()
    })

    it('should render with result of getHighlightedLabel', () => {
        const { getByText } = render(
            MockedComponent(minProps, {
                ...mockContext,
                getHighlightedLabel: jest
                    .fn()
                    .mockImplementation(() => 'highlight'),
            }),
        )

        expect(getByText(/highlight/)).toBeInTheDocument()
    })

    it('should render with custom children passed', () => {
        const childrenMock = 'FooChildren'
        const { getByText } = render(
            <DropdownContext.Provider value={mockContext}>
                <DropdownItem {...minProps}>{childrenMock}</DropdownItem>
            </DropdownContext.Provider>,
        )

        expect(getByText(childrenMock)).toBeInTheDocument()
    })

    it('should render with custom children function passed', () => {
        const { getByText } = render(
            <DropdownContext.Provider
                value={{
                    ...mockContext,
                    getHighlightedLabel: jest
                        .fn()
                        .mockImplementation(() => 'highlight'),
                }}
            >
                <DropdownItem {...minProps}>
                    {(highlightedLabel: ReactNode) =>
                        `custom ${highlightedLabel}`
                    }
                </DropdownItem>
            </DropdownContext.Provider>,
        )

        expect(getByText(/custom highlight/)).toBeTruthy()
    })

    it('should render with custom children passed that are neither a string nor a function', () => {
        const { getByText } = render(
            <DropdownContext.Provider value={mockContext}>
                <DropdownItem {...minProps}>{Number(88)}</DropdownItem>
            </DropdownContext.Provider>,
        )

        expect(getByText(Number(88))).toBeInTheDocument()
    })

    it('should render with any HTML tag passed as tag', () => {
        const { container } = render(
            MockedComponent({ ...minProps, tag: 'div' }, mockContext),
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render when selected', () => {
        const { getByText } = render(
            MockedComponent(minProps, {
                ...mockContext,
                value: minProps.option.value,
            }),
        )

        expect(getByText('done')).toBeInTheDocument()
    })

    it('should render when selected and multiple selection is enabled', () => {
        const { container } = render(
            MockedComponent(minProps, {
                ...mockContext,
                value: minProps.option.value,
                isMultiple: true,
            }),
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call onClick when clicked and pass the option value', () => {
        const { container } = render(MockedComponent(minProps, mockContext))

        fireEvent.click(container.firstChild!)
        expect(minProps.onClick).toHaveBeenCalledWith(minProps.option.value)
    })

    it('should not call onClick when it is disabled', () => {
        const { container } = render(
            MockedComponent({ ...minProps, isDisabled: true }, mockContext),
        )

        fireEvent.click(container.firstChild!)
        expect(minProps.onClick).not.toHaveBeenCalled()
    })

    it('should call the context toggle when clicked and when shouldCloseOnSelect is passed', () => {
        const { container } = render(
            MockedComponent(
                { ...minProps, shouldCloseOnSelect: true },
                mockContext,
            ),
        )

        fireEvent.click(container.firstChild!)
        expect(mockContext.onToggle).toHaveBeenCalledWith(false)
    })

    it('should call onClick when enter key is pressed and pass the option value', () => {
        const { container } = render(MockedComponent(minProps, mockContext))

        fireEvent.keyDown(container.firstChild!, { key: 'Enter' })
        expect(minProps.onClick).toHaveBeenCalledWith(minProps.option.value)
    })

    it('should not call onClick when when enter key is pressed if it is disabled', () => {
        const { container } = render(
            MockedComponent({ ...minProps, isDisabled: true }, mockContext),
        )

        fireEvent.keyDown(container.firstChild!, { key: 'Enter' })
        expect(minProps.onClick).not.toHaveBeenCalled()
    })

    it('should call the context toggle when enter key is pressed and when shouldCloseOnSelect is passed', () => {
        const { container } = render(
            MockedComponent(
                { ...minProps, shouldCloseOnSelect: true },
                mockContext,
            ),
        )

        fireEvent.keyDown(container.firstChild!, { key: 'Enter' })
        expect(mockContext.onToggle).toHaveBeenCalledWith(false)
    })

    it('should allow keyboard navigation', () => {
        const { container } = render(
            <DropdownContext.Provider value={mockContext}>
                <DropdownItem {...minProps} />
                <DropdownItem
                    {...minProps}
                    option={{ label: 'Bar', value: 'bar' }}
                />
            </DropdownContext.Provider>,
        )

        fireEvent.keyDown(container.firstChild!, { key: 'ArrowDown' })
        expect(container.lastChild).toHaveFocus()
        fireEvent.keyDown(container.lastChild!, { key: 'ArrowUp' })
        expect(container.firstChild).toHaveFocus()
        fireEvent.keyDown(container.firstChild!, { key: 'ArrowUp' })
        expect(container.lastChild).toHaveFocus()
        fireEvent.keyDown(container.lastChild!, { key: 'ArrowUp' })
        expect(container.firstChild).toHaveFocus()
    })

    it('should early exit if onKeyDown callback is provided', () => {
        const onKeyDown = jest.fn()
        const { getByText } = render(
            <DropdownContext.Provider value={mockContext}>
                <DropdownItem {...minProps} />
                <DropdownItem
                    {...minProps}
                    option={{ label: 'Bar', value: 'bar' }}
                    onKeyDown={onKeyDown}
                />
            </DropdownContext.Provider>,
        )

        fireEvent.keyDown(getByText(/Foo/), { key: 'ArrowDown' })
        expect(getByText(/Bar/)).toHaveFocus()
        fireEvent.keyDown(getByText(/Bar/), { key: 'ArrowDown' })
        expect(onKeyDown).toHaveBeenCalled()
        expect(getByText(/Foo/)).not.toHaveFocus()
    })

    it('should render a selection icon', () => {
        const { getByText } = render(
            MockedComponent(
                { ...minProps, option: { value: 'x', label: 'x' } },
                { ...mockContext, value: 'x' },
            ),
        )

        expect(getByText('done')).toBeInTheDocument()
    })

    it('should not render the selection icon when disabled', () => {
        const { queryByText } = render(
            MockedComponent(
                {
                    ...minProps,
                    option: { value: 'x', label: 'x' },
                    isDisabled: true,
                },
                { ...mockContext, value: 'x' },
            ),
        )

        expect(queryByText('done')).not.toBeInTheDocument()
    })
})
