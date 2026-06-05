import type { ReactNode } from 'react'

import { Panel } from '@gorgias/axiom'
import type { PanelProps } from '@gorgias/axiom'

type Props = Omit<PanelProps, 'children' | 'h' | 'height'> & {
    children: ReactNode
}

export function FullHeightPanel({ children, ...props }: Props) {
    return (
        <Panel
            flexDirection="column"
            w="100%"
            h="100%"
            minHeight={0}
            overflow="auto"
            withoutBorder
            {...props}
        >
            {children}
        </Panel>
    )
}
