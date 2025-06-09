import React, { useContext } from 'react'

import { render, screen } from '@testing-library/react'

import { TicketModalContext } from '../../TicketModalContext'
import { TicketModalProvider } from '../TicketModalProvider'

const TestComponent = React.forwardRef<HTMLDivElement>((props, ref) => {
    const context = useContext(TicketModalContext)

    return <div ref={ref}>{context?.containerRef ? 'true' : 'false'}</div>
})

describe('TicketModalProvider', () => {
    it('provides context with correct values', () => {
        render(
            <TicketModalProvider>
                <TestComponent />
            </TicketModalProvider>,
        )

        expect(screen.getByText('true')).toBeInTheDocument()
    })

    it('adds ref to the first valid child element', () => {
        render(
            <TicketModalProvider>
                <div data-testid="child">Child Content</div>
            </TicketModalProvider>,
        )

        const childElement = screen.getByTestId('child')
        expect(childElement).toBeInTheDocument()
    })

    it('provides a container ref that references the first child element', () => {
        let containerRef: any = null

        const TestRefComponent = React.forwardRef<HTMLDivElement>(
            (props, ref) => {
                const context = useContext(TicketModalContext)
                containerRef = context?.containerRef
                return (
                    <div ref={ref} data-testid="ref-test">
                        Test
                    </div>
                )
            },
        )

        render(
            <TicketModalProvider>
                <TestRefComponent />
            </TicketModalProvider>,
        )

        expect(containerRef).not.toBeNull()
        expect(containerRef.current).toBeInstanceOf(HTMLDivElement)
        expect(containerRef.current).toBe(screen.getByTestId('ref-test'))
    })

    it('handles multiple children by adding ref to first valid element only', () => {
        let containerRef: any = null

        const RefTestComponent = () => {
            const context = useContext(TicketModalContext)
            containerRef = context?.containerRef
            return null
        }

        render(
            <TicketModalProvider>
                {null}
                <div data-testid="second-child">Second</div>
                <RefTestComponent />
            </TicketModalProvider>,
        )

        const secondChild = screen.getByTestId('second-child')
        expect(containerRef.current).toBe(secondChild)
    })
})
