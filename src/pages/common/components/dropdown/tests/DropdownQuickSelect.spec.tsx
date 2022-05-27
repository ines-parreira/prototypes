import React, {ComponentProps, ContextType} from 'react'
import {fireEvent, render} from '@testing-library/react'

import {DropdownContext} from '../Dropdown'
import DropdownQuickSelect from '../DropdownQuickSelect'

const minProps = {
    count: 2,
    onRemoveAll: jest.fn(),
    onSelectAll: jest.fn(),
    values: ['tacos', 'pizza'],
}

const mockContext: ContextType<typeof DropdownContext> = {
    isMultiple: true,
    value: null,
    query: '',
    onToggle: jest.fn(),
    getHighlightedLabel: jest.fn(),
    onQueryChange: jest.fn(),
}

const MockedComponent = (
    props: ComponentProps<typeof DropdownQuickSelect>,
    context: ContextType<typeof DropdownContext>
) => {
    return (
        <DropdownContext.Provider value={context}>
            <DropdownQuickSelect {...props} />
        </DropdownContext.Provider>
    )
}

describe('<DropdownQuickSelect />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render', () => {
        const {container} = render(MockedComponent(minProps, mockContext))

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should throw an error if not used inside a DropdownContextProvider', () => {
        expect(() => render(<DropdownQuickSelect {...minProps} />)).toThrow()
    })

    it('should call onSelectAll when clicking on the unselected component', () => {
        const {container} = render(MockedComponent(minProps, mockContext))

        fireEvent.click(container.firstChild!)
        expect(minProps.onSelectAll).toHaveBeenCalled()
    })

    it('should call onRemoveAll when clicking on the selected component', () => {
        const {container} = render(
            MockedComponent(minProps, {
                ...mockContext,
                value: ['tacos', 'pizza'],
            })
        )

        fireEvent.click(container.firstChild!)
        expect(minProps.onRemoveAll).toHaveBeenCalled()
    })

    it('should call onRemoveAll when clicking on the partially selected component', () => {
        const {container} = render(
            MockedComponent(minProps, {
                ...mockContext,
                value: ['tacos'],
            })
        )

        fireEvent.click(container.firstChild!)
        expect(minProps.onRemoveAll).toHaveBeenCalled()
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
})
