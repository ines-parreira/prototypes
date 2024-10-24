import {RootNodeProvider} from '@gorgias/ui-kit'
import React, {ReactNode} from 'react'

import {useAppNode} from 'appNode'

type Props = {
    children?: ReactNode
}

export default function UIKitRootNodeProvider({children}: Props) {
    const appNode = useAppNode()
    return <RootNodeProvider value={appNode}>{children}</RootNodeProvider>
}
