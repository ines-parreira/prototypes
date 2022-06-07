import React, {ComponentProps, useRef, useState} from 'react'
import {fireEvent, render} from '@testing-library/react'

import Dropdown, {DropdownContext} from '../Dropdown'
import DropdownSearch from '../DropdownSearch'

const MockedComponent = (props: ComponentProps<typeof DropdownSearch>) => {
    const targetRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(true)
    const options = ['Foo', 'Bar', 'Baz']

    return (
        <>
            <div ref={targetRef} />
            <Dropdown isOpen={isOpen} onToggle={jest.fn()} target={targetRef}>
                <DropdownSearch {...props} />

                <DropdownContext.Consumer>
                    {(context) => {
                        if (!context) {
                            return
                        }

                        return options.map(
                            (option) =>
                                option
                                    .toLowerCase()
                                    .includes(
                                        context.query.toLocaleLowerCase()
                                    ) && (
                                    <div key={option} data-testid="option">
                                        {context.getHighlightedLabel(option)}
                                    </div>
                                )
                        )
                    }}
                </DropdownContext.Consumer>
            </Dropdown>
            <div onClick={() => setIsOpen(!isOpen)}>toggle</div>
        </>
    )
}

describe('<DropdownSearch />', () => {
    it('should render', () => {
        const {container} = render(<MockedComponent />)

        expect(container.parentElement).toMatchSnapshot()
    })

    it('should throw an error if not used inside a DropdownContextProvider', () => {
        expect(() => render(<DropdownSearch />)).toThrow()
    })

    it('should filter and highlight the results when searching', () => {
        const {getAllByTestId, getByPlaceholderText} = render(
            <MockedComponent />
        )

        fireEvent.change(getByPlaceholderText(/Search/), {
            target: {value: 'ba'},
        })
        expect(getAllByTestId('option')).toMatchSnapshot()
    })

    it('should be controllable', () => {
        function MockedControlledComponent(
            props: ComponentProps<typeof MockedComponent>
        ) {
            const [value, setValue] = useState('')

            return (
                <MockedComponent
                    {...props}
                    onChange={(nextValue) => setValue(nextValue.toUpperCase())}
                    value={value}
                />
            )
        }

        const {getAllByTestId, getByPlaceholderText} = render(
            <MockedControlledComponent />
        )

        fireEvent.change(getByPlaceholderText(/Search/), {
            target: {value: 'ba'},
        })
        expect(getAllByTestId('option')).toMatchSnapshot()
    })

    it('should clear the query when unmounting', () => {
        const {getAllByTestId, getByPlaceholderText, getByText} = render(
            <MockedComponent />
        )

        fireEvent.change(getByPlaceholderText(/Search/), {
            target: {value: 'ba'},
        })
        fireEvent.click(getByText(/toggle/))
        fireEvent.click(getByText(/toggle/))
        expect(getAllByTestId('option')).toMatchSnapshot()
    })
})
