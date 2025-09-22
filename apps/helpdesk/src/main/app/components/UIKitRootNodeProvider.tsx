import { ReactNode } from 'react'

import { AxiomProvider } from '@gorgias/axiom'

import { useAppNode } from 'appNode'

type Props = {
    children?: ReactNode
}

export default function UIKitRootNodeProvider({ children }: Props) {
    const appNode = useAppNode()
    return <AxiomProvider rootNode={appNode}>{children}</AxiomProvider>
}
