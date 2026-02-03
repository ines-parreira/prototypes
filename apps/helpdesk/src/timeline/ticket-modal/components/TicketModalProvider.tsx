import type { FC, ReactNode } from 'react'
import { useRef } from 'react'

import { TicketModalContext } from '../TicketModalContext'

import css from './TicketModalProvider.less'

interface TicketModalProviderProps {
    children: ReactNode
    isInsideSidePanel?: boolean
}

export const TicketModalProvider: FC<TicketModalProviderProps> = ({
    children,
    isInsideSidePanel = false,
}) => {
    const containerRef = useRef<HTMLDivElement>(null)

    const contextValue = {
        isInsideTicketModal: true,
        containerRef,
        isInsideSidePanel,
    }

    return (
        <TicketModalContext.Provider value={contextValue}>
            <div ref={containerRef} className={css.container}>
                {children}
            </div>
        </TicketModalContext.Provider>
    )
}
