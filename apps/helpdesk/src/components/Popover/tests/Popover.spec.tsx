import { ComponentProps, useRef } from 'react'

import { shift } from '@floating-ui/react'
import { fireEvent, render, screen } from '@testing-library/react'

import * as themeModule from 'core/theme'

import Popover from '../Popover'

const mockSetIsOpen = jest.fn()

jest.spyOn(themeModule, 'useTheme').mockReturnValue({
    resolvedName: 'dark',
    tokens: {
        Neutral: {
            Grey_0: { value: '#ffffff' },
            Grey_2: { value: '#cccccc' },
        },
    },
} as any)

jest.mock('@floating-ui/react', () => {
    const actual = jest.requireActual('@floating-ui/react')
    const React = require('react')
    const FloatinArrowMock = React.forwardRef(
        (
            props: { stoke?: string; 'stroke-width:'?: string },
            ref: React.RefObject<HTMLDivElement>,
        ) => <div ref={ref} data-testid="popover-arrow" {...props} />,
    )
    return {
        ...actual,
        FloatingArrow: FloatinArrowMock,
        shift: jest.fn(actual.shift),
    }
})

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
            />,
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
            />,
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

    it('should not render arrow when showArrow is false', () => {
        render(<PopoverWithTarget showArrow={false} />)
        expect(screen.queryByTestId('popover-arrow')).not.toBeInTheDocument()
    })

    it('should render arrow when showArrow is true', () => {
        render(<PopoverWithTarget showArrow />)
        expect(screen.getByTestId('popover-arrow')).toBeInTheDocument()
    })

    it('should call shift with undefined when shiftOptions are not provided', () => {
        render(<PopoverWithTarget />)
        expect(shift).toHaveBeenCalledWith(undefined)
    })

    it('should pass shiftOptions to shift middleware', () => {
        const shiftOptions = { padding: 12 }
        render(<PopoverWithTarget shiftOptions={shiftOptions} />)
        expect(shift).toHaveBeenCalledWith(shiftOptions)
    })

    it('should apply stroke props to FloatingArrow when theme is dark', () => {
        render(<PopoverWithTarget />)

        const arrow = screen.getByTestId('popover-arrow')
        expect(arrow).toHaveAttribute('stroke', '#cccccc')
        expect(arrow).toHaveAttribute('stroke-width', '1')
    })
})
