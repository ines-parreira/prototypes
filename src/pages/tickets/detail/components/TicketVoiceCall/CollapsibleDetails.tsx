import React, { useState } from 'react'

import ControlledCollapsibleDetails from './ControlledCollapsibleDetails'

type Props = {
    title: JSX.Element
    children: React.ReactNode
}

export default function CollapsibleDetails({ title, children }: Props) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <ControlledCollapsibleDetails
            title={title}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        >
            {children}
        </ControlledCollapsibleDetails>
    )
}
