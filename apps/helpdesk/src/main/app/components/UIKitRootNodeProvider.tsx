import React, { ReactNode } from 'react'

import { RootNodeProvider } from '@gorgias/merchant-ui-kit'

import { useAppNode } from 'appNode'

type Props = {
    children?: ReactNode
}

export default function UIKitRootNodeProvider({ children }: Props) {
    const appNode = useAppNode()
    return <RootNodeProvider value={appNode}>{children}</RootNodeProvider>
}
