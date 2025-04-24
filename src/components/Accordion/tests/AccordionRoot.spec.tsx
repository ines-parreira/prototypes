import { forwardRef } from 'react'

import { render, screen } from '@testing-library/react'

import { AccordionRoot } from '../components/AccordionRoot'
import { AccordionRootContext } from '../contexts/accordion-root-context'

const MockChild = forwardRef<HTMLDivElement, { id: string }>(({ id }, ref) => {
    return (
        <AccordionRootContext.Consumer>
            {(context) => (
                <div ref={ref} data-testid={`child-${id}`}>
                    {JSON.stringify(context)}
                </div>
            )}
        </AccordionRootContext.Consumer>
    )
})

describe('AccordionRoot', () => {
    it('renders with default props', () => {
        render(
            <AccordionRoot>
                <MockChild id="test" />
            </AccordionRoot>,
        )

        const child = screen.getByTestId('child-test')
        const context = JSON.parse(child.textContent || '{}')

        expect(context.values).toEqual([])
        expect(context.multiple).toBe(true)
        expect(context.disabled).toBe(false)
    })

    it('handles single selection mode', () => {
        const onValueChange = jest.fn()
        render(
            <AccordionRoot multiple={false} onValueChange={onValueChange}>
                <MockChild id="test" />
            </AccordionRoot>,
        )

        const child = screen.getByTestId('child-test')
        const context = JSON.parse(child.textContent || '{}')

        expect(context.multiple).toBe(false)
    })

    it('handles disabled state', () => {
        render(
            <AccordionRoot disabled>
                <MockChild id="test" />
            </AccordionRoot>,
        )

        const child = screen.getByTestId('child-test')
        const context = JSON.parse(child.textContent || '{}')

        expect(context.disabled).toBe(true)
    })

    it('handles initial value', () => {
        const initialValue = ['item1']
        render(
            <AccordionRoot value={initialValue}>
                <MockChild id="test" />
            </AccordionRoot>,
        )

        const child = screen.getByTestId('child-test')
        const context = JSON.parse(child.textContent || '{}')

        expect(context.values).toEqual(initialValue)
    })

    it('applies custom className', () => {
        const { container } = render(
            <AccordionRoot className="custom-class">
                <MockChild id="test" />
            </AccordionRoot>,
        )

        expect(container.firstChild).toHaveClass('custom-class')
    })
})
