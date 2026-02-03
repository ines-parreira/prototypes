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

    it('wraps children in a container element', () => {
        render(
            <TicketModalProvider>
                <div data-testid="child">Child Content</div>
            </TicketModalProvider>,
        )

        const childElement = screen.getByTestId('child')
        expect(childElement).toBeInTheDocument()
        expect(childElement.parentElement).toHaveClass('container')
    })

    it('provides a container ref that references the wrapper element', () => {
        let containerRef: any = null

        const TestRefComponent = () => {
            const context = useContext(TicketModalContext)
            containerRef = context?.containerRef
            return <div data-testid="child-element">Test</div>
        }

        render(
            <TicketModalProvider>
                <TestRefComponent />
            </TicketModalProvider>,
        )

        expect(containerRef).not.toBeNull()
        expect(containerRef.current).toBeInstanceOf(HTMLDivElement)
        expect(containerRef.current).toHaveClass('container')

        const childElement = screen.getByTestId('child-element')
        expect(containerRef.current).toContainElement(childElement)
    })

    it('provides isInsideSidePanel as false by default', () => {
        let contextValue: any = null

        const TestContextComponent = () => {
            contextValue = useContext(TicketModalContext)
            return null
        }

        render(
            <TicketModalProvider>
                <TestContextComponent />
            </TicketModalProvider>,
        )

        expect(contextValue).not.toBeNull()
        expect(contextValue.isInsideSidePanel).toBe(false)
    })

    it('provides isInsideSidePanel as true when prop is set', () => {
        let contextValue: any = null

        const TestContextComponent = () => {
            contextValue = useContext(TicketModalContext)
            return null
        }

        render(
            <TicketModalProvider isInsideSidePanel={true}>
                <TestContextComponent />
            </TicketModalProvider>,
        )

        expect(contextValue).not.toBeNull()
        expect(contextValue.isInsideSidePanel).toBe(true)
    })
})
