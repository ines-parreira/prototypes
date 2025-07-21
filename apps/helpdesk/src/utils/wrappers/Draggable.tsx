import { ReactNode } from 'react'

import BaseDraggable, {
    DraggableEventHandler,
    DraggableProps,
} from 'react-draggable'

type Props = Partial<DraggableProps> & {
    children: ReactNode
}

export const Draggable = ({ children, ...props }: Props) => {
    return <BaseDraggable {...props}>{children}</BaseDraggable>
}

export type { DraggableProps, DraggableEventHandler }
