import {fireEvent, render, screen} from '@testing-library/react'
import React, {ComponentProps, useRef} from 'react'

import Popover from '../Popover'

const mockSetIsOpen = jest.fn()

function PopoverWithTarget(props?: Partial<ComponentProps<typeof Popover>>) {
    const targetRef = useRef<HTMLDivElement>(null)

    return (
        <>
            <div>Outside</div>
            <div ref={targetRef}>Anchor</div>
            <Popover
                isOpen
                setIsOpen={mockSetIsOpen}
                target={targetRef}
                {...props}
            />
        </>
    )
}

describe('<Popover />', () => {
    it('should render a popover', () => {
        const children = 'Content'
        render(<PopoverWithTarget>{children}</PopoverWithTarget>)

        expect(screen.getByText(children)).toBeInTheDocument()
    })

    it('should not render a popover when it is not opened', () => {
        const children = 'Content'
        render(<PopoverWithTarget isOpen={false}>{children}</PopoverWithTarget>)

        expect(screen.queryByText(children)).not.toBeInTheDocument()
    })

    it('should trigger callback on button click', () => {
        const onClick = jest.fn()
        render(
            <PopoverWithTarget
                buttonProps={{
                    onClick,
                }}
            />
        )

        fireEvent.click(screen.getByText('Confirm'))
        expect(onClick).toHaveBeenCalled()
    })

    it('should custom button text', () => {
        const onClick = jest.fn()
        const children = 'Delete rule'
        render(
            <PopoverWithTarget
                buttonProps={{
                    children,
                    onClick,
                }}
            />
        )

        expect(screen.getByText(children)).toBeInTheDocument()
        fireEvent.click(screen.getByText(children))
        expect(onClick).toHaveBeenCalled()
    })

    it('should render custom footer', () => {
        const footer = 'Custom buttons'
        render(<PopoverWithTarget footer={footer} />)

        expect(screen.getByText(footer)).toBeInTheDocument()
    })
})
