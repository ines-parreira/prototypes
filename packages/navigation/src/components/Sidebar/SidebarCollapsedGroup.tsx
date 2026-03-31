import type { ReactNode } from 'react'

import { ButtonGroup } from '@gorgias/axiom'

export type SidebarCollapsedGroupProps = {
    children: ReactNode
    selectedKey?: string
    onSelectionChange?: (selectedKey: string) => void
}

export function SidebarCollapsedGroup({
    children,
    selectedKey,
    onSelectionChange,
}: SidebarCollapsedGroupProps) {
    return (
        <ButtonGroup
            size="lg"
            orientation="vertical"
            withoutBorder
            selectedKey={selectedKey}
            onSelectionChange={onSelectionChange}
        >
            {children}
        </ButtonGroup>
    )
}
