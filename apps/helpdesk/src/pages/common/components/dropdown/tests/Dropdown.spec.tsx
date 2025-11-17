import type { ComponentProps } from 'react'
import React, { useRef } from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { LegacyButton as Button } from '@gorgias/axiom'

import Dropdown, { DropdownContext } from '../Dropdown'

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
    beforeAll(() => {
        Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
            configurable: true,
            value: function () {
                return {
                    width: parseFloat(this.style.width) || 200,
                    height: 40,
                    top: 0,
                    left: 0,
                    bottom: 40,
                    right: 200,
                    x: 0,
                    y: 0,
                    toJSON: () => {},
                }
            },
        })
    })
    it('should render a dropdown', () => {
        const { container } = render(
            <MockedImplementation>Baz</MockedImplementation>,
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
        const { getByText } = render(
            <MockedImplementation onToggle={mockedOnToggle}>
                Baz
            </MockedImplementation>,
        )

        fireEvent.click(getByText(/Baz/))
        expect(mockedOnToggle).not.toHaveBeenCalled()

        fireEvent.click(screen.getByTestId('floating-overlay'))
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
            </MockedImplementation>,
        )

        expect(screen.getByText(/value/)).toBeTruthy()
        fireEvent.click(screen.getByText(/value/))
        expect(mockedOnToggle).toHaveBeenNthCalledWith(1, false)
    })

    it('should apply matchTriggerWidth style', async () => {
        const targetRef = React.createRef<HTMLDivElement>()

        render(
            <>
                <div ref={targetRef} style={{ width: '123px' }}>
                    Target
                </div>
                <Dropdown
                    isOpen
                    onToggle={jest.fn()}
                    target={targetRef}
                    matchTriggerWidth
                >
                    <div data-testid="floating-content">Content</div>
                </Dropdown>
            </>,
        )

        const floatingElement = await screen.findByTestId('floating-content')

        await waitFor(() => {
            expect(floatingElement.parentElement).toHaveStyle('width: 123px')
        })
    })

    it('should apply minWidth or width based on contained', async () => {
        const targetRef = React.createRef<HTMLDivElement>()

        render(
            <>
                <div ref={targetRef} style={{ width: '200px' }}>
                    Target
                </div>
                <Dropdown
                    isOpen
                    onToggle={jest.fn()}
                    target={targetRef}
                    contained={false}
                >
                    <div data-testid="floating-content">Content</div>
                </Dropdown>
            </>,
        )

        const floatingElement = await screen.findByTestId('floating-content')

        await waitFor(() => {
            expect(floatingElement.parentElement).toHaveStyle(
                'min-width: 200px',
            )
        })
    })
})
