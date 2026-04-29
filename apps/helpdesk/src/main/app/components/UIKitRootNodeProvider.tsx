import type { ReactNode } from 'react'

import { history } from '@repo/routing'
import { useHref } from 'react-router-dom-v5-compat'

import { AxiomProvider } from '@gorgias/axiom'

import { useAppNode } from 'appNode'

type Props = {
    children?: ReactNode
}

const navigate = (path: string) => {
    history.push(path)
}

export default function UIKitRootNodeProvider({ children }: Props) {
    const appNode = useAppNode()

    return (
        <AxiomProvider rootNode={appNode} navigate={navigate} useHref={useHref}>
            {children}
        </AxiomProvider>
    )
}
