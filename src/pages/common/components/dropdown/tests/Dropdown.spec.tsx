import React, {ComponentProps, useRef} from 'react'
import {fireEvent, render, screen} from '@testing-library/react'

import Button from 'pages/common/components/button/Button'

import Dropdown, {DropdownContext} from '../Dropdown'

function MockedImplementation(props: Partial<ComponentProps<typeof Dropdown>>) {
    const targetRef = useRef<HTMLDivElement>(null)

    return (
        <>
            <div>Foo</div>
            <div ref={targetRef}>Bar</div>
            <Dropdown
                isOpen
                onToggle={jest.fn()}
                target={targetRef}
                {...props}
            />
        </>
    )
}

describe('<Dropdown />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render a dropdown', () => {
        const {container} = render(
            <MockedImplementation>Baz</MockedImplementation>
        )

        expect(container.parentElement).toMatchSnapshot()
    })

    it('should not render a dropdown when is not opened', () => {
        render(<MockedImplementation isOpen={false}>Baz</MockedImplementation>)

        expect(screen.queryByText(/foo/)).toBeFalsy()
    })

    it('should not render a dropdown when is disabled', () => {
        render(<MockedImplementation isDisabled>Baz</MockedImplementation>)

        expect(screen.queryByText(/foo/)).toBeFalsy()
    })

    it('should call onToggle when clicked outside of the dropdown', () => {
        const mockedOnToggle = jest.fn()
        const {getByText} = render(
            <MockedImplementation onToggle={mockedOnToggle}>
                Baz
            </MockedImplementation>
        )

        const floatingOverlay =
            document.getElementById('floating-ui-root')?.firstChild
        fireEvent.click(getByText(/Baz/))
        expect(mockedOnToggle).not.toHaveBeenCalled()
        fireEvent.click(floatingOverlay!)
        expect(mockedOnToggle).toHaveBeenNthCalledWith(1, false)
    })

    it('should pass a context down', () => {
        const mockedOnToggle = jest.fn()
        render(
            <MockedImplementation onToggle={mockedOnToggle} value="value">
                <DropdownContext.Consumer>
                    {(context) =>
                        context && (
                            <Button
                                onClick={() =>
                                    context.onToggle && context.onToggle(false)
                                }
                            >
                                {context.value}
                            </Button>
                        )
                    }
                </DropdownContext.Consumer>
            </MockedImplementation>
        )

        expect(screen.getByText(/value/)).toBeTruthy()
        fireEvent.click(screen.getByText(/value/))
        expect(mockedOnToggle).toHaveBeenNthCalledWith(1, false)
    })
})
