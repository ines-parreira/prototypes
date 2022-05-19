import React, {ComponentProps, ContextType} from 'react'
import {fireEvent, render} from '@testing-library/react'

import DropdownItem from '../DropdownItem'
import {DropdownContext} from '../Dropdown'

const minProps = {
    onClick: jest.fn(),
    option: {label: 'Foo', value: 'foo'},
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
    props: ComponentProps<typeof DropdownItem>,
    context: ContextType<typeof DropdownContext>
) => {
    return (
        <DropdownContext.Provider value={context}>
            <DropdownItem {...props} />
        </DropdownContext.Provider>
    )
}

describe('<DropdownItem />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render', () => {
        const {container} = render(MockedComponent(minProps, mockContext))

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render if the item value is not contained in the context query', () => {
        const {container} = render(
            MockedComponent(minProps, {...mockContext, query: 'bar'})
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with result of getHighlightedLabel', () => {
        const {getByText} = render(
            MockedComponent(minProps, {
                ...mockContext,
                getHighlightedLabel: jest
                    .fn()
                    .mockImplementation(() => 'highlight'),
            })
        )

        expect(getByText(/highlight/)).toBeTruthy()
    })

    it('should render with custom children passed', () => {
        const {container} = render(
            <DropdownContext.Provider value={mockContext}>
                <DropdownItem {...minProps}>FooChildren</DropdownItem>
            </DropdownContext.Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with custom children function passed', () => {
        const {getByText} = render(
            <DropdownContext.Provider
                value={{
                    ...mockContext,
                    getHighlightedLabel: jest
                        .fn()
                        .mockImplementation(() => 'highlight'),
                }}
            >
                <DropdownItem {...minProps}>
                    {(highlightedLabel: string) => `custom ${highlightedLabel}`}
                </DropdownItem>
            </DropdownContext.Provider>
        )

        expect(getByText(/custom highlight/)).toBeTruthy()
    })

    it('should render with custom children passed that are neither a string nor a function', () => {
        const {container} = render(
            <DropdownContext.Provider value={mockContext}>
                <DropdownItem {...minProps}>{Number(88)}</DropdownItem>
            </DropdownContext.Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with any HTML tag passed as tag', () => {
        const {container} = render(
            MockedComponent({...minProps, tag: 'div'}, mockContext)
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with checkbox when multiple selection is enabled', () => {
        const {container} = render(
            MockedComponent(minProps, {...mockContext, isMultiple: true})
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render when selected', () => {
        const {container} = render(
            MockedComponent(minProps, {
                ...mockContext,
                value: minProps.option.value,
            })
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render when selected and multiple selection is enabled', () => {
        const {container} = render(
            MockedComponent(minProps, {
                ...mockContext,
                value: minProps.option.value,
                isMultiple: true,
            })
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call onClick when clicked and pass the option value', () => {
        const {container} = render(MockedComponent(minProps, mockContext))

        fireEvent.click(container.firstChild!)
        expect(minProps.onClick).toHaveBeenCalledWith(minProps.option.value)
    })

    it('should call the context toggle when clicked and when shouldCloseOnSelect is passed', () => {
        const {container} = render(
            MockedComponent(
                {...minProps, shouldCloseOnSelect: true},
                mockContext
            )
        )

        fireEvent.click(container.firstChild!)
        expect(mockContext.onToggle).toHaveBeenCalledWith(false)
    })

    it('should call onClick when enter key is pressed and pass the option value', () => {
        const {container} = render(MockedComponent(minProps, mockContext))

        fireEvent.keyDown(container.firstChild!, {key: 'Enter'})
        expect(minProps.onClick).toHaveBeenCalledWith(minProps.option.value)
    })

    it('should call the context toggle when enter key is pressed and when shouldCloseOnSelect is passed', () => {
        const {container} = render(
            MockedComponent(
                {...minProps, shouldCloseOnSelect: true},
                mockContext
            )
        )

        fireEvent.keyDown(container.firstChild!, {key: 'Enter'})
        expect(mockContext.onToggle).toHaveBeenCalledWith(false)
    })

    it('should allow keyboard navigation', () => {
        const {container} = render(
            <DropdownContext.Provider value={mockContext}>
                <DropdownItem {...minProps} />
                <DropdownItem
                    {...minProps}
                    option={{label: 'Bar', value: 'bar'}}
                />
            </DropdownContext.Provider>
        )

        fireEvent.keyDown(container.firstChild!, {key: 'ArrowDown'})
        expect(container.lastChild).toEqual(document.activeElement)
        fireEvent.keyDown(container.lastChild!, {key: 'ArrowUp'})
        expect(container.firstChild).toEqual(document.activeElement)
    })
})
