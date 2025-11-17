import type { ReactNode } from 'react'

import type { DraggableEventHandler, DraggableProps } from 'react-draggable'
import BaseDraggable from 'react-draggable'

type Props = Partial<DraggableProps> & {
    children: ReactNode
}

export const Draggable = ({ children, ...props }: Props) => {
    return <BaseDraggable {...props}>{children}</BaseDraggable>
}

export type { DraggableProps, DraggableEventHandler }
