import type { ReactNode } from 'react'
import React, { useRef } from 'react'

import { TicketModalContext } from '../TicketModalContext'

interface TicketModalProviderProps {
    children: ReactNode
}

export const TicketModalProvider: React.FC<TicketModalProviderProps> = ({
    children,
}) => {
    const containerRef = useRef<HTMLElement>(null)

    // Add a ref to the first eligible child element
    let refIsSet = false
    const childrenWithRef = React.Children.map(children, (child) => {
        if (!refIsSet && React.isValidElement(child)) {
            refIsSet = true
            return React.cloneElement(child, {
                ref: containerRef,
                ...child.props,
            })
        }
        return child
    })

    const contextValue = {
        isInsideTicketModal: true,
        containerRef,
    }

    return (
        <TicketModalContext.Provider value={contextValue}>
            {childrenWithRef}
        </TicketModalContext.Provider>
    )
}
