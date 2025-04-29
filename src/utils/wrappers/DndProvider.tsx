import { ReactNode } from 'react'

import { BackendFactory, DragDropManager } from 'dnd-core'
import { DndProvider as BaseDndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

type Props = {
    children: ReactNode
    backend?: BackendFactory
    manager?: DragDropManager
}

export const DndProvider = ({
    children,
    backend = HTML5Backend,
    manager,
}: Props) => {
    if (manager) {
        return <BaseDndProvider manager={manager}>{children}</BaseDndProvider>
    }

    return <BaseDndProvider backend={backend}>{children}</BaseDndProvider>
}
