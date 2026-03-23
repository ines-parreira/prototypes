import type { ReactNode } from 'react'

import { Button } from '@gorgias/axiom'

import css from './editPanels/IntermediateEditPanel.less'

type EditableActionRowProps = {
    label: ReactNode
    editAriaLabel: string
    deleteAriaLabel: string
    onEdit: () => void
    onDelete: () => Promise<void>
}

export function EditableActionRow({
    label,
    editAriaLabel,
    deleteAriaLabel,
    onEdit,
    onDelete,
}: EditableActionRowProps) {
    async function handleDelete() {
        await onDelete()
    }

    return (
        <div className={css.actionRow}>
            {label}
            <div className={css.actionControls}>
                <Button
                    size="sm"
                    variant="tertiary"
                    icon="edit"
                    aria-label={editAriaLabel}
                    onClick={onEdit}
                />
                <Button
                    size="sm"
                    variant="tertiary"
                    icon="trash-empty"
                    intent="destructive"
                    aria-label={deleteAriaLabel}
                    onClick={handleDelete}
                />
            </div>
        </div>
    )
}
