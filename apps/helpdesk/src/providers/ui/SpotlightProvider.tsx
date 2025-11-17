import type { ReactNode } from 'react'
import React, { useState } from 'react'

import { SpotlightContext } from 'providers/ui/SpotlightContext'

type Props = {
    children: ReactNode
}
export const SpotlightProvider = ({ children }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <SpotlightContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </SpotlightContext.Provider>
    )
}
