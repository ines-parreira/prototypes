import React, {ReactNode} from 'react'

import {AppendPosition} from './Group'

type Props = {
    appendPosition?: AppendPosition
    children: (appendPosition?: AppendPosition) => ReactNode
}

export default function GroupItem({appendPosition, children}: Props) {
    return <>{children(appendPosition)}</>
}

GroupItem.displayName = 'GroupItem'
