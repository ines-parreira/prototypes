import type { RefObject } from 'react'

import type { App } from 'pages/automate/actionsPlatform/types'
import { useReorderDnD } from 'pages/common/hooks/useReorderDnD'

import { StepCard } from '../StepCard'

type Props = {
    index: number
    app: App
    stepName: string
    onDelete: () => void
    onClick?: () => void
    onMove: (dragIndex: number, hoverIndex: number) => void
    onDrop: () => void
    onCancel: () => void
}

const DND_TYPE = 'action-step'

export const ActionStepRow = ({
    index,
    app,
    stepName,
    onDelete,
    onClick,
    onMove,
    onDrop,
    onCancel,
}: Props) => {
    const { dragRef, dropRef, handlerId, isDragging } = useReorderDnD(
        { type: DND_TYPE, position: index },
        [DND_TYPE],
        { onHover: onMove, onDrop, onCancel },
    )

    return (
        <StepCard
            appName={app.name}
            appIconUrl={app.icon}
            stepName={stepName}
            onDelete={onDelete}
            onClick={onClick}
            dragHandleLabel={`Reorder ${app.name} ${stepName} step`}
            deleteLabel={`Delete ${app.name} ${stepName} step`}
            dragHandleRef={dragRef as RefObject<HTMLButtonElement>}
            rowRef={dropRef as RefObject<HTMLDivElement>}
            rowStyle={{ opacity: isDragging ? 0 : 1 }}
            rowDataHandlerId={handlerId}
        />
    )
}
